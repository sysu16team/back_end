class Team {
    constructor() {
        this._id = 0;
        this._name = '';
        this._logo = '';
        this._description = '';
        this._tag = '';
    }

    _constructorWithParameter(id, name, logo, description, tag) {
        this._id = id;
        this._name = name;
        this._logo = logo;
        this._description = description;
        this._tag = tag;
    }

    _constructorWithExample(team) {
        this._id = team.getId();
        this._name = team.getName();
        this._logo = team.getLogo();
        this._description = team.getDescription();
        this._tag = team.getTag();
    }

    getId() {
        return this._id;
    }

    setId(id) {
        this._id = id;
    }

    getName() {
        return this._name;
    }

    setName(name) {
        this._name = name;
    }

    getLogo() {
        return this._logo;
    }

    setLogo(logo) {
        this._logo = logo;
    }

    getDescription() {
        return this._description;
    }

    setDescription(description) {
        this._description = description;
    }

    getTag() {
        return this._tag;
    }

    setTag(tag) {
        this._tag = tag;
    }
}

module.exports = Team;