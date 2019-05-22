const db = require('../config/db');
const Sequelize = require('sequelize')
const sequelize = db.sequelize;
const models = require('../table/all_tables')
const Op = Sequelize.Op

class TRModel {
    /**
     * Search tr by most common restriction, as username adn task_id
     * @param {*} username 
     * @param {*} task_id 
     * @return {*} An object, such as ` {username: *, task_id: * }`
     */
    static async searchTR(username, task_id) {
        return await models.TR.findOne({
            where: {
                username: username,
                task_id: task_id
            }
        })
    }

    /**
     * 添加 Task Recivers
     * @param  task_id 
     */
    static async receiveTask(username, task_id) {
        let count = await Promise.all([
            models.TR.count({
                where: {
                    task_id: task_id
                }
            }),
            models.Task.findByPk(task_id, {
                attributes: ['max_accepter_number'],
                raw: true
            })
        ])
        if (count[0] >= count[1].max_accepter_number) {
            throw new Error("Max accepter number reached");
        }
        let result = await Promise.all([
            models.TR.create({
                username: username,
                task_id: task_id,
                state: models.status_code.tr.WAITING_TO_BE_DONE
            }),
            models.Task.update({
                state: models.status_code.task.ACCEPETED_AND_DOING
            }, {
                where: {
                    task_id: task_id
                }
            })
        ]) 
        return result[0]
    }
    
     /**
     * 查询取 task relations 详情数据
     * @returns {Promise<Model>}
     * @param task_id
     */
    static async searchByTaskId(task_id) {
        return await models.TR.findAll({
            where: {
                task_id: task_id
            },
            include: {
                // model: models.User,
                association: models.User.hasMany(models.TR, {foreignKey: 'username'}),
                attributes: ['username']
            }
        })
    }

    static async searchTRByUsername(username) {
        return await models.TR.findAll({
            where: {
                username: username
            }
        })
    }

 
    
    static async searchTRByRestrict(restriction) {
        return await models.TR.findAll({
            where: restriction
        })
    }

    static async searchTRByOrganization(org_name, username, restrictions) {
        restrictions = checkParamsAndConvert(restrictions, 'type');

        let task_ids = (await models.TeamTask.findAll({
            attributes: ['task_id']
        })).map((item) => {
            return item.get('task_id')
        });

        return await models.Task.findAll({
            where: {                
                publisher: org_name,
                task_id: {
                    [Op.notIn]: task_ids
                },
                type: restrictions.type
            },
            include: [{
                association: models.Task.belongsTo(models.User, {foreignKey: 'publisher'}),
                attributes: ['username']
            }, {
                association: models.Task.hasMany(models.TR, {foreignKey: 'task_id'}),
                where: {
                    username: username
                }
            }]
        })
    }

  

    static async batch_confirm_complement(usernames, task_id, scores) {
        let batch = []
        for (let i = 0; i < usernames.length; i++) {
            batch.push(TRModel.comfirm_complement(usernames[i], task_id, scores[i]))
        }
        return await Promise.all(batch)
    }
}

function checkParamsAndConvert(query_params, whichs) {
    let _check_single = (query_params, which) => {
        if (query_params[which] == undefined
            || query_params[which].toLowerCase() == 'all') {
            // 无需任何限制
            query_params[which] = {
                [Op.or]: []
            }
        } else {
            // 说明是输入数组形式，改成 Op.or
            query_params[which] = {
                [Op.or]: query_params[which].split(',')
            }
        }
        return query_params
    }

    if (whichs instanceof Array) {
        for (i = 0; i < whichs.length; i++) {
            query_params = _check_single(query_params, whichs[i])
        }
    } else {
        query_params = _check_single(query_params, whichs)
    }
    
    return query_params
}

module.exports = TRModel;