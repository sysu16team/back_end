const Sequelize = require('sequelize')
const sd = require('silly-datetime')
const models = require('../table/all_tables')
const Op = Sequelize.Op
var schedule = require("node-schedule");

let scheduler = async () => {
    let time = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
    let count = await models.Task.update({
        state: models.status_code.task.EXCEED_DDL_NOT_DONE
    },{
        where: {
            endtime: {
                [Op.lt]: time
            },
            state: {
                [Op.notIn]: [models.status_code.task.CONFIRM_OVER, models.status_code.task.EXCEED_DDL_NOT_DONE]
            }
        }
    });
    console.log('Service scheduler runned...')
    console.log('\t Update ' + count + ' tasks to exceed ddl.')
}

schedule.scheduleJob('01 * * * * *', scheduler);