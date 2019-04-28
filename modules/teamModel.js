const db = require('../config/db');
const Sequelize = require('sequelize');
const sequelize = db.sequelize;
const Op = Sequelize.Op;
const User = sequelize.import('../table/user');
const Team = sequelize.import('../table/team');
const Teamlabel = sequelize.import('../table/teamlabel');
const Members = sequelize.import('../table/members');
const Pit = sequelize.import('../table/pit');
// const Toast = sequelize.import('../table/toast');

User.sync({force: false});
Team.sync({force: false});
Teamlabel.sync({force: false});
Members.sync({force: false});
// Toast.sync({force: false});

class TeamModel {
    // 创建小组
    static async createTeam(data) {
        return await Team.create({
            team_name : data.team_name,
            leader : data.leader,
            logo : data.logo,
            description : data.description,
            limit : data.limit,
            type: data.type
        })
    }

    static async createTeamMember(team_id, username) {
        return await Members.create({
            team_id : team_id,
            member_username : username
        })
    }

    static async createTeamLabel(team_id, label) {
        return await Teamlabel.create({
            team_id : team_id,
            label : label
        })
    }

    static async getAllTeam() {
        Team.hasMany(Teamlabel, {foreignKey : 'team_id'});
        Teamlabel.belongsTo(Team, {foreignKey : 'team_id'});
        Team.hasMany(Members, {foreignKey : 'team_id'});
        Members.belongsTo(Team, {foreignKey : 'team_id'});
        return await Team.findAll({
            attributes: ['team_id', 'team_name', 'leader', 'logo', 'description', 'limit'],
            where: {
            },
            include: [{
                attributes: ['team_id', 'label'],
                model: Teamlabel,
            },{
                attributes: ['team_id', 'member_username'],
                model: Members,
            }],
        })
    }

    //  根据组名来查找小组
    static async getTeamByName(team_name, type) {
        Team.hasMany(Teamlabel, {foreignKey : 'team_id'});
        Teamlabel.belongsTo(Team, {foreignKey : 'team_id'});
        Team.hasMany(Members, {foreignKey : 'team_id'});
        Members.belongsTo(Team, {foreignKey : 'team_id'});
        return await Team.findAll({
            attributes: ['team_id', 'team_name', 'leader', 'logo', 'description', 'limit'],
            where: {
                team_name: {
                    [Op.like]: '%'+team_name+'%',
                },
                type: type
            },
            include: [{
                attributes: ['team_id', 'label'],
                model: Teamlabel,
            },{
                attributes: ['team_id', 'member_username'],
                model: Members,
            }],
        })
    }

    // 根据小组id来查找小组
    static async getTeamByTeamId(team_id, type) {
        Team.hasMany(Teamlabel, {foreignKey : 'team_id'});
        Teamlabel.belongsTo(Team, {foreignKey : 'team_id'});
        Team.hasMany(Members, {foreignKey : 'team_id'});
        Members.belongsTo(Team, {foreignKey : 'team_id'});
        return await Team.findOne({
            attributes: ['team_id', 'team_name', 'leader', 'logo', 'description', 'limit'],
            where: {
                team_id : team_id,
                type: type
            },
            include: [{
                attributes: ['team_id', 'label'],
                model: Teamlabel,
            },{
                attributes: ['team_id', 'member_username'],
                model: Members,
            }],
        })
    }

    // 根据小组id来查找小组
    static async getTeamByTeamId2(team_id, type) {
        Team.hasMany(Teamlabel, {foreignKey : 'team_id'});
        Teamlabel.belongsTo(Team, {foreignKey : 'team_id'});
        Team.hasMany(Members, {foreignKey : 'team_id'});
        Members.belongsTo(Team, {foreignKey : 'team_id'});
        return await Team.findAll({
            attributes: ['team_id', 'team_name', 'leader', 'logo', 'description', 'limit'],
            where: {
                team_id : team_id,
                type: type
            },
            include: [{
                attributes: ['team_id', 'label'],
                model: Teamlabel,
            },{
                attributes: ['team_id', 'member_username'],
                model: Members,
            }],
        })
    }

    // 根据标签来查找小组
    static async getTeamByLabel(label, type) {
        Team.hasMany(Teamlabel, {foreignKey : 'team_id'});
        Teamlabel.belongsTo(Team, {foreignKey : 'team_id'});
        Team.hasMany(Members, {foreignKey : 'team_id'});
        Members.belongsTo(Team, {foreignKey : 'team_id'});

        let team = await Team.findAll({
            include: [{
                model: Teamlabel,
                where: {
                    label: label,
                }
            }]
        });
        if (team.length === 0)
            return [];
        let result;
        result = await TeamModel.getTeamByTeamId2(team[0].team_id, type);
        for (let i = 1; i < team.length; i++) {
            let tem = await TeamModel.getTeamByTeamId(team[i].team_id, type);
            if (tem !== null)
                result.push(tem);
            // result.push(await TeamModel.getTeamByTeamId(team[i].team_id, type));
        }
        return result;
    }

    // 获取小组权限,使用根据小组id来查找小组

