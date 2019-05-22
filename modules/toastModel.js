const db = require('../config/db');
const Sequelize = require('sequelize');
const sequelize = db.sequelize;
const Toast = sequelize.import('../table/toast');
const Team = sequelize.import('../table/team');
const Task = sequelize.import('../table/task');
Toast.sync({force: false});
Team.sync({force: false});
Task.sync({force: false});

class ToastModel {
    // 创建提示信息
    static async createToast(username, type, message, msg_username, msg_team_id,
                             msg_team_name, msg_task_id, msg_task_title) {
        return await Toast.create({
            username: username,
            type: type,
            message: message,
            msg_username: msg_username,
            msg_team_id: msg_team_id,
            msg_team_name: msg_team_name,
            msg_task_id: msg_task_id,
            msg_task_title: msg_task_title
        })
    }

    // 通过用户名查找消息
    static async getToastByUsername(username) {
        return await Toast.findAll({
            attributes: ['id', 'username', 'type', 'message', 'msg_username', 'msg_team_id',
                'msg_team_name', 'msg_task_id', 'msg_task_title'],
            where: {
                username: username,
            }
        })
    }

    // 通过id查找消息
    static async getToastById(id) {
        return await Toast.findOne({
            attributes: ['id', 'username', 'type', 'message', 'msg_username', 'msg_team_id', 'msg_task_id'],
            where: {
                id: id
            }
        })
    }

    static async getToastByMessage(type, msg_username, msg_team_id) {
        return await Toast.findOne({
            attributes: ['id', 'username', 'type', 'message', 'msg_username', 'msg_team_id', 'msg_task_id'],
            where: {
                type: type,
                msg_username: msg_username,
                msg_team_id: msg_team_id,
            }
        })
    }

    // 删除消息
    static async deleteToastByIdUsername(id, username) {
        return await Toast.destroy({
            where: {
                id: id,
                username: username
            }
        })
    }

    static async deleteToastByUsername(username) {
        return await Toast.destroy({
            where: {
                username: username
            }
        })
    }
}

module.exports = ToastModel;