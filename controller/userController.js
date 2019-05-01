const UserModel = require('../modules/userModel')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')
const session = require("koa-session2")
const Store = require("../utils/Store.js")
const redis = new Store();
const CookieController = require('./CookieController');
require('./CookieController');
const ToastModel = require('../modules/toastModel')
const Toast_info = require('../utils/toast_info');
const TeamModel = require('../modules/teamModel');


class UserController {

    /**
     * @param ctx
     * @returns
     */
    static async judgeCookies(ctx) {
        return ctx.session.username ? 0 : -1;
    }

    /**
     * 从前端的一个请求中通过cookies获得用户名
     * @param ctx
     * @returns
     *  -1：cookies无效
     *  username: 用户名，一个字符串
     */
    static async getUsernameFromCtx(ctx) {
        return ctx.session.username ? ctx.session.username : -1;
    }
    
    /**
     * 用户注册
     * @param ctx
     * @returns {Promise.<void>}
     */
    static async register(ctx) {
        function formidablePromise (req, opts) {
            return new Promise(function (resolve, reject) {
              var form = new formidable.IncomingForm(opts)
              form.keepExtensions = true;     
              form.uploadDir = 'static/uploads/user/';
              form.parse(req, function (err, fields, files) {
                var extname = null
                if (files.avatar) {
                    //var extname = path.extname(files.avatar.path)
                    var oldpath = files.avatar.path
                    console.log(oldpath)
                    var newpath = form.uploadDir + fields.username + extname
                    var issave = false
                    if (!fs.existsSync(newpath)) {
                        fs.rename(oldpath, newpath, function(err) {
                            if (err) {
                                throw err
                            }
                        })
                        issave = true
                    }
                }
                if (err) return reject(err)
                resolve({ fields: fields, files: files, newpath: newpath, oldpath: oldpath, extname: extname, issave: issave })
              })
            })
          }

        var body = await formidablePromise(ctx.req, null);


        var info = body.fields
        try {
            const user = await UserModel.getUserInfo(info.username);
            if (user != null) {
                ctx.body = {
                    code: 409,
                    msg: '该用户已存在',
                    data: null 
                }
                if (fs.existsSync(body.oldpath)) {
                    fs.unlinkSync(body.oldpath)
                }
                if (body.issave) {
                    if (fs.existsSync(body.newpath)) {
                        fs.unlinkSync(body.newpath)
                    }
                }
                return
            }
            
            const res = await UserModel.createUser(info, body.extname);
           
            ctx.status = 200;
            ctx.body = {
                code: 200,
                msg: 'success',
                data: res
            }
        } catch(err) {
            ctx.status = 500;
            ctx.body = {
                code: 500,
                msg: 'failed',
                data: err
             }
        }
            /*ctx.status = 400;
            ctx.body = {
                code: 400,
                msg: 'bad request',
                data: req
            } */ 
    }

    /**
     * 用户登录
     * @param {*} username 
     * @param {*} password 
     */
    static async login(ctx) {
        let req = ctx.request.body;
        try {
            const flag = await UserModel.getUserByUsernameAndPassword(req.type, req.username, req.password);
            ctx.status = 200;
            if (flag === 1) {
                ctx.body = {
                    code: 412,
                    msg: '用户名或密码错误',
                    data: 'error' 
                }   
            } 
            else if (flag === 2) {
                ctx.body = {
                    code: 413,
                    msg: '账户类型错误',
                    data: 'error' 
                }    
            }
            else if(flag == 0) {
                ctx.session = {username: req.username,
                                type: req.type};

                ctx.body = {
                    code: 200,
                    msg: '登录成功',
                    data: null
                }
            }
        } catch(err) {
            ctx.status = 500;
            ctx.body = {
                code: 500,
                msg: 'failed',
                data: err
            }
        }
    }