    //  根据用户名返回用户加入了的小组
    static async getTeamByUsername(member_username, type) {
        Team.hasMany(Members, {foreignKey : 'team_id'});
        Members.belongsTo(Team, {foreignKey : 'team_id'});
        Team.hasMany(Teamlabel, {foreignKey : 'team_id'});
        Teamlabel.belongsTo(Team, {foreignKey : 'team_id'});

        let team = await Team.findAll({
            include: [{
                model: Members,
                where: {
                    member_username : member_username
                }
            }]
        });
        if (team.length === 0)
            return [];
        let result;
        result = await TeamModel.getTeamByTeamId2(team[0].team_id, type);
        for (let i = 1; i < team.length; i++) {
            let tem = await TeamModel.getTeamByTeamId(team[i].team_id, type);
            if (tem !== null)
                result.push(tem);
        }
        return result;
    }

    static async getTeamByOrgname(member_username, type) {
        Team.hasMany(Pit, {foreignKey : 'team_id'});
        Pit.belongsTo(Team, {foreignKey : 'team_id'});
        Team.hasMany(Teamlabel, {foreignKey : 'team_id'});
        Teamlabel.belongsTo(Team, {foreignKey : 'team_id'});

        let team = await Team.findAll({
            include: [{
                model: Pit,
                where: {
                    ins_name : member_username
                }
            }]
        });
        if (team.length === 0)
            return [];
        let result;
        result = await TeamModel.getTeamByTeamId2(team[0].team_id, type);
        for (let i = 1; i < team.length; i++) {
            let tem = await TeamModel.getTeamByTeamId(team[i].team_id, type);
            if (tem !== null)
                result.push(tem);
        }
        return result;
    }

    // 返回用户是否是该小组组长，使用根据小组id来查找小组

    // 返回用户是否是该小组成员
    static async getUserByTeamIdUsername(team_id, member_username) {
        return await Members.findAll({
            where: {
                team_id : team_id,
                member_username : member_username
            }
        })
    }

    static async getOrgByTeamIdOrgName(team_id, member_username) {
        return await Pit.findAll({
            where: {
                team_id : team_id,
                ins_name : member_username
            }
        })
    }

    // 解散小组
    static async deleteTeamMember(team_id) {
        return await Members.destroy({
            where: {
                team_id : team_id
            }
        })
    }

    static async deleteTeamLabel(team_id) {
        return await Teamlabel.destroy({
            where: {
                team_id : team_id
            }
        })
    }

    static async deleteTeamPit(team_id) {
        return await Pit.destroy({
            where: {
                team_id : team_id
            }
        })
    }

    static async deleteTeam(team_id) {
        return await Team.destroy({
            where: {
                team_id : team_id
            }
        })
    }

    // 删除成员
    static async deleteMember(team_id, member_username) {
        return await Members.destroy({
            where: {
                team_id : team_id,
                member_username : member_username
            }
        })
    }

    // 修改组长
    static async updateTeamLeader(team_id, leader, username) {
        await Team.update({
            leader : username
        }, {
            where: {
                team_id : team_id,
                leader : leader
            }
        })
    }

    // 判断是否有user
    static async getUserByUsername(username) {
        return await User.findOne({
            where: {
                username : username
            }
        })
    }

    // 添加成员
    static async createMembers(team_id, member_username) {
        return await Members.create({
            team_id : team_id,
            member_username : member_username
        })
    }

    static async createOrganizaitons(team_id, member_username) {
        return await Pit.create({
            ins_name: member_username,
            team_id: team_id
        })
    }

    // 修改小组全部信息
    static async updateTeamDescription(new_data) {
        await Team.update({
            team_name: new_data.team_name,
            logo: new_data.logo,
            description: new_data.description,
            limit: new_data.limit
        }, {
            where: {
                team_id : new_data.team_id
            }
        })
    }

    // 查找默认小组
    static async getDefaultTeam() {
        Team.hasMany(Teamlabel, {foreignKey : 'team_id'});
        Teamlabel.belongsTo(Team, {foreignKey : 'team_id'});
        Team.hasMany(Members, {foreignKey : 'team_id'});
        Members.belongsTo(Team, {foreignKey : 'team_id'});
        return await Team.findAll({
            attributes: ['team_id', 'team_name', 'leader', 'logo', 'description', 'limit', 'type'],
            where: {
                type: 1
            },
            include: [{
                attributes: ['team_id', 'label'],
                model: Teamlabel,
            },{
                attributes: ['team_id', 'member_username'],
                model: Members,
            }],
        })
    }

    // 添加成员到默认小组
    static async addToDefaultTeam(username) {
        let user = await TeamModel.getUserByUsername(username);
        if (user.account_state === 0) {
            await TeamModel.createMembers(1, username);
            await TeamModel.createMembers(user.grade + 1, username);
        } else {
            await TeamModel.createOrganizaitons(1, username);
            await TeamModel.createOrganizaitons(2, username);
            await TeamModel.createOrganizaitons(3, username);
            await TeamModel.createOrganizaitons(4, username);
            await TeamModel.createOrganizaitons(5, username);
        }
    }

}
module.exports = TeamModel;