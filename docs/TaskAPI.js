let Task = require('./Task');

let task = new Task();

// 发布任务
// 数据库创建，更新函数
function ReleaseTask(task) {
    if (typeof (task) === 'object') {
        console.log(ReleaseTask);
    }
}

// 填写任务内容
function FillTaskContent(task, comtect) {

}

// 支付金额
function PayAmount(task, user) {

}

// 搜索任务
// 数据库查询函数
function SearchTaskByType(type, arr) {
    return arr;
}

function SearchTaskByRange(range, arr) {
    return arr;
}

function SearchTaskByMoney(money, arr) {
    return task;
}

function SearchTaskByUserRelease(user, arr) {
    return arr;
}

function SearchTaskByUserAccept(user, arr) {
    return arr;
}

function SearchTaskByState(state, arr) {
    return arr;
}

// 接受任务
function AcceptTask(user, task) {

}

// 检查任务
// 数据库更新函数
// 输入：用户信息(发布者)， 已完成状态
// --->输出： 更新后台数据库信息
function UpdateTaskByUserRelease(user, state) {
    return true; // false
}

// 输入：用户信息(接受者)， 等待检验核实状态
// --->输出： 更新后台数据库信息
function UpdateTaskByUserAccept(user, state) {
    return true; // false
}

// 删除任务
// 数据库删除函数
//
function DeleteTaskByRelease(user, taskID) {
    return true; // fasle
}
