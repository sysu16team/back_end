const router = require('koa-router')();
const ToastController = require('../controller/toastController');
const CookieController = require('../controller/CookieController');

router.prefix('/api/v1/toast');

router.get('/', async (ctx) => {
    let result = null;
    let cookie_user = await CookieController.getUsernameFromCtx(ctx);
    if (cookie_user !== -2) {
        result = await ToastController.getToastByUsername(cookie_user)
    } else {
        result = {
            code: 401,
            msg: 'cookie超时，请重新登录',
            data: null
        }
    }
    response(ctx, result);
});

router.del('/Id/', async (ctx) => {
    let cookie_user = await CookieController.getUsernameFromCtx(ctx);
    let result = null;
    let query_params = ctx.query;
    if (query_params.id && cookie_user !== -2) {
        result = await ToastController.deleteToastById(query_params.id, cookie_user)
    } else if (cookie_user === -2) {
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
    response(ctx, result)
});

router.del('/Username/', async (ctx) => {
    let result = null;
    let cookie_user = await CookieController.getUsernameFromCtx(ctx);
    if (cookie_user !== -2) {
        result = await ToastController.deleteToastByUsername(cookie_user)
    } else {
        result = {
            code: 401,
            msg: 'cookie超时，请重新登录',
            data: null
        }
    }
    response(ctx, result)
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