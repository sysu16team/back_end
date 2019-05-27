const TRModel = require('../modules/trModel');
// Get username from session.
const getUsernameFromCtx = require('./cookieController').getUsernameFromCtx;
const checkUndefined = require('../utils/url_params_utils').checkUndefined;
const FileController = require('../controller/fileController');
const path = require('path');
const TaskModel = require('../modules/taskModel');
const ToastModel = require('../modules/toastModel');
const ToastInfo = require('../utils/toast_info');
const UserModel = require('../modules/userModel');

require('../config/basicStr');

class TRController {
    /**
     * 创建team
     * @param ctx
     * @returns {Promise.<void>}
     */
    static async recieveATask(ctx) {
        let post_body = ctx.request.body
        let result = undefined
        let required_param_list = ['task_id']
        let current_user = await getUsernameFromCtx(ctx)
        if (checkUndefined(post_body, required_param_list)) {
            if (current_user == -1 || current_user == -2) {
                result = {
                    code: 401,
                    msg: "Should login first",
                    data: []
                }
            } else {
                let username = current_user;
                let task_id = post_body.task_id;
                try {
                    await TRModel.receiveTask(username, task_id);
                    let data = await TRModel.searchByTaskId(task_id);
                    result = {
                        code: 200,
                        msg: "Success, result as below",
                        data: data
                    }
                } catch (err) {
                    if (err.name == 'SequelizeUniqueConstraintError') {
                        result = {
                            code: 500,
                            msg: "Constrait error, cannot recieve a task twice",
                            data: []
                        }
                    } else {
                        console.log(err)
                        result = {
                            code: 500,
                            msg: "Params wrong, or constrait did not pass (already recieved, cannot receive again).",
                            data: err.message
                        }
                    }
                }
            }  
        } else {
            result = {
                code: 412,
                msg: "Params wrong, API denied",
                data: []
            }
        }

        ctx.response.status = result.code
        ctx.body = {
            code: result.code,
            msg: result.msg,
            data: result.data
        }

        let task = await TaskModel.searchTaskById(post_body.task_id)
        console.log(task.get('task_id'))
        ToastModel.createToast(task.get('publisher'), 10, ToastInfo.t10(task.get('title'),
            post_body.username), post_body.username, null, null,
            post_body.task_id, task.get('title'));
    }

    /**
     * 获取文章详情
     * @param ctx
     * @returns {Promise.<void>}
     */
    static async searchByTaskId(ctx) {
        let result = undefined
        if (ctx.query.task_id) {
            let task_id = ctx.query.task_id
            try {
                let data = await TRModel.searchByTaskId(task_id);
                result = {
                    code: 200, 
                    msg: 'Success',
                    data: data
                }
            } catch (err) {
                result = {
                    code: 500,
                    msg: 'Failed',
                    data: err
                }
            }
        } else {
            result = {
                code: 412,
                msg: "Params not enough",
                data: []
            }
        }

        ctx.response.status  =  result.code
        ctx.body = {
            code: result.code,
            msg: result.msg,
            data: result.data
        }
    }

    static async searchTRByOrganization(ctx) {
        let query_params = ctx.query
        let result = undefined
        let required_param_list = ['orgname', 'username'];
    
        if (checkUndefined(query_params, required_param_list)) {
            let restrictions = {
                type: query_params.type
            }
            try {
                result = await TRModel.searchTRByOrganization(query_params.orgname, query_params.username, restrictions);
                result = {
                    code: 200,
                    msg: "Success",
                    data: result
                }
            } catch (err) {
                result = {
                    code: 500,
                    msg: "Failed",
                    data: err.message
                }
                console.log(err)
            }
        } else {
            result = {
                code: 412,
                msg: "Params are not enough",
                data: []
            }
        }

        ctx.response.status = result.code
        ctx.body = {
            code: result.code,
            msg: result.msg,
            data: result.data
        }
    }

    /**
     * @param ctx
     * @returns {Promise.<void>}
     */
    

    

    static async deleteTR(ctx) {
        let current_user = await getUsernameFromCtx(ctx)
        let post_body = ctx.query
        let result = undefined
        let required_param_list = ['task_id']
        if (checkUndefined(post_body, required_param_list)) {
            try {
                // let publisher = await TaskModel.searchTaskById(post_body.task_id).publisher;
                // // console.log('<<Delete TR use', current_user, post_body.task_id, '>>')
                // if (publisher != current_user) {
                //     result = {
                //         code: 403,
                //         msg: "Failed, authorize wrong, the ",
                //         data: err.message
                //     }
                // } else {
                let data = await TRModel.deleteTR(current_user, post_body.task_id)
                result = {
                    code: 200, 
                    msg: 'Success',
                    data: data
                }
                // }
            } catch (err) {
                result = {
                    code: 500,
                    msg: 'Failed, database wrong.',
                    data: err.message
                }
            }
        } else {
            result = {
                code: 412,
                msg: "Params wrong, API denied",
                data: []
            }
        }
        
        ctx.response.status  =  result.code
        ctx.body = {
            code: result.code,
            msg: result.msg,
            data: result.data
        }

        let toastTask = await TaskModel.searchTaskById(post_body.task_id);
        ToastModel.createToast(toastTask.publisher, 12, 
                                ToastInfo.t12(toastTask.title, post_body.username), 
                                post_body.username, null, null,
                                post_body.task_id, toastTask.title);
    }

    /**
     * post body should be like
     * 
     *  {
     *      "username": ["hyx", "yao"],
     *      "task_id": 2,
     *      "score": [5, 5]
     *  }
     * 
     * or looks like
     *  
     * {
     *     "username": "hyx",
     *     "task_id": 2,
     *     "score": 5
     * }
     *  
     * @param {*} ctx 
     */
    
   
 
    static async searchTR(ctx) {
        let query = ctx.query
        let result = undefined
        if (query.task_id && query.username) {
            try {
                result = await TRModel.searchTR(query.username, query.task_id)
                result = {
                    code: 200, 
                    msg: "Success",
                    data: result
                }
            } catch (err) {
                result = {
                    code: 500,
                    msg: "Failed",
                    data: err.message
                }
            }
        } else {
            result = {
                code: 412,
                msg: "Params is not enough",
                data: []
            }
        }
        response(ctx, result.code, result.msg, result.data);
    }

    static async submitQuestionnaire(ctx) {
        let serverPath = path.join(__dirname, '../static/uploads/');
        // 获取上存文件
        let result = await FileController.uploadFile(ctx, {
            fileType: 'questionnaire',
            path: serverPath
        });

        let fileUrl = defaultIP + '/uploads' + result.imgPath

        ctx.body = {
            code: result.code,
            msg: result.msg,
            data: {
                fileUrl: fileUrl
            }
        };
    }
}

let response = (ctx, code, msg, data = null) => {
    ctx.response.status = code;
    ctx.body = {
        code: code,
        msg: msg,
        data: data
    };
    return ctx;
}


module.exports = TRController;