    static async logout(ctx) {
        if (!ctx.session.username) {
            ctx.status = 401;
            ctx.body = {
                code: 401,
                msg: 'cookies无效',
            }
        }
        else {
            ctx.session = {};
            ctx.status = 200;
            ctx.body = {
                code: 200,
                msg: '退出成功'
            }
        }
    }

    /**
     * 根据 username 查询 user 信息
     * @param ctx
     * @returns {Promise.<void>}
     */
    static async getUserInfo(username) {
        let result;
        try {
            const data = await UserModel.getUserInfo(username);
            if (data == null) {
                result = {
                code: 412,
                msg: '用户不存在',
                data: err
                }       
            } else{
                    result = {
                        code: 200,
                        msg: 'success',
                        data: {
                            "username": data.username,
                            "name": data.true_name,
                            "school": data.school_name,
                            "grade": data.grade,
                            "phone": data.phone_number,
                            "score": data.score,
                            "money": data.money,
                            "type": data.account_state,
                            "signature": data.signature,
                            "email":data.email
                        } 
                    }
            }
        } catch(error) {
            result = {
                code: 412,
                msg: '用户不存在',
                data: error
            }
        }
        return result;
    }

    /**
     * 根据 organizationname 查询 organization 信息
     * @param ctx
     * @returns {Promise.<void>}
     */
    static async getOrgInfo(organizationname) {
        let result;
        try {
            const data = await UserModel.getUserInfo(organizationname);
            if (data == null) {
                result = {
                code: 400,
                msg: 'bad request',
                data: err
                }       
            } else{
                if (data.account_state != 1) {
                    result = {
                        code: 402,
                        msg: '查询类型错误',
                        data: null
                    }
                }
                else {
                    result = {
                        code: 200,
                        msg: 'success',
                        data: {
                            "orgname": data.username,
                            "score": 100,
                            "school": "SYSU",
                            "phone_number": null
                        }
                    } 
                }
            }
        } catch(error) {
            result = {
                code: 412,
                msg: 'failed',
                data: error
            }
        }
        return result;
    }


    static async updateUserInfo(ctx) {
        if (!ctx.session.username) {
            ctx.status = 401;
            ctx.body = {
                code: 401,
                msg: '请登录！'
            };
            return;
        }
        let req = ctx.request.body;
        req.username = ctx.session.username;
        //判断是否修改密码
        let ifChangePasswd = false;
        let msg = [];
        if (req.oldPasswd) {
            ifChangePasswd = true;
            const data = await UserModel.getUserInfo(ctx.session.username);
            if (data.password != req.oldPasswd) {
                msg.push('原密码错误，更新密码失败！');
                ifChangePasswd = false;
            }
            else{
                msg.push('更新密码成功！');

            }
        }

        try {
            const data = await UserModel.updateUserInfo(req, ifChangePasswd, ctx.session.type);
            msg.unshift('更新信息成功！')
            ctx.status = 200;
            ctx.body = {
                code: 200,
                msg: msg,
                data: data
            }
        } catch (error) {
            ctx.status = 500;
            ctx.body = {
                code: 500,
                msg: '服务器错误，更新失败！',
                data: error
            }
        }
    }

    static async deposit(ctx) {
        let result 
        if (!ctx.session.username) {
            result = {
                code: 401,
                msg: 'cookies无效',
                data: null
            }  
            return result 
        }
        var username = ctx.session.username
        try {
            const data = await UserModel.getUserInfo(username);
            if (data === null) {
                result = {
                    code: 413,
                    msg: '无当前用户',
                    data: 'error' 
                }    
            } else {
                const state = await UserModel.deposit(username, ctx.query.amount);
                if (state === -1) {
                    result = {
                        code: 412,
                        msg: '账户余额不足',
                        data: 'error' 
                    }
                } else if (state === 0) {   
                    const user = await UserModel.getUserInfo(username);
                    result = {
                        code: 200,
                        msg: '充值成功',
                        data: user.money
                    }  
                }
            }
        } catch(err) {
            result = {
                code: 500,
                msg: 'failed',
                data: err
            }
        }
        return result
    }

