const db = require('../config/db');
const sequelize = db.sequelize;
const User = sequelize.import('../table/user');
const Piu = sequelize.import('../table/piu')
const Team = sequelize.import('../table/team')
const Pit = sequelize.import('../table/pit')
const Tr = sequelize.import('../table/tr')
const Task = sequelize.import('../table/task')
const Organization = sequelize.import('../table/organization')
const All_Tables = require('../table/all_tables')
const TeamModel = require('./teamModel')
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


User.sync({force: false});
Piu.sync({force: false})
Team.sync({force: false})
Pit.sync({force: false})
Tr.sync({force: false})
Task.sync({force: false})

class UserModel {
    /**
     * 创建 user 模型
     * @param data
     * @returns {Promise<*>} 
     */
    static async createUser(info, avatarExtName) {
       
        var avatar = '';
        if (avatarExtName == null) {
            avatar = ''
        }
        else {
            avatar = '' + info.username + avatarExtName
        }
         
        if (info.type == 1) {
            info.grade = 0
        }

        await User.create({
            username: info.username,
            password: info.password,
            true_name: info.name,
            school_name: info.school,
            grade: info.grade,
   
            signature: info.signature,
            phone_number: info.phone,
            account_state: info.type,
            email: info.email
        })

        //await TeamModel.addToDefaultTeam(info.username)

        return "success"
    }

    /**
     * 获取用户信息
     * @param username
     * @returns {Promise<Model>}
     */
    static async getUserInfo(username) {
        const data = await User.findOne({
            where: {
                username: username
            }
        })
        return data
    }


    /**
     * 登录时检查
     * @param username
     * @param password
     * @returns {Promise<Model>}
     */
    static async getUserByUsernameAndPassword(type, username, password) {
        const user = await User.findOne({
            where: {
                username: username,
                password: password
            }
        })
        if (user == null) {
            return 1
        }
        if (user != null) {
            if (user.account_state != type) {
                return 2
            }
            return 0
        }
    }

    /**
     * 更新用户信息
     * @param info
     * @returns {Promise<Model>}
     */
    static async updateUserInfo(data, ifChangePasswd, type) {
        
        let info = {
            grade: data.grade,
            wechat: data.wechat,
            QQ: data.qq,
            phone_number: data.phone,
            signature: data.signature
        };
        
        if (ifChangePasswd) info.password = data.newPasswd;
        
        if (type == 1) info.true_name = data.name  


        return await User.update(info, {
            where: {
                username: data.username
            }
        });

    }


    /**
     * 更新用户账户余额
     * @param {*} username 
     * @param {*} money 
     */
    static async updateUserMoney(username, money) {
        const data = await User.findOne({
            where: {
                username: username
            }
        }) 
        money += data.money;
        if (money < 0) {
            return -1;
        }
        else {
            await User.update({
                money: money
            }, {
                where: {
                    username: username
                }
            });
            return 0;
        }  
    }

    /**
     * 更新用户账户余额
     * @param {*} username 
     * @param {*} money 
     */
    static async batchUpdateUserMoney(usernames, money) {
        // Can only add money
        if (money < 0) {
            throw new Error("Can only add money through this API")
        }
        let ps = []
        for (let i = 0; i < usernames.length; i++) {
            ps.push(UserModel.updateUserMoney(usernames[i], money));
        }
        return await Promise.all(ps);
    }
  
    static async deposit(username, money) {
        const data = await User.findOne({
            where: {
                username: username
            }
        }) 

        var num = Number(money) + data.money

        if (num < 0) {
            return -1;
        }
        else {
            await User.update({
                money: num
            }, {
                where: {
                    username: username
                }
            });
            return 0;
        }  
    }

    /**
     * 更新用户账户余额
     * @param {*} username 
     * @param {*} money 
     */
    static async withdraw(username, money) {
        const data = await User.findOne({
            where: {
                username: username
            }
        }) 

        var num = data.money - Number(money)

        if (num < 0) {
            return -1;
        }
        else {
            await User.update({
                money: num
            }, {
                where: {
                    username: username
                }
            });
            return 0;
        }  
    }

    /**
     * 更新用户的信用分数
     * @param {*} username 
     * @param {*} grade 
     */
    static async updateUserScore(username, score) {
        const data = await User.findOne({
            where: {
                username: username
            }
        }) 
        score += data.score;
        if (score < 0) {
            return -1;
        }
        else {
            await User.update({
                score: score
            }, {
                where: {
                    username: username
                }
            });
            return 0;
        } 
    }

    static async UserBlacklistUser(username1, username2) {

        const user1 = await User.findOne({
            where: {
                username: username1
            }
        })
        if (user1 === null) {
            return 1
        }
        const user2 = await User.findOne({
            where: {
                username: username2
            }
        })
        if (user2 === null) {
            return 2
        }
        if (user2.account_state == 1) {
            return 3
        }
        console.log(username1)
        console.log(username2)
        const relate = await Piu.findOne({
            where: {
                ins_name: username1,
                username: username2
            }
        })
        if (relate !== null) {
            return 4
        }
        console.log(username1)
        console.log(username2)
        await Piu.create({
            ins_name: username1,
            username: username2
        })
        return 0
    }

