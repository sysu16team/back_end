class User {
    constructor() {
        this._username = '';
        this._password = '';
        this._score = 0;
        this._money = 0;
        this._trueName = '';
        this._schoolName = '';

        this._grade = 0;
        this._nickname = '';
        this._phoneNumber = '';
        this._accountState = 0;
        this._email = '';
    }

    _constructorWithParameter(username, password, score, money, true_name, school_name, grade, nickname, phone_number, account_state,email) {
        this._username = username;
        this._password = password;
        this._score = score;
        this._money = money; 
        this._trueName = true_name;
        this._schoolName = school_name;
        this._grade = grade;
        this._nickname = nickname;
        this._phoneNumber = phone_number;
        this._accountState = account_state;     
        this._email = email;
    }

    _constructorWithExample(user) {
        this._username = user.getUsername();
        this._password = user.getPassword();
        this._score = user.getScore();
        this._money = user.getMoney();
        this._trueName = user.getTrueName();
        this._schoolName = user.getSchoolName();
        this._grade = user.getGrade();
        this._nickname = user.getNickname();
        this._phoneNumber = user.getPhoneNumber();
        this._accountState = user.getAccountState();
        this._email = user.getEmail();
    }

    getUsername() {
        return this._username;
    }

    setUsername(username) {
        this._username = username;
    }

    getPassword() {
        return this._password;
    }

    setPassword(password) {
        this._password = password;
    }

    getScore() {
        return this._score;
    }

    setScore(score) {
        this._score = score;
    }

    getMoney() {
        return this._money;
    }

    setMoney(money) {
        this._money = money;
    }

    getTrueName() {
        return this._trueName;
    }
    
    setTrueName(true_name) {
        this._trueName = true_name;
    }
    
    getSchoolName() {
        return this._schoolName;
    } 

    setSchoolName(school_name) {
        this._schoolName = school_name;
    }
    
    getGrade() {
        return this._grade;
    } 
    
    setGrade(grade) {
        this._grade = grade;
    }


    getNickname() {
        return this._nickname;
    } 

    setNickname(nickname) {
        this._nickname = nickname;
    } 

    getPhoneNumber() {
        return this._phoneNumber;
    } 
    
    setPhoneNumber(phone_number) {
        this._phoneNumber = phone_number;
    }

    getAccountState() {
        return this._accountState;
    }

    setAccountState(account_state) {
        this._accountState = account_state;
    }

    getEmail(){
        return this._email;
    }

    setEmail(email)
    {
        this._email=email;
    }
}

module.exports = User;