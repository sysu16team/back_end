const ToastModel = require('../modules/toastModel');

class ToastController {
    static async getToastByUsername(username) {
        let result = null;
        try {
            let data = await ToastModel.getToastByUsername(username);
            if (data.length === 0) {
                result = {
                    code: 200,
                    msg: '查询成功，没有消息',
                    data: []
                };
            } else {
                result = {
                    code: 200,
                    msg: '查询成功',
                    data: data
                };
            }
        } catch (err) {
            result = {
                code: 412,
                msg: '查询失败',
                data: err.message
            };
        }
        return result;
    }

    // 200 成功，412 异常, 220 没有消息
    static async deleteToastById(id, username) {
        let result = null;
        try {
            let toast = await ToastModel.getToastById(id);
            if (toast === null) {
                result = {
                    code: 200,
                    msg: '删除失败，没有该消息',
                    data: false
                };
            } else if (toast.username !== username) {
                result = {
                    code: 401,
                    msg: 'cookie不正确',
                    data: null
                }
            } else {
                await ToastModel.deleteToastByIdUsername(id, username);
                result = {
                    code: 200,
                    msg: '删除成功',
                    data: true
                };
            }
        } catch (err) {
            result = {
                code: 412,
                msg: '查询失败',
                data: err
            };
        }
        return result;
    }

    // 200 成功，412 异常, 220 没有消息
    static async deleteToastByUsername(username) {
        let result = null;
        try {
            let toast = await ToastModel.getToastByUsername(username);
            if (toast === null) {
                result = {
                    code: 200,
                    msg: '删除失败，没有消息',
                    data: false
                };
            } else {
                await ToastModel.deleteToastByUsername(username);
                result = {
                    code: 200,
                    msg: '删除成功',
                    data: true
                };
            }
        } catch (err) {
            result = {
                code: 412,
                msg: '查询失败',
                data: err
            };
        }
        return result;
    }
}
module.exports = ToastController;