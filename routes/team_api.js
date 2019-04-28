const router = require('koa-router')();
const TeamController = require('../controller/teamController');
const CookieController = require('../controller/CookieController');

router.prefix('/api/v1/team');

router.post('/', TeamController.createGroup);

router.put('/', TeamController.modifyGroup);

router.get('/Leader/', async (ctx) => {
    let query_params = ctx.query;
    let result = null;
    let cookie_user = await CookieController.getUsernameFromCtx(ctx);
    if (query_params.team_id && cookie_user !== -2) {
        result = await TeamController.isGroupLeader(query_params.team_id, cookie_user)
    } else if (query_params.team_id){
        result = {
            code: 401,
            msg: 'cookie超时，请重新登录',
            data: null
        }
    } else {
        result = {
            code: 400,
            msg: 'Wrong query param.',
            data: null
        }
    }
    response(ctx, result);
});

router.get('/Member/', async (ctx) => {
    let query_params = ctx.query;
    let result = null;
    let cookie_user = await CookieController.getUsernameFromCtx(ctx);
    if (query_params.team_id && cookie_user !== -2) {
        result = await TeamController.isGroupMember(query_params.team_id, cookie_user)
    } else if (query_params.team_id){
        result = {
            code: 401,
            msg: 'cookie超时，请重新登录',
            data: null
        }
    } else {
        result = {
            code: 400,
            msg: 'Wrong query param.',
            data: null
        }
    }

    response(ctx, result);
});

router.get('/OrgMember/', async (ctx) => {
    let query_params = ctx.query;
    let result = null;
    let cookie_user = await CookieController.getUsernameFromCtx(ctx);
    if (query_params.team_id && cookie_user !== -2) {
        result = await TeamController.isGroupOrgMember(query_params.team_id, cookie_user)
    } else if (query_params.team_id){
        result = {
            code: 401,
            msg: 'cookie超时，请重新登录',
            data: null
        }
    } else {
        result = {
            code: 400,
            msg: 'Wrong query param.',
            data: null
        }
    }

    response(ctx, result);
});

router.get('/All', async (ctx) => {
    let query_params = ctx.query;
    let result = null;
    result = await TeamController.getAllGroup()
    response(ctx, result);
});

router.get('/Name/', async (ctx) => {
    let query_params = ctx.query;
    let result = null;
    if (query_params.team_name && query_params.type) {
        result = await TeamController.getGroupByGroupName(query_params.team_name, query_params.type)
    } else {
        result = {
            code: 400,
            msg: 'Wrong query param.',
            data: null
        }
    }
    response(ctx, result);
});

router.get('/Label/', async (ctx) => {
    let query_params = ctx.query;
    let result = null;
    if (query_params.label && query_params.type) {
        result = await TeamController.getGroupByTag(query_params.label, query_params.type)
    } else {
        result = {
            code: 400,
            msg: 'Wrong query param.',
            data: null
        }
    }
    response(ctx, result);
});

router.get('/MemberName/', async (ctx) => {
    let query_params = ctx.query;
    let result = null;
    let cookie_user = await CookieController.getUsernameFromCtx(ctx);

    if (cookie_user !== -2 && query_params.type) {
        result = await TeamController.getGroupByUsername(cookie_user, query_params.type);
    } else if (query_params.type) {
        result = {
            code: 401,
            msg: 'cookie超时，请重新登录',
            data: null
        }
    } else {
        result = {
            code: 400,
            msg: 'Wrong query param.',
            data: null
        }
    }
    response(ctx, result);
});

router.get('/OrgName/', async (ctx) => {
    let query_params = ctx.query;
    let result = null;
    let cookie_user = await CookieController.getUsernameFromCtx(ctx);

    if (cookie_user !== -2 && query_params.type) {
        result = await TeamController.getGroupByOrgname(cookie_user, query_params.type);
    } else if (query_params.type) {
        result = {
            code: 401,
            msg: 'cookie超时，请重新登录',
            data: null
        }
    } else {
        result = {
            code: 400,
            msg: 'Wrong query param.',
            data: null
        }
    }
    response(ctx, result);
});

router.get('/Id/', async (ctx) => {
    let query_params = ctx.query;
    let result = null;
    if (query_params.team_id && query_params.type) {
        result = await TeamController.getGroupByGroupId(query_params.team_id, query_params.type)
    } else {
        result = {
            code: 400,
            msg: 'Wrong query param.',
            data: null
        }
    }
    response(ctx, result);
});