    static async TeamBlacklistOrg(ins_name, team_id, username) {
        const ins = await User.findOne({
            where: {
                username: ins_name
            }
        })
        if (ins === null) {
            return 1
        }
        if (ins.account_state != 1) {
            return 2
        }
        const team = await Team.findOne({
            where: {
                team_id: team_id
            }
        })

        if (team === null) {
            return 3
        }

        if (team.leader !== username) {
            return 5
        }


        const relate = await Pit.findOne({
            where: {
                ins_name: ins_name,
                team_id: team_id
            }
        })
        if (relate === null) {
            return 4
        }
        await Pit.destroy({
            where: {
                ins_name: ins_name,
                team_id: team_id    
            }
        })
        return 0    
    }

    static async UserCancelBlack(username1, username2) {
        const user1 = await User.findOne({
            where: {
                username: username1
            }
        })
        if (user1 === null) {
            return 1
        }
        const user2 = await User.findOne({
            where: {
                username: username2
            }
        })
        if (user2 === null) {
            return 2
        }
        if (user2.account_state == 1) {
            return 3
        }
        const relate = await Piu.findOne({
            where: {
                ins_name: username1,
                username: username2
            }
        })
        if (relate === null) {
            return 4
        }
        await Piu.destroy({
            where: {
                ins_name: username1,
                username: username2
            }
        })
        return 0        
    }

    static async teamCancelBlack(ins_name, team_id, username) {
        const ins = await User.findOne({
            where: {
                username: ins_name
            }
        })
        if (ins === null) {
            return 1
        }
        if (ins.account_state != 1) {
            return 2
        }
        const team = await Team.findOne({
            where: {
                team_id: team_id
            }
        })
        if (team === null) {
            return 3
        }
        if (team.limit == 1) {
            if (team.leader !== username) {
                return 5
            }
        }
        else if (team.limit == 2) {
            return 6
        }
        const relate = await Pit.findOne({
            where: {
                ins_name: ins_name,
                team_id: team_id
            }
        })
        if (relate !== null) {
            return 4
        }
        await Pit.create({
            ins_name: ins_name,
            team_id: team_id
        })
        return 0        
    }

    static async getUserAvatar(username) {
        const data = await User.findOne({
            where: {
                username: username
            }
        }) 
        if (data === null) {
            return 1;
        }
        return 0;   
    }

    static async getAcceptedFinishedTasks(username) {
        const tasks = await Tr.findAll({
            where: {
                username: username,
                state: All_Tables.status_code.tr.CONFIRMED_OVER
            }
        })
        let data = []
        for (var i = 0; i < tasks.length; i++) {
            const ts = await Task.findOne({
                where: {
                    task_id: tasks[i].task_id
                }
            })
            data.push({
                "taskId": ts.task_id,
                "title": ts.title,
                "introduction": ts.intro == null ? null : ts.intro,
                "starttime": ts.starttime,
                "endtime": ts.endtime,
                "score": ts.score,
                "money": ts.money
            })
        }
        return data
    }

    static async getPublishedWaitedTasks(username) {
        const tasks = await Task.findAll({
            where: {
                publisher: username,
                state: All_Tables.status_code.task.WAITING_ACCPET
            }
        })
        let data = []
        for (var i = 0; i < tasks.length; i++) {
            var ts = tasks[i]
            data.push({
                "taskId": ts.task_id,
                "title": ts.title,
                "introduction": ts.intro == null ? null : ts.intro,
                "starttime": ts.starttime,
                "endtime": ts.endtime,
                "score": ts.score,
                "money": ts.money
            })    
        }
        return data
    }

    static async getPublishedFinishedTasks(username) {
        const tasks = await Task.findAll({
            where: {
                publisher: username,
                state: All_Tables.status_code.task.CONFIRM_OVER
            }
        })
        let data = []
        for (var i = 0; i < tasks.length; i++) {
            var ts = tasks[i]
            data.push({
                "taskId": ts.task_id,
                "title": ts.title,
                "introduction": ts.intro == null ? null : ts.intro,
                "starttime": ts.starttime,
                "endtime": ts.endtime,
                "score": ts.score,
                "money": ts.money
            })    
        }
        return data    
    }

    static async getCanPublishTasksOrg(teamId) {
        const team = await Team.findOne({
            where: {
                team_id: teamId
            }
        })
        if (team == null) {
            return -1
        }
        let data = []
        const orgs = await Pit.findAll({
            where: {
                team_id: teamId
            }
        }) 
        for (var i = 0; i < orgs.length; i++) {
            const org = await User.findOne({
                where: {
                    username: orgs[i].ins_name
                }
            })
            data.push({
                "orgorganizationname": org.username,
                "orgorganizationavatar": org.avatar
            })
        }
        return data
    }