    static async withdraw(ctx) {
        let result 
        if (!ctx.session.username) {
            result = {
                code: 401,
                msg: 'cookies无效',
                data: null
            }  
            return result 
        }
        var username = ctx.session.username
        try {
            const data = await UserModel.getUserInfo(username);
            if (data === null) {
                result = {
                    code: 413,
                    msg: '无当前用户',
                    data: 'error' 
                }    
            } else {
                const state = await UserModel.withdraw(username, ctx.query.amount);
                if (state === -1) {
                    result = {
                        code: 412,
                        msg: '账户余额不足',
                        data: 'error' 
                    }
                } else if (state === 0) {   
                    const user = await UserModel.getUserInfo(username);
                    result = {
                        code: 200,
                        msg: '提现成功',
                        data: user.money
                    }  
                }
            }
        } catch(err) {
            result = {
                code: 500,
                msg: 'failed',
                data: err
            }
        }
        return result
    }

    static async updateUserScore(ctx) {
        let req = ctx.request.body;
        const SESSIONID = ctx.cookies.get('SESSIONID');

        if (!SESSIONID) {
            ctx.status = 412;
                ctx.body = {
                    code: 412,
                    msg: '没有携带SESSIONID，去登录吧~',
                    data: 'error' 
                } 
                return false;
        }
        // 如果有SESSIONID，就去redis里拿数据
        const redisData = await redis.get(SESSIONID);

        if (!redisData) {
            ctx.status = 412;
            ctx.body = {
                code: 412,
                msg: 'SESSIONID已经过期，去登录吧~',
                data: 'error'
            } 
            return false
        }

        const username = JSON.parse(redisData.username);
        console.log(username)
        try {
            const data = await UserModel.getUserInfo(req.username);
            if (data === null) {
                ctx.status = 412;
                ctx.body = {
                    code: 412,
                    msg: '无当前用户',
                    data: 'error' 
                }    
            } else {
                const state = await UserModel.updateUserScore(req.username, req.score);
                if (state === -1) {
                    ctx.status = 412;
                    ctx.body = {
                        code: 412,
                        msg: '账户信用分数不足',
                        data: 'error' 
                    }
                } else if (state === 0) {   
                    const user = await UserModel.getUserInfo(req.username);
                    ctx.status = 200;
                    ctx.body = {
                        code: 200,
                        msg: '增加信用度成功',
                        data: user.score
                    }  
                }
            }
        } catch(err) {
            ctx.status = 500;
            ctx.body = {
                code: 500,
                msg: 'failed',
                data: req
            }
        }
    }

    static async UserBlacklistUser(ctx) {
        if (!ctx.session.username) {
            ctx.status = 200
            ctx.body = {
                code: 401,
                msg: 'cookies无效',
                data: null
            }  
            return 
        }
        let req = ctx.request.body
        let username1 = req.username1
        let username2 = ctx.session.username
        if (username1 == username2) {
            ctx.status = 200
            ctx.body = {
                code: 407,
                msg: '自己不能拉黑自己',
                data: null
            }  
            return   
        }
        if (username1) {
            try {
            const result = await UserModel.UserBlacklistUser(username1, username2)
            if (result == 0) {
                ctx.status = 200
                ctx.body = {
                    code: 200,
                    msg: '拉黑成功',
                    data: result
                }
            }
            else if (result == 1) {
                ctx.status = 402
                ctx.body = {
                    code: 402,
                    msg: '被拉黑机构或用户不存在',
                    data: result
                }   
            }
            else if (result == 2) {
                ctx.status = 403
                ctx.body = {
                    code: 403,
                    msg: '用户不存在',
                    data: result
                }   
            }
            else if (result == 3) {
                ctx.status = 405
                ctx.body = {
                    code: 405,
                    msg: '机构不能拉黑用户',
                    data: result
                }   
            }
            else if (result == 4) {
                ctx.status = 406
                ctx.body = {
                    code: 406,
                    msg: '已拉黑',
                    data: result
                }   
            }
        } catch(err) {
            ctx.status = 500;
            ctx.body = {
                code: 500,
                msg: '服务器异常',
                data: err
            }    
        }
        }
    }

