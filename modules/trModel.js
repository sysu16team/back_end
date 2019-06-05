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

    static async deleteTR(username, task_id) {
        return await models.TR.destroy({
            where: {
                username: username,
                task_id: task_id
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

    static async accepter_make_complement(post_body) {
        let task_type = await models.Task.findByPk(post_body.task_id).type
        if (task_type == 1 /** 问卷调查 */ && post_body.questionnaire_path == undefined) {
            throw Error("Need questionnaire result file")
        }
        post_body.questionnaire_path = post_body.questionnaire_path == undefined ? "" : post_body.questionnaire_path
        return await models.TR.update({
            state: models.status_code.tr.WAITING_CONFIRM,
            questionnaire_path: post_body.questionnaire_path
        }, {
            where: {
                username: post_body.username,
                task_id: post_body.task_id
            }
        })
    }

    static async comfirm_complement(username, task_id, score) {
        score = parseFloat(score)
        let user_task_info = await Promise.all([
            models.TR.update({
                state: models.status_code.tr.CONFIRMED_OVER,
                score: score
            }, {
                where: {
                    username: username,
                    task_id: task_id
                }
            }),
            models.User.findByPk(username, {
                // TODO, 更新评分，使用score来更新
                attributes: ['task_complete', 'score']
            })
        ])
        let user_task_count = user_task_info[1].task_complete;
        let user_score_current = user_task_info[1].score;
        let count = await Promise.all([
            models.TR.count({
                where: {
                    task_id: task_id
                }
            }), 
            models.TR.count({
                where: {
                    task_id: task_id,
                    state: models.status_code.tr.CONFIRMED_OVER
                }
            }),
            models.Task.findByPk(task_id, {
                where: {
                    task_id: task_id
                },
                attributes: ['max_accepter_number'],
                raw: true
            }),
            models.User.update({
                score: (user_score_current * user_task_count + score) / (user_task_count + 1),
                task_complete: user_task_count + 1
            }, {
                where: {
                    username: username
                }
            })
        ]);

        if (count[0] == count[1] && count[0] == count[2].max_accepter_number) {
            await models.Task.update({
                state: models.status_code.task.CONFIRM_OVER
            }, {
                where: {
                    task_id: task_id
                }
            })
        }

        return await Promise.all([
            models.TR.findOne({
                where: {
                    username: username,
                    task_id: task_id
                }
            }),
            models.User.findByPk(username)
        ])
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