    static async getCanPublishTasksTeamList(insname) {
        const ins = await User.findOne({
            where: {
                username: insname
            }
        })
        if (ins == null) {
            return -1
        }
        let data = []
        const teams = await Pit.findAll({
            where: {
                ins_name: insname
            }
        }) 
        for (var i = 0; i < teams.length; i++) {
            const team = await Team.findOne({
                where: {
                    team_id: teams[i].team_id
                }
            })
            data.push({
                "teamname": team.team_name,
                "teamavatar": team.logo
            })
        }
        return data
    }

    static async getUserBlacklist(username) {
        const user = await User.findOne({
            where: {
                username: username
            }
        })
        if (user == null) {
            return -1
        }
        let data = []
        const orgs = await Piu.findAll({
            where: {
                username: username
            }
        }) 
        console.log(orgs.length)
        for (var i = 0; i < orgs.length; i++) {
            const org = await User.findOne({
                where: {
                    username: orgs[i].ins_name
                }
            })
            data.push({
                "username": org.username,

            })
        }
        return data    
    }

    static async getTaskByTaskId(taskId) {
        return await Task.findOne({
            where: {
                task_id: taskId
            }
        })
    }

    static async follow(user_name, ins_name) {
        var user = await User.findOne({
            where: {
                username: user_name
            }
        })
        if (user == null) {
            return 1
        }
        var ins = await User.findOne({
            where: {
                username: ins_name
            }
        })
        if (ins == null) {
            return 2
        }
        var relate = await Organization.findOne({
            where: {
                ins_name: ins_name,
                user_name: user_name
            }
        })
        if (relate != null) {
            return 3
        }

        await Organization.create({
            ins_name: ins_name,
            user_name: user_name
        })
        return 0
    }

    static async cancelFollow(user_name, ins_name) {
        var user = await User.findOne({
            where: {
                username: user_name
            }
        })
        if (user == null) {
            return 1
        }
        var ins = await User.findOne({
            where: {
                username: ins_name
            }
        })
        if (ins == null) {
            return 2
        }
        var relate = await Organization.findOne({
            where: {
                ins_name: ins_name,
                user_name: user_name
            }
        })
        if (relate == null) {
            return 3
        }

        await Organization.destroy({
            where: {
                ins_name: ins_name,
                user_name: user_name
            }
        })
        return 0
    }

    static async getFollowList(ins_name) {
        var ins = await User.findOne({
            where: {
                username: ins_name
            }
        })
        if (ins == null) {
            return 1
        }
        let data = []
        const users = await Organization.findAll({
            where: {
                ins_name: ins_name
            }
        }) 
        console.log("1")
        for (var i = 0; i < users.length; i++) {
            const user = await User.findOne({
                where: {
                    username: users[i].user_name
                }
            })
            console.log("2")
            data.push({
                "username": user.username,
            })
        }
        return data
    }

    static async getUsersFollowedOrganizationsList(username) {
        var user = await User.findOne({
            where: {
                username: username
            }
        })
        if (user == null) {
            return 1
        }
        let data = []
        const orgs = await Organization.findAll({
            where: {
                user_name: username
            }
        }) 
        for (var i = 0; i < orgs.length; i++) {
            const org = await User.findOne({
                where: {
                    username: orgs[i].ins_name
                }
            })
            if (org) {
                data.push({
                    "orgname": org.username,
                    "orgavatar": org.avatar,
                    "orgsignature": org.signature
                })
            }
        }
        return data    
    }

    static async refuseOrgToTeam(team_id, ins_name, username) {
        var team = await Team.findOne({
            where: {
                team_id: team_id
            }
        })
        if (team == null) {
            return 1
        }
        if (team.leader !== username) {
            return 2   
        }
        var ins = await User.findOne({
            where: {
                username: ins_name
            }
        })
        if (ins == null) {
            return 3
        }
        var relate = await Pit.findOne({
            where: {
                ins_name: ins_name,
                team_id: team_id
            }
        })
        if (relate != null) {
            return 4
        }
        return 0
    }

    static async searchOrg(ins_name) {
        var ins = await User.findAll({
            where: {
                username: {
                    [Op.like]: '%'+ins_name+'%',
                }, 
                account_state: 1
            }
        })
        let data = []
        for (var i = 0; i < ins.length; i++) {
            data.push({
                    "orgname": ins[i].username,
                    "orgsignature": ins[i].signature,
                    "orgavatar": ins[i].avatar
                }
            )
        }
        return data
    }

    static async orgquitteam(team_id, ins_name) {
        var ins = await User.findOne({
            where: {
                username: ins_name
            }
        })
        if (ins == null) {
            return 1
        }
        var team = await Team.findOne({
            where: {
                team_id: team_id
            }
        })
        if (team == null) {
            return 2
        }
        var relate = await Pit.findOne({
            where: {
                ins_name: ins_name,
                team_id: team_id
            }
        })
        if (relate == null) {
            return 3
        }
        await Pit.destroy({
            where: {
                ins_name: ins_name,
                team_id: team_id   
            }
        })
        return 0
    }
}

module.exports = UserModel;