    static async teamBlacklistOrg(ctx) {

        if (!ctx.session.username) {
            ctx.status = 200
            ctx.body = {
                code: 401,
                msg: 'cookies无效',
                data: null
            }  
            return result 
        }

        let req = ctx.request.body
        let ins_name = req.ins_name
        let team_id = req.team_id
        if (ins_name && team_id) {
            try {
            const result = await UserModel.TeamBlacklistOrg(ins_name, team_id, ctx.session.username)
            if (result == 0) {
                ctx.status = 200
                ctx.body = {
                    code: 200,
                    msg: '拉黑成功',
                    data: result
                }
            }
            else if (result == 1) {
                ctx.status = 402
                ctx.body = {
                    code: 402,
                    msg: '被拉黑机构不存在',
                    data: result
                }   
            }
            else if (result == 2) {
                ctx.status = 403
                ctx.body = {
                    code: 403,
                    msg: '该用户不是机构',
                    data: result
                }   
            }
            else if (result == 3) {
                ctx.status = 405
                ctx.body = {
                    code: 405,
                    msg: '小组不存在',
                    data: result
                }   
            }
            else if (result == 4) {
                ctx.status = 406
                ctx.body = {
                    code: 406,
                    msg: '已拉黑，不能重复拉黑',
                    data: result
                }   
            }
            else if (result == 5) {
                ctx.status = 407
                ctx.body = {
                    code: 407,
                    msg: '组长才有权限拉黑组织',
                    data: result
                }    
            }
        } catch(err) {
            ctx.status = 500;
            ctx.body = {
                code: 500,
                msg: '服务器异常',
                data: err
            }
        }
        }    
    }

    static async UserCancelBlack(ctx) {
        if (!ctx.session.username) {
            ctx.status = 200
            ctx.body = {
                code: 401,
                msg: 'cookies无效',
                data: null
            }  
            return 
        }

        let req = ctx.request.body
        let username1 = req.username1
        let username2 = ctx.session.username

        if (username1) {
            try {
            const result = await UserModel.UserCancelBlack(username1, username2)
            if (result == 0) {
                ctx.status = 200
                ctx.body = {
                    code: 200,
                    msg: '取消拉黑成功',
                    data: result
                }
            }
            else if (result == 1) {
                ctx.status = 402
                ctx.body = {
                    code: 402,
                    msg: '取消拉黑的机构或用户不存在',
                    data: result
                }   
            }
            else if (result == 2) {
                ctx.status = 403
                ctx.body = {
                    code: 403,
                    msg: '用户不存在',
                    data: result
                }   
            }
            else if (result == 4) {
                ctx.status = 405
                ctx.body = {
                    code: 405,
                    msg: '请勿重复取消拉黑',
                    data: result
                }   
            }
            else if (result == 3) {
                ctx.status = 406
                ctx.body = {
                    code: 406,
                    msg: '机构不能取消拉黑',
                    data: result
                }   
            }
        } catch(err) {
            ctx.status = 500;
            ctx.body = {
                code: 500,
                msg: '服务器异常',
                data: err
            }    
        }
        }
    }

