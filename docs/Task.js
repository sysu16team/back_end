class Task {
    constructor(){
        this._id = 0;                // ID
        this._title = '';            // 标题
        this._intro = '';            // 简介
        this._money = 0;             // 金额
        this._number = 0;            // 数量 （接受任务人的数量）
        this._remark = '';           // 备注
        this._type = '';             // 类型 （调查问卷，取快递。。）
        this._time = new Date();     // 时间
        this._range = '';            // 范围 （全部，小组，机构）
        this._publisher = '';        // 发布者  用户类的实例  User
        this._content = '';          // 内容 （问卷，详细任务介绍）
        this._state = '';            // 完成度 （未被接受，进行中，等待检验核实，已完成）
    }

    _constructorWithParameter(id, title, introduction, money, number, remark, type, time , range, publisher, content, state){
        this._id = id;
        this._title = title;
        this._introduction = introduction;
        this._money = money;
        this._number = number;
        this._remark = remark;
        this._type = type;
        this._time = time;
        this._range = range;
        this._publisher = publisher;
        this._content = content;
        this._state = state;
    }

    _constructorWithExample(task){
        this._id = task.getId();
        this._title = task.getTitle();
        this._introduction = task.getIntroduction();
        this._money = task.getMoney();
        this._number = task.getNumber();
        this._remark = task.getRemark();
        this._type = task.getType();
        this._time = task.getTime();
        this._range = task.getRange();
        this._publisher = task.getPublisher();
        this._content = task.getContent();
        this._state = task.getState();
    }

    getId() {
        return this._id;
    }

    setId(value) {
        this._id = value;
    }

    getTitle() {
        return this._title;
    }

    setTitle(value) {
        this._title = value;
    }

    getIntroduction() {
        return this._introduction;
    }

    setIntroduction(value) {
        this._introduction = value;
    }

    getMoney() {
        return this._money;
    }

    setMoney(value) {
        this._money = value;
    }

    getNumber() {
        return this._number;
    }

    setNumber(value) {
        this._number = value;
    }

    getRemark() {
        return this._remark;
    }

    setRemark(value) {
        this._remark = value;
    }

    getType() {
        return this._type;
    }

    setType(value) {
        this._type = value;
    }

    getTime() {
        return this._time;
    }

    setTime(value) {
        this._time = value;
    }

    getRange() {
        return this._range;
    }

    setRange(value) {
        this._range = value;
    }

    getPublisher() {
        return this._publisher;
    }

    setPublisher(value) {
        this._publisher = value;
    }

    getContent() {
        return this._content;
    }

    setContent(value) {
        this._content = value;
    }

    getState() {
        return this._state;
    }

    setState(value) {
        this._state = value;
    }
}

module.exports = Task;