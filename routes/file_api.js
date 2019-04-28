const router = require('koa-router')();
const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');
const AnalysisModel = require('../questionnaire/analysis.js');
require('../config/basicStr');
const FileController = require('../controller/fileController');

router.prefix('/api/v1/file');

router.post('/TeamLogo', async (ctx, next) => {
    const serverPath = path.join(__dirname, '../static/uploads/');
    // 获取上存图片
    const result = await FileController.uploadFile(ctx, {
        fileType: 'team',
        path: serverPath
    });

    ctx.body = {
        code: result.code,
        msg: result.msg,
        data: {
            imgUrl: defaultIP + '/uploads' + result.imgPath,
        }
    };
});

router.post('/Questionnaire', async (ctx, next) => {
    const serverPath = path.join(__dirname, '../static/uploads/');
    // 获取上存文件
    const result = await FileController.uploadFile(ctx, {
        fileType: 'questionnaire',
        path: serverPath
    });

    AnalysisModel.AnalysisQuestionnaire('./static/uploads' + result.imgPath);

    ctx.body = {
        code: result.code,
        msg: result.msg,
        data: {
            fileUrl: defaultIP + '/uploads' + result.imgPath.split('.')[0] + '.json',
        }
    };
});


module.exports = router;