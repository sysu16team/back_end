const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');

const routers = require('./routes/routers');

const cors = require('koa-cors');

const session = require("koa-session2");
const Store = require('./utils/Store.js');
require('./config/basicStr');

// 使用koa-cors
app.use(cors({
  credentials: true
}));
// app.use(cors());
// error handler
onerror(app);

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}));
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));

app.use(views(__dirname + '/views', {
  extension: 'pug'
}));

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
});


app.use(session({
  // store: new Store(),
  key: "SESSIONID",
  maxAge: 6000000,
  rolling: true
}));

// Will redirect all unlogin request to login page except the page with
// 1. static...
// 2. api ...
// 3. index.html 
// Or have login in the system
app.use(async (ctx, next) => {
  console.log(ctx.url, ctx.url == '/index.html');
  console.log(ctx.session.username);

  if (/(index.html|api|static)/.test(ctx.url) || ctx.session.username) {
    await next();
  } else {
    ctx.response.redirect('/index.html#/login');
  }
})

// routes
app.use(routers.index.routes(), routers.index.allowedMethods());
app.use(routers.team_api.routes(), routers.team_api.allowedMethods());
app.use(routers.task_api.routes(), routers.task_api.allowedMethods());
app.use(routers.user_api.routes(), routers.user_api.allowedMethods());
app.use(routers.tr_api.routes(), routers.tr_api.allowedMethods());
app.use(routers.file_api.routes(), routers.file_api.allowedMethods());
app.use(routers.toast_api.routes(), routers.toast_api.allowedMethods());

const koaBody = require('koa-body');
app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 200*1024*1024    // 设置上传文件大小最大限制，默认2M
  }
}));


// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

const path = require('path');
const koa_static = require('koa-static');
const staticPath = './static';

app.use(koa_static(
	path.join(__dirname, staticPath)
));


module.exports = app;
