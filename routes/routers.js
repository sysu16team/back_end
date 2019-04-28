const index = require('./index.js');
const task_api = require('./task_api.js');
const team_api = require('./team_api.js');
const user_api = require('./user_api.js');
const tr_api = require('./tr_api.js');
const file_api = require('./file_api.js');
const toast_api = require('./toast_api');

module.exports = {
    index: index,
    task_api: task_api,
    team_api: team_api,
    user_api: user_api,
    tr_api: tr_api,
    file_api: file_api,
    toast_api: toast_api
};