    static async teamCancelBlack(ctx) {

        if (!ctx.session.username) {
            ctx.status = 200
            ctx.body = {
                code: 401,
                msg: 'cookies无效',
                data: null
            }  
            return result 
        }

        let req = ctx.request.body
        let ins_name = req.ins_name
        let team_id = req.team_id
        if (ins_name && team_id) {
            try {
            const result = await UserModel.teamCancelBlack(ins_name, team_id, ctx.session.username)
            if (result == 0) {
                ctx.status = 200
                ctx.body = {
                    code: 200,
                    msg: '取消屏蔽成功',
                    data: result
                }
            }
            else if (result == 1) {
                ctx.status = 200
                ctx.body = {
                    code: 402,
                    msg: '取消拉黑机构不存在',
                    data: result
                }   
            }
            else if (result == 2) {
                ctx.status = 200
                ctx.body = {
                    code: 403,
                    msg: '该用户不是机构',
                    data: result
                }   
            }
            else if (result == 3) {
                ctx.status = 200
                ctx.body = {
                    code: 405,
                    msg: '小组不存在',
                    data: result
                }   
            }
            else if (result == 4) {
                ctx.status = 200
                ctx.body = {
                    code: 406,
                    msg: '不存在拉黑关系',
                    data: result
                }   
            }
            else if (result == 5) {
                ctx.status = 200
                ctx.body = {
                    code: 407,
                    msg: '组长才能取消拉黑',
                    data: result
                }   
            }
            else if (result == 6) {
                ctx.status = 200
                ctx.body = {
                    code: 408,
                    msg: '小组不允许添加机构'
                }
            }
        } catch(err) {
            ctx.status = 500;
            ctx.body = {
                code: 500,
                msg: '服务器异常',
                data: err
            }
        }
        }    
    }

    
    static async getAcceptedFinishedTasks(username) {
        let result;
        try{
            const user = await UserModel.getUserInfo(username)
            if (user === null) {
                result = {
                    code: 412,
                    msg: "用户不存在",
                    data: null
                }   
            }
            else {
                const data = await UserModel.getAcceptedFinishedTasks(username);
                result = {
                    code: 200,
                    msg: "success",
                    data: data
                }
            }
        } catch(error) {
            result = {
                code: 500,
                msg: "服务器异常",
                data: error
            }
        }
        return result;

    }

    static async getPublishedWaitedTasks(username) {
        let result;
        try{
            const user = await UserModel.getUserInfo(username)
            if (user === null) {
                result = {
                    code: 412,
                    msg: "用户不存在",
                    data: null
                }   
            }
            else {
                const data = await UserModel.getPublishedWaitedTasks(username);
                result = {
                    code: 200,
                    msg: "success",
                    data: data
                }
            }
        } catch(error) {
            result = {
                code: 500,
                msg: "服务器异常",
                data: error
            }
        }
        return result;   
    }

    static async getPublishedFinishedTasks(username) {
        let result;
        try{
            const user = await UserModel.getUserInfo(username)
            if (user === null) {
                result = {
                    code: 412,
                    msg: "用户不存在",
                    data: null
                }   
            }
            else {
                const data = await UserModel.getPublishedFinishedTasks(username);
                result = {
                    code: 200,
                    msg: "success",
                    data: data
                }
            }
        } catch(error) {
            result = {
                code: 500,
                msg: "服务器异常",
                data: error
            }
        }
        return result;     
    }

    static async getCanPublishTasksOrg(teamId) {
        let result;
        try {
            const data = await UserModel.getCanPublishTasksOrg(teamId);
            if (data == -1) {
                result = {
                    code: 412,
                    msg: "小组不存在",
                    data: null
                }    
            }
            else {
                result = {
                    code: 200,
                    msg: "success",
                    data: data
                }     
            }

        } catch(err) {
            result = {
                code: 500,
                msg: "服务器异常",
                data: err
            }   
        }
        return result
    }

    static async getCanPublishTasksTeamList(insname) {
        let result;
        try {
            const data = await UserModel.getCanPublishTasksTeamList(insname);
            if (data == -1) {
                result = {
                    code: 412,
                    msg: "查询机构不存在",
                    data: null
                }    
            }
            else {
                result = {
                    code: 200,
                    msg: "success",
                    data: data
                }     
            }

        } catch(err) {
            result = {
                code: 500,
                msg: "服务器异常",
                data: err
            }   
        }
        return result
    }