router.post('/Member/Invitation/', async (ctx) => {
    let result = null;
    let cookie_user = await CookieController.getUsernameFromCtx(ctx);
    if (cookie_user === -2) {
        result = {
            code: 401,
            msg: 'cookie超时，请重新登录',
            data: null
        }
    } else {
        let query_params = ctx.request.body;
        if (query_params.team_id && query_params.user) {
            result = await TeamController.addUserToGrope(query_params.team_id, cookie_user, query_params.user)
        } else {
            result = {
                code: 400,
                msg: 'Wrong query param.',
                data: null
            }
        }
    }
    response(ctx, result)
});

// 只能申请普通小组
router.post('/Member/Addition/', async (ctx) => {
    let result = null;
    let cookie_user = await CookieController.getUsernameFromCtx(ctx);
    if (cookie_user === -2) {
        result = {
            code: 401,
            msg: 'cookie超时，请重新登录',
            data: null
        }
    } else {
        let query_params = ctx.request.body;
        if (query_params.team_id) {
            result = await TeamController.addUserToGrope2(query_params.team_id, cookie_user)
        } else {
            result = {
                code: 400,
                msg: 'Wrong query param.',
                data: null
            }
        }
    }
    response(ctx, result)
});

router.post('/Member/Rejection/', async (ctx) => {
    let result = null;
    let cookie_user = await CookieController.getUsernameFromCtx(ctx);
    if (cookie_user === -2) {
        result = {
            code: 401,
            msg: 'cookie超时，请重新登录',
            data: null
        }
    } else {
        let query_params = ctx.request.body;
        if (query_params.username && query_params.team_id) {
            result = await TeamController.rejectUserToGrope(query_params.username, query_params.team_id, cookie_user)
        } else {
            result = {
                code: 400,
                msg: 'Wrong query param.',
                data: null
            }
        }
    }
    response(ctx, result)
});

router.post('/Leader/', async (ctx) => {
    let result = null;
    let cookie_user = await CookieController.getUsernameFromCtx(ctx);
    if (cookie_user === -2) {
        result = {
            code: 401,
            msg: 'cookie超时，请重新登录',
            data: null
        }
    } else {
        let query_params = ctx.request.body;
        if (query_params.team_id && query_params.username) {
            result = await TeamController.updateTeamLeader(query_params.team_id, cookie_user, query_params.username)
        } else {
            result = {
                code: 400,
                msg: 'Wrong query param.',
                data: null
            }
        }
    }
    response(ctx, result)
});

router.del('/Member/Dislodge/', async (ctx) => {
    let result = null;
    let cookie_user = await CookieController.getUsernameFromCtx(ctx);
    if (cookie_user === -2) {
        result = {
            code: 401,
            msg: 'cookie超时，请重新登录',
            data: null
        }
    } else {
        let query_params = ctx.query;
        if (query_params.team_id && query_params.username) {
            result = await TeamController.deleteUserFromGrope(query_params.team_id, cookie_user, query_params.username)
        } else {
            result = {
                code: 400,
                msg: 'Wrong query param.',
                data: null
            }
        }
    }
    response(ctx, result)
});

router.del('/Member/Departure/', async (ctx) => {
    let result = null;
    let cookie_user = await CookieController.getUsernameFromCtx(ctx);
    if (cookie_user === -2) {
        result = {
            code: 401,
            msg: 'cookie超时，请重新登录',
            data: null
        }
    } else {
        let query_params = ctx.query;
        if (query_params.team_id) {
            result = await TeamController.deleteUserFromGrope2(query_params.team_id, cookie_user)
        } else {
            result = {
                code: 400,
                msg: 'Wrong query param.',
                data: null
            }
        }
    }
    response(ctx, result)
});

router.del('/', async (ctx) => {
    let result = null;
    let cookie_user = await CookieController.getUsernameFromCtx(ctx);
    if (cookie_user === -2) {
        result = {
            code: 401,
            msg: 'cookie超时，请重新登录',
            data: null
        }
    } else {
        let query_params = ctx.query;
        if (query_params.team_id) {
            result = await TeamController.deleteGroup(query_params.team_id, cookie_user);
        } else {
            result = {
                code: 400,
                msg: 'Wrong query param.',
                data: null
            }
        }
    }
    response(ctx, result)
});

router.get('/DefaultGroup/', async (ctx) => {
    let result = null;
    result = await TeamController.getDefaultGroup();

    response(ctx, result);
});


let response = (ctx, result) => {
    ctx.response.status = result.code;
    ctx.body = {
        code: result.code,
        msg: result.msg,
        data: result.data
    };
    return ctx;
};

module.exports = router;