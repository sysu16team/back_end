class Members {
    constructor() {
        this._teamId = 0;
        this._username = '';
    }

    _constructorWithParameter(teamId, username) {
        this._teamId = teamId;
        this._username = username;
    }

    _constructorWithExample(member) {
        this._teamId = member.getTeamId();
        this._username = member.getUsername();
    }

    getTeamId() {
        return this._teamId;
    }

    setTeamId(teamId) {
        this._teamId = teamId;
    }

    getUsername() {
        return this._username;
    }

    setUsername(username) {
        this._username = username;
    }
}

module.exports = Members;