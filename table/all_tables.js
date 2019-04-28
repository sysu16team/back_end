const db = require('../config/db');
const sequelize = db.sequelize;

const User = sequelize.import('./user');
const Task = sequelize.import('./task');
const TR = sequelize.import('./tr');
const TeamTask = sequelize.import('./teamtask');
const PIT = sequelize.import('./pit');
const PIU = sequelize.import('./piu');
const Members = sequelize.import('./members');
const TeamLabel = sequelize.import('./teamlabel');
const Team = sequelize.import('./team');



Team.belongsToMany(Task, {through: TeamTask, foreignKey: 'team_id'})
Task.belongsToMany(Team, {through: TeamTask, foreignKey: 'task_id'})

Task.belongsToMany(User, {through: TR, foreignKey: 'task_id'})
User.belongsToMany(Task, {through: TR, foreignKey: 'username'})

User.hasMany(Task, {foreignKey: 'publisher'})
Task.belongsTo(User, {foreignKey: 'publisher'})

const status_code = {
	tr: {
        // 0: waiting to be done
        // 1: accpeter complete, waiting publisher confirm
        // 2: publisher confirmed, over
		WAITING_TO_BE_DONE: 0,
		WAITING_CONFIRM: 1,
		CONFIRMED_OVER: 2 
	},
	task: {
		WAITING_ACCPET : 0, 
		ACCEPETED_AND_DOING : 1, 
		ACCPETER_COMPLETE_WAITING_CONFIRM : 2, 
        CONFIRM_OVER : 3, 
        EXCEED_DDL_NOT_DONE: 4
	}
}

User.sync({force: false});
Task.sync({force: false});
TR.sync({force: false});
TeamTask.sync({force: false});
PIT.sync({force: false});
PIU.sync({force: false});
Members.sync({force: false});
TeamLabel.sync({force: false});
Team.sync({force: false});

sequelize.sync({force: false});

module.exports = {
    User: User,
    Task: Task,
    TR: TR,
    TeamTask: TeamTask,
    PIT: PIT,
    PIU: PIU,
    Members: Members,
    TeamLabel: TeamLabel,
    Team: Team,
    status_code: status_code
};