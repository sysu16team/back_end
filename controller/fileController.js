const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');

const mkdirsSync = (dirname) => {
    if (fs.existsSync(dirname)) {
        return true
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true
        }
    }
    return false
};

class FileController {
    static async uploadFile (ctx, options) {
        const _emmiter = new Busboy({headers: ctx.req.headers});
        const fileType = options.fileType;
        const filePath = path.join(options.path, fileType);
        const confirm = mkdirsSync(filePath);
        if (!confirm) {
            return
        }
        return new Promise((resolve, reject) => {
            _emmiter.on('file', function (fieldname, file, filename, encoding, mimetype) {
                const fileName = Math.random().toString(16).substr(2) + '.' + filename.split('.').pop();
                const saveTo = path.join(path.join(filePath, fileName));
                file.pipe(fs.createWriteStream(saveTo));
                file.on('end', function () {
                    resolve({
                        code: 200,
                        msg: '上传成功',
                        imgPath: `/${fileType}/${fileName}`
                    })
                })
            });

            _emmiter.on('finish', function () {
            });

            _emmiter.on('error', function (err) {
                reject(err)
            });

            ctx.req.pipe(_emmiter)
        })
    }

}

module.exports = FileController;