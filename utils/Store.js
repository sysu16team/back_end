const Redis = require("ioredis")
const { Store } = require("koa-session2")
require('../config/basicStr')

class RedisStore extends Store {
    constructor() {
        super();
        this.redis = new Redis({
            host : defaultSessionIP,//安装好的redis服务器地址
            port : 6379,　//端口
            prefix : 'sam:',//存诸前缀
            ttl : 60 * 60 * 24,//过期时间
            db: 0
        });
    }

    async get(sid, ctx) {
        let data = await this.redis.get('SESSION:' + sid);
        return JSON.parse(data)
    }

    async set(session, { sid =  this.getID(24), maxAge = 1000 * 60 * 60 } = {}, ctx) {
        try {
            console.log(`SESSION:${sid}`);
            // Use redis set EX to automatically drop expired sessions
            await this.redis.set(`SESSION:${sid}`, JSON.stringify(session), 'EX', maxAge / 1000);
        } catch (e) {}
        return sid;
    }

    async destroy(sid, ctx) {
        return await this.redis.del(`SESSION:${sid}`);
    }
}

module.exports = RedisStore;