    static async getUserBlacklist(ctx) {
        console.log(1)
        if (!ctx.session.username) {
            ctx.status = 200;
            ctx.body = {
                code: 401,
                msg: "cookies无效",
                data: null
            }
            return
        }
        try {
            const data = await UserModel.getUserBlacklist(ctx.session.username);
            if (data == -1) {
                ctx.status = 200;
                ctx.body = {
                    code: 412,
                    msg: "用户不存在",
                    data: null
                }    
            }
            else {
                ctx.status = 200;
                ctx.body =  {
                    code: 200,
                    msg: "success",
                    data: data
                }     
            }

        } catch(err) {
            ctx.status = 200;
            ctx.body =  {
                code: 500,
                msg: "服务器异常",
                data: err
            }   
        }    
    }

    static async setRate(ctx) {
        console.log()
        const flag = await UserController.judgeCookies(ctx);
        console.log(1)
        if (flag == -1 || flag == -2) {
            console.log(2)
            ctx.status = 401;
            ctx.body = {
                code: 401,
                msg: 'failed',
                data: null
            }
        } 
        else if(flag == 0) {
            console.log(3)
            const SESSIONID = ctx.cookies.get('SESSIONID');
            const redisData = await redis.get(SESSIONID);
            const user = redisData.username
            
            var taskId = ctx.request.body.taskId
            var value = ctx.request.body.value

            const task = await UserModel.getTaskByTaskId(taskId) 
            if (task === null) {
                ctx.status = 400;
                ctx.body = {
                    code: 400,
                    msg: 'failed',
                    data: null
                }
            }
            else {
                if (task.publisher == user) {
                    ctx.status = 200;
                    ctx.body = {
                        code: 200,
                        msg: 'success',
                        data: value
                    }   
                }
                else {
                    ctx.status = 401;
                    ctx.body = {
                        code: 401,
                        msg: 'failed',
                        data: null
                    }   
                }
            }
        }
    }

    static async verifyPassword(ctx) {
        console.log("yunxingdaozhele ")
        if (!ctx.session.username) {
            ctx.status = 401;
            ctx.body = {
                code: 401,
                msg: 'cookies无效',
            }   
        }
        else {
            try{
                const user = await UserModel.getUserInfo(ctx.session.username)
                if (!ctx.request.body.password) {
                    ctx.status = 400;
                    ctx.body = {
                        code: 400,
                        msg: '参数错误，缺少密码',
                    }    
                }
                else {
                    if (ctx.request.body.password == user.password) {
                        ctx.status = 200;
                        ctx.body = {
                            code: 200,
                            msg: '验证成功',
                        }    
                    }
                    else {
                        ctx.status = 200;
                        ctx.body = {
                            code: 402,
                            msg: '密码错误',
                        }   
                    }
                }
            } catch(err) {
                ctx.status = 500;
                ctx.body = {
                    code: 500,
                    msg: '服务器错误',
                    data: err
                }   
            }
        }
    }


    static async follow(ctx) {
        if (!ctx.session.username) {
            ctx.status = 401;
            ctx.body = {
                code: 401,
                msg: 'cookies无效',
            }  
            return  
        }
        
        if (ctx.session.type == 1) {
            ctx.status = 200;
            ctx.body = {
                code: 401,
                msg: '机构不能关注他人或机构',
            }  
            return  
        }
        
        if (!ctx.request.body.ins_name) {
            ctx.status = 400;
            ctx.body = {
                code: 400,
                msg: '参数不全',
            }   
        }
        else {
            var ins_name = ctx.request.body.ins_name;
            var user_name = ctx.session.username;
            if (ins_name == user_name) {
                ctx.status = 200;
                ctx.body = {
                    code: 401,
                    msg: '自己不能关注自己',
                }     
                return 
            }
            try {
                var result = await UserModel.follow(user_name, ins_name)
                if (result == 0) {
                    ctx.status = 200;
                    ctx.body = {
                        code: 200,
                        msg: '关注成功',
                    }    
                }
                else if (result == 1) {
                    ctx.status = 200;
                    ctx.body = {
                        code: 402,
                        msg: '用户不存在',
                    }    
                }
                else if (result == 2) {
                    ctx.status = 200;
                    ctx.body = {
                        code: 402,
                        msg: '机构不存在',
                    }    
                }
                else if (result == 3) {
                    ctx.status = 200;
                    ctx.body = {
                        code: 403,
                        msg: '已关注，不能重复关注',
                    }    
                }
            } catch(err) {
                ctx.status = 500;
                ctx.body = {
                    code: 500,
                    msg: '服务器错误',
                    data: err
                }    
            }
        }
    }

