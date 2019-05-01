const TaskModel = require('../modules/taskModel');
const UserModel = require('../modules/userModel');
const TRModel = require('../modules/trModel');

// Get username from session.
const getUsernameFromCtx = require('./cookieController').getUsernameFromCtx;
const checkUndefined = require('../utils/url_params_utils').checkUndefined;

class TaskController {
    /**
     * Use range, type and username to get a task, which is the most 
     * common useful API, just name it `searchTask`
     *  1. type:        the type of the task, see task table
     *  2. range:       
     *      * 'ALL'
     *      * Group ids, such as `1`, or `1,2,3`
     *  3. username:    Can be seen by this user. Controller will delete all tasks shielded by the user.
     * 
     * @param ctx Just ctx of KOA
     * 
     */
    static async searchTask(ctx) {
        let query = ctx.query, result = undefined;
        // 检查参数
        let required_param_list = ['range', 'type', 'username']
        if (checkUndefined(query, required_param_list)) {
            try {
                result = await TaskModel.searchTask(query)
                result = {
                    code: 200,
                    msg: 'Success',
                    data: result
                }
            } catch (err) {
                console.log(err)
                result = {
                    code: 500,
                    msg: "Search wrong, please contact the coder",
                    data: err
                }
            }
        } else {
            result = {
                code: 412,
                msg: "Params wrong, please check.",
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
     * 创建 Task
     * @param {string} title                The title of the task
     * @param {string} introduction         The introduction of the task
     * @param {string} money                The money will be given
     * @param {string} score                The minimize score require
     * @param {string} max_accepter_number  The max number of accepters
     * @param {string} publisher            The publisher username
     * @param {string} type                 The type of the task
     * @param {string} starttime            The starttime
     * @param {string} endtime              The endtime
     * @param {string} content              The content
     * @return {*} a task
     */
    static async releaseTask(ctx) {
        let post_body = ctx.request.body
        let result = undefined
        let required_param_list = ['title', 'introduction', 'money', 'score', 
                                    'max_accepter_number', 'type', 
                                    'starttime', 'endtime'];
        
        if (checkUndefined(post_body, required_param_list)) {
            // Confirm the publisher is the current user
            let current_user = await getUsernameFromCtx(ctx);
            
            
            if (post_body.range == undefined || post_body.range == null) {
                post_body.range = []
            }

            console.log(post_body.range)
            console.log(current_user)

            if (current_user == -1 || current_user == -2) {
                result = {
                    code: 401,
                    msg: "Please login first.",
                    data: []
                }
            } else {
                let post_data = {
                    title: post_body.title,
                    introduction: post_body.introduction,
                    money: post_body.money,
                    score: post_body.score,
                    max_accepter_number: post_body.max_accepter_number,
                    publisher: current_user, // only session
                    type: post_body.type,
                    starttime: post_body.starttime,
                    endtime: post_body.endtime,
                    content: post_body.content,
                    questionnaire_path: post_body.questionnaire_path
                }

                try {
                    let task_money = post_body.money * post_body.max_accepter_number;
                    // result.get('money') * result.get('max_accepter_number');
                    let check_money = await UserModel.updateUserMoney(current_user, -task_money);
                    if (check_money == -1) {
                        result = {
                            code: 403,
                            msg: "Your balance is not enough to publish this task",
                            data: result
                        }
                    } else {
                        result = await TaskModel.createTask(post_data, post_body.range)
                        result = {
                            code: 200,
                            msg: "Success",
                            data: result
                        }
                    }
                } catch (err) {
                    result = {
                        code: 500,
                        msg: "Failed",
                        data: err.message
                    }
                    console.log(err)
                }
            }
        } else {
            result = {
                code: 412,
                msg: "Params are not enough, need [title, introduction, money, score, max_accepter_number, publisher, type]",
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
    static async searchTaskById(ctx) {
        let query_params = ctx.query
        let result = undefined
        if (query_params.task_id) {
            try {
                result = await TaskModel.searchTaskById(query_params.task_id);
                result = {
                    code: 200,
                    msg: "Success",
                    data: result
                }
            } catch (err) {
                console.log(err)
                result = {
                    code: 500,
                    msg: "Failed",
                    data: err
                }
            }
        } else {
            result = {
                code: 412,
                msg: "Params is not enough...",
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

    static async searchTaskByType(type) {
        let result
        try {
            let data = await TaskModel.getTasksByType(type);
            result = {
                code: 200, 
                msg: '查询成功',
                data: data
            }
        } catch (err) {
            result = {
                code: 500,
                msg: '查询失败',
                data: err
            }
        }
        return result
    }


    static async searchTaskByMoney(money) {
        let result
        try {
            let data = await TaskModel.getTaskByMoney(money[0], money[1]);
            result = {
                code: 200, 
                msg: '查询成功',
                data: data
            }
        } catch (err) {
            result = {
                code: 500,
                msg: '查询失败',
                data: err
            }
        }
        return result
    }

    static async searchTaskByUserRelease(ctx) {
        let query_params = ctx.query
        let result = undefined
        if (query_params.publisher) {
            try {
                result = await TaskModel.searchTaskByUserRelease(query_params)
                result = {
                    code: 200, 
                    msg: 'Success',
                    data: result
                }
            } catch (err) {
                console.log(err)
                result = {
                    code: 500,
                    msg: 'Failed',
                    data: err
                }
            }
        } else {
            result = {
                code: 412,
                msg: "Params is not enough...",
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

    static async searchTaskBySomeRestriction(restrictions) {
        let result
        try {
            let data = await TaskModel.getTaskByRestrict(restrictions);
            result = {
                code: 200, 
                msg: '查询成功',
                data: data
            }
        } catch (err) {
            result = {
                code: 500,
                msg: '查询失败，请检查参数',
                data: err
            }
        }
        return result
    }

    static async deleteTaskByTaskID(ctx) {

        let query_params = ctx.query
        let result = undefined
        if (query_params.task_id != undefined) {
            let current_user = await getUsernameFromCtx(ctx);
            if (current_user == -1 || current_user == -2) {
                result = {
                    code: 401,
                    msg: "Unlogin, please login first",
                    data: []
                }
            } else {
                try {
                    let iftr = await TRModel.searchByTaskId(query_params.task_id);
                    let task_publisher = await TaskModel.searchPublisherByTaskid(query_params.task_id);
                    if (iftr.length != 0) {
                        result = {
                            code: 401,
                            msg: "Tha task have been recieved, cannot be delete currently.",
                            data: []
                        }
                    } else if (current_user != task_publisher) {
                        result = {
                            code: 403,
                            msg: "Task can only be deleted by publisher.",
                            data: []
                        }
                    } else {
                        result = await TaskModel.deleteTaskByTaskID(query_params.task_id)
                        result = {
                            code: 200, 
                            msg: 'Success',
                            data: result
                        }
                    }
                } catch (err) {
                    result = {
                        code: 500,
                        msg: 'Failed',
                        data: err.message
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
    }

    static async searchTaskByAccepter(ctx) {
        let query_params = ctx.query
        let result = undefined
        if (query_params.username != undefined) {
            try {
                result = await TaskModel.searchTaskByAccepter(query_params)
    
                result = {
                    code: 200, 
                    msg: 'Success',
                    data: result
                }
            } catch (err) {
                result = {
                    code: 500,
                    msg: "Failed",
                    data: err
                }
            }
        } else {
            result = {
                code: 412,
                msg: "Params is not enough...",
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

    static async searchTaskByOrganization(ctx) {
        let query_params = ctx.query
        let result = undefined
        if (query_params.orgname != undefined) {
            let restrictions = {
                type: query_params.type
            }
            try {
                result = await TaskModel.searchTaskByOrg(query_params.orgname, restrictions)
                result = {
                    code: 200, 
                    msg: 'Success',
                    data: result
                }
            } catch (err) {
                result = {
                    code: 500,
                    msg: "Failed",
                    data: err
                }
            }
        } else {
            result = {
                code: 412,
                msg: "Params is not enough...",
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
}

module.exports = TaskController;