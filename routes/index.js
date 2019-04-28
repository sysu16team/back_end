const router = require('koa-router')();

const db = require('../config/db');
const Sequelize = require('sequelize')
const sequelize = db.sequelize;
const models = require('../table/all_tables')
const TRModel = require('../modules/trModel');
const checkUndefined = require('../utils/url_params_utils').checkUndefined;
const FileController = require('../controller/fileController');
const path = require('path');
const TaskModel = require('../modules/taskModel');
const ToastModel = require('../modules/toastModel');
const ToastInfo = require('../utils/toast_info');
const Op = Sequelize.Op
const UserModel = require('../modules/userModel');
const normal = require('../dist/index');
const trController = require('../controller/trController');
const sd = require('silly-datetime');

router.get('/hhhghh', async (ctx, next) => {
    ctx.body = await TaskModel.searchTaskByAccepter(ctx.query)
})

router.get('/', async (ctx, next) => {
    console.log(ctx)
    ctx.body = ctx
});

router.post('/confirm', async (ctx, next) => {
    let post_body = ctx.request.body
    let current_user = 'hjj'
    if (current_user == -1 || current_user == -2 || current_user == undefined || current_user == null) {
        response(ctx, 401, "Please login first", []);
        return;
    }
    if (post_body.username != undefined && post_body.task_id != undefined && post_body.score != undefined) {
        try {
            // 判断
            let publisher = (await TaskModel.searchTaskById(post_body.task_id)).publisher;
            console.log(publisher, current_user)
            if (publisher == current_user) {
                let data = undefined
                let task_money = (await TaskModel.searchTaskById(post_body.task_id)).money;
                
                if (post_body.username instanceof Array) {
                    data = await TRModel.batch_confirm_complement(post_body.username, 
                                                                    post_body.task_id, 
                                                                    post_body.score);
                    
                    await UserModel.batchUpdateUserMoney(post_body.username, task_money);
                } else {
                    data = await TRModel.comfirm_complement(post_body.username, 
                                                            post_body.task_id, 
                                                            post_body.score);
                                                            
                    await UserModel.updateUserMoney(post_body.username, task_money);
                }
                result = {
                    code: 200, 
                    msg: 'Success',
                    data: data
                }
            } else {
                result = {
                    code: 412,
                    msg: "Cannot confirm task not published by u",
                    data: []
                }
            }
            
        } catch (err) {
            console.log(err)
            result = {
                code: 500,
                msg: "Failed",
                data: err.message
            }
        }
    } else {
        result = {
            code: 412,
            msg: 'Param is not enough',
            data: []
        }
    }

    ctx.response.status = result.code
    ctx.body = {
        code: result.code,
        msg: result.msg,
        data: result.data
    }
})

router.get('/string', async (ctx, next) => {
    ctx.body = 'koa2 string'
});

router.get('/json', async (ctx, next) => {
    ctx.body = {
        title: 'koa2 json'
    }
});

module.exports = router;
