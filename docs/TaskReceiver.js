class TaskReceiver {
    constructor(){
        this._id = 0;                 // ID
        this._receiver = '';         // 接受者 User
    }

    _constructorWithParameter(id, receiver) {
        this._id = id;
        thsi._receiver = receiver;
    }

    getId() {
        return this._id;
    }

    setId(value) {
        this._id = value;
    }

    getReceiver() {
        return this._receiver;
    }

    setReceiver(value) {
        this._receiver = value;
    }
}