    static async cancelFollow(ctx) {
        if (!ctx.session.username) {
            ctx.status = 401;
            ctx.body = {
                code: 401,
                msg: 'cookies无效',
            }  
            return  
        }
        
        if (ctx.session.type == 1) {
            ctx.status = 200;
            ctx.body = {
                code: 401,
                msg: '机构无关注与取消关注功能',
            }  
            return  
        }
        
        if (!ctx.request.body.ins_name) {
            ctx.status = 400;
            ctx.body = {
                code: 400,
                msg: '参数不全',
            }   
        }
        else {
            var ins_name = ctx.request.body.ins_name;
            var user_name = ctx.session.username;
            if (ins_name == user_name) {
                ctx.status = 200;
                ctx.body = {
                    code: 401,
                    msg: '操作无效',
                }     
                return 
            }
            try {
                var result = await UserModel.cancelFollow(user_name, ins_name)
                if (result == 0) {
                    ctx.status = 200;
                    ctx.body = {
                        code: 200,
                        msg: '取消关注成功',
                    }    
                }
                else if (result == 1) {
                    ctx.status = 200;
                    ctx.body = {
                        code: 402,
                        msg: '用户不存在',
                    }    
                }
                else if (result == 2) {
                    ctx.status = 200;
                    ctx.body = {
                        code: 402,
                        msg: '机构不存在',
                    }    
                }
                else if (result == 3) {
                    ctx.status = 200;
                    ctx.body = {
                        code: 403,
                        msg: '未关注，无法取消关注',
                    }    
                }
            } catch(err) {
                ctx.status = 500;
                ctx.body = {
                    code: 500,
                    msg: '服务器错误',
                    data: err
                }    
            }
        }
    }

    static async getFollowList(ctx) {
        if (!ctx.session.username) {
            ctx.status = 200;
            ctx.body = {
                code: 401,
                msg: "cookies无效",
            }
            return
        }

        if (ctx.session.type == 0) {
            ctx.status = 200;
            ctx.body = {
                code: 400,
                msg: "用户没有关注者",
            }
            return
        }


        try {
            const data = await UserModel.getFollowList(ctx.session.username);
            if (data == 1) {
                ctx.status = 200;
                ctx.body = {
                    code: 412,
                    msg: "机构不存在",
                    data: null
                }    
            }
            else {
                ctx.status = 200;
                ctx.body =  {
                    code: 200,
                    msg: "success",
                    data: data
                }     
            }

        } catch(err) {
            ctx.status = 200;
            ctx.body =  {
                code: 500,
                msg: "服务器异常",
                data: err
            }   
        }   
    }

    static async getUsersFollowedOrganizationsList(ctx) {
        if (!ctx.session.username) {
            ctx.status = 200;
            ctx.body = {
                code: 401,
                msg: "cookies无效",
            }
            return
        }

        if (ctx.session.type == 1) {
            ctx.status = 200;
            ctx.body = {
                code: 400,
                msg: "机构不能关注机构",
            }
            return
        }


        try {
            const data = await UserModel.getUsersFollowedOrganizationsList(ctx.session.username);
            if (data == 1) {
                ctx.status = 200;
                ctx.body = {
                    code: 412,
                    msg: "用户不存在",
                    data: null
                }    
            }
            else {
                ctx.status = 200;
                ctx.body =  {
                    code: 200,
                    msg: "success",
                    data: data
                }     
            }

        } catch(err) {
            ctx.status = 200;
            ctx.body =  {
                code: 500,
                msg: "服务器异常",
                data: err.message
            }   
        }  
    }

