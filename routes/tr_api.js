const router = require('koa-router')()
const task_controller = require('../controller/taskController')
const tr_controller = require('../controller/trController')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

router.prefix('/api/task/relations')

/**

GET: /task/releations?task_id={}
    获得所有任务接受人
    失败返回 412

POST: /task/relations
    接受任务
    失败返回 412

DELETE：/task/relations
    删除任务接受状态
    失败返回 412

*/

/**
 * 处理 Task Relations 相关的 GET 请求
 * 只接受参数为 task_id 的查询请求
 */
router.get('/', async (ctx) => {
    let query_params = ctx.query
    let result = undefined
    // 预计参数为  {task_id: 2}
    if (query_params.task_id) {
        result = await tr_controller.searchByTaskId(query_params.task_id)
    } else if (query_params.username) {
        result = await tr_controller.searchByUsername(query_params.username)
    } else {
        result = {
            code: 412,
            msg: "wrong params",
            data: []
        }
    }
    ctx = response(ctx, result)
})

/**
 * 处理 Task Reciever 相关的 POST 请求
 * 要求传入的参数为 POST {task_id, username}
 */
router.post('/', async (ctx) => {
    let post_data = ctx.request.body
    let result = undefined
    if (post_data.username && post_data.task_id) {
        console.log("Username and task_id got")
        result = await tr_controller.recieveATask(post_data.username, 
            post_data.task_id)
    } else {
        result = {
            code: 412,
            msg: "Params wrong, API denied"
        }
    }
    ctx = response(ctx, result)
})



router.del('/', async (ctx) => {
    let post_data = ctx.request.body
    let result = undefined
    if (post_data.task_id && post_data.username) {
        result = task_controller.deleteTR(post_data.username, post_data.task_id)
    } else {
        result = {
            code: 412,
            msg: "Params wrong, API denied"
        }
    }
    ctx = response(ctx, result)
})

let response = (ctx, result) => {
    ctx.response.status = result.code;
    if (result.code == 200) {
        ctx.body = {
            code: result.code,
            msg: result.msg,
            data: result.data
        }
    } else {
        ctx.body = {
            code: result.code,
            msg: result.msg
        }
    }
    return ctx;
}

module.exports = router
