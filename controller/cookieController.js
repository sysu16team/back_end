const session = require("koa-session2");
const Store = require("../utils/Store.js");
global.redis = new Store();

class CookieController {
    /** 
     * @param ctx
     * @returns
     */
    static async judgeCookies(ctx) {
        return ctx.session.username ? 0 : -1;
    }

    /**
     * @param ctx
     * @returns
     */
    static async getUsernameFromCtx(ctx) {
        return ctx.session.username ? ctx.session.username : -2;
    }
}

module.exports = CookieController;