    static async refuseOrgToTeam(ctx) {
        if (!ctx.session.username) {
            ctx.status = 200;
            ctx.body = {
                code: 401,
                msg: "cookies无效",
            }
            return   
        }  
        var team_id = ctx.request.body.team_id
        var ins_name = ctx.request.body.ins_name
        if (team_id && ins_name) {
            try {
                var result = await UserModel.refuseOrgToTeam(team_id, ins_name, ctx.session.username)
                if (result == 1) {
                    ctx.status = 200;
                    ctx.body = {
                        code: 412,
                        msg: "小组不存在",
                        data: null
                    }   
                }
                else if (result == 2) {
                    ctx.status = 200;
                    ctx.body = {
                        code: 413,
                        msg: "组长才有权利拒绝进组",
                        data: null
                    } 
                }
                else if (result == 3) {
                    ctx.status = 200;
                    ctx.body = {
                        code: 413,
                        msg: "机构不存在",
                        data: null
                    } 
                }
                else if (result == 4) {
                    ctx.status = 200;
                    ctx.body = {
                        code: 414,
                        msg: "以进组，进组请求有误",
                        data: null
                    } 
                }
                else if (result == 0) {
                    let team = await TeamModel.getTeamByTeamId(team_id, 0);
                    await ToastModel.createToast(ins_name, 6, Toast_info.t6(team.team_name), team.leader, team_id, team.team_name, null, null)
                    ctx.status = 200;
                    ctx.body = {
                        code: 200,
                        msg: "拒绝成功",
                        data: true
                    } 
                }
            } catch(err) {
                ctx.status = 500;
                ctx.body = {
                    code: 500,
                    msg: "服务器错误",
                    data: err
                }    
            }
        }
    }

    static async searchOrg(ctx) {
        let query_params = ctx.query
        var ins_name = query_params.ins_name
        if (ins_name) {
            var data = await UserModel.searchOrg(ins_name)
            ctx.status = 200;
            ctx.body = {
                code: 200,
                msg: '查询成功',
                data: data
            }
        }
        else {        
            ctx.status = 200;
            ctx.body = {
                code: 400,
                msg: 'Wrong query param.',
                data: null
            }
        }   
    }

    static async orgquitteam(ctx) {

        if (!ctx.session.username) {
            ctx.status = 200;
            ctx.body = {
                code: 401,
                msg: "cookies无效",
            }
            return   
        }

        if (ctx.session.type == 0) {
            ctx.status = 200;
            ctx.body = {
                code: 401,
                msg: "用户不是机构",
            }
            return   
        }

        var team_id = ctx.request.body.team_id;
        var ins_name = ctx.session.username;

        try {
            const result = await UserModel.orgquitteam(team_id, ins_name);
            if (result == 1) {
                ctx.status = 200;
                ctx.body = {
                    code: 402,
                    msg: "机构不存在",
                }    
            }
            else if (result == 2) {
                ctx.status = 200;
                ctx.body = {
                    code: 403,
                    msg: "小组不存在",
                }    
            }
            else if (result == 3) {
                ctx.status = 200;
                ctx.body = {
                    code: 405,
                    msg: "机构不在小组内，退出失败",
                }    
            }
            else if (result == 0) {
                ctx.status = 200;
                ctx.body = {
                    code: 200,
                    msg: "退出成功",
                }    
            }
            
        } catch(err) {
            ctx.status = 500;
            ctx.body = {
                code: 200,
                msg: err.message
            }    
        }

    }
}

module.exports = UserController;
