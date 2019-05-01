const TeamModel = require('../modules/teamModel');
const ToastModel = require('../modules/toastModel');
const CookieController = require('./CookieController');
const Toast_info = require('../utils/toast_info');
require('../config/basicStr');
const fs = require('fs');

class TeamController {

    // 200 成功，412 异常, 212 组长不存在，211 部分成员不存在，401 cookie不正确重新登录，400 参数不齐全
    static async createGroup(ctx) {
        let req = ctx.request.body;
        let cookie_user = await CookieController.getUsernameFromCtx(ctx);
        if (cookie_user === -2) {
            ctx.body = {
                code: 401,
                msg: 'cookie超时，请重新登录',
                data: null
            };
            return;
        }

        if (req.team_name && req.members) {
            let leader = await TeamModel.getUserByUsername(cookie_user);
            if (leader === null) {
                ctx.response.status = 213;
                ctx.body = {
                    code: 212,
                    msg: '组长不存在',
                    data: null
                };
                return;
            }
            try {
                let members = req.members;
                req.leader = cookie_user;
                let flag = true;
                for (let i = 0; i < members.length; i++) {
                    let user = await TeamModel.getUserByUsername(members[i].member_username);
                        if (user === null) {
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    const ret = await TeamModel.createTeam(req);
                    let labels = req.teamlabels;
                    for (let i = 0; i < labels.length; i++) {
                        await TeamModel.createTeamLabel(ret.team_id, labels[i].label);
                    }
                    for (let i = 0; i < members.length; i++) {
                        await TeamModel.createTeamMember(ret.team_id, members[i].member_username);
                        // if (members[i].member_username !== ret.leader) {
                        await ToastModel.createToast(members[i].member_username, 1,
                            Toast_info.t1(ret.team_name),
                            ret.leader, ret.team_id, ret.team_name,null, null);
                        // }
                    }
                    const data = await TeamModel.getTeamByTeamId(ret.team_id, 0);
                    ctx.response.status = 200;
                    ctx.body = {
                        code: 200,
                        msg: '创建team成功',
                        data: data
                    }
                } else {
                    let wrongMembers = req.members;
                    for (let i = 0; i < wrongMembers.length; i++) {
                        let user = await TeamModel.getUserByUsername(members[i].member_username);
                        if (user !== null) {
                            wrongMembers.splice(i, 1);
                            i--;
                        }
                    }
                    ctx.response.status = 211;
                    ctx.body = {
                        code: 211,
                        msg: '部分成员不存在',
                        data: wrongMembers
                    }
                }
            } catch (err) {
                ctx.response.status = 412;
                ctx.body = {
                    code: 412,
                    msg: '创建team失败',
                    data: err.message
                }
            }
        } else {
            ctx.response.status = 400;
            ctx.body = {
                code: 400,
                msg: '参数不齐全',
            }
        }
    }

    // 200 成功，412 异常, 213 没有小组
    static async getGroupByGroupId(team_id, type) {
        let result = null;
        try {
            let data = await TeamModel.getTeamByTeamId2(team_id, type);
            if (data.length === 0) {
                result = {
                    code: 213,
                    msg: '查询成功,没有该小组',
                    data: null
                };
            } else {
                result = {
                    code: 200,
                    msg: '查询成功',
                    data: data
                };
            }
        } catch (err) {
            result = {
                code: 412,
                msg: '查询失败',
                data: err.message
            };
        }
        return result;
    }

    static async getAllGroup() {
        let result = null;
        try {
            let data = await TeamModel.getAllTeam();
            if (data.length === 0) {
                result = {
                    code: 213,
                    msg: '查询成功,没有该小组',
                    data: null
                };
            } else {
                result = {
                    code: 200,
                    msg: '查询成功',
                    data: data
                };
            }
        } catch (err) {
            result = {
                code: 412,
                msg: '查询失败',
                data: err.message
            };
        }
        return result;
    }

    // 200 成功，412 异常, 213 没有小组
    static async getGroupByGroupName(team_name, type) {
        let result = null;
        try {
            let data = await TeamModel.getTeamByName(team_name, type);
            if (data.length === 0) {
                result = {
                    code: 213,
                    msg: '查询成功,没有该小组',
                    data: null
                };
            } else {
                result = {
                    code: 200,
                    msg: '查询成功',
                    data: data
                };
            }
        } catch (err) {
            result = {
                code: 412,
                msg: '查询失败',
                data: err.message
            };
        }
        return result;
    }

    // 200 成功，412 异常，213 没有小组
    static async getGroupByTag(tag, type) {
        let result = null;
        try {
            let data = await TeamModel.getTeamByLabel(tag, type);
            if (data.length === 0) {
                result = {
                    code: 213,
                    msg: '查询成功,没有小组',
                    data: null
                };
            } else {
                result = {
                    code: 200,
                    msg: '查询成功',
                    data: data
                };
            }
        } catch (err) {
            result = {
                code: 412,
                msg: '查询失败',
                data: err.message
            };
        }
        return result;
    }

    // 200 成功，412 异常，213 没有加入小组
    static async getGroupByUsername(member_username, type) {
        let result = null;
        try {
            let data = await TeamModel.getTeamByUsername(member_username, type);
            if (data.length === 0) {
                result = {
                    code: 213,
                    msg: '查询成功,没有加入小组',
                    data: null
                };
            } else {
                result = {
                    code: 200,
                    msg: '查询成功',
                    data: data
                };
            }
        } catch (err) {
            result = {
                code: 412,
                msg: '查询失败',
                data: err.message
            };
        }
        return result;
    }

    // 200 成功，412 异常，213 没有加入小组
    static async getGroupByOrgname(member_username, type) {
        let result = null;
        try {
            let data = await TeamModel.getTeamByOrgname(member_username, type);
            if (data.length === 0) {
                result = {
                    code: 213,
                    msg: '查询成功,没有加入小组',
                    data: null
                };
            } else {
                result = {
                    code: 200,
                    msg: '查询成功',
                    data: data
                };
            }
        } catch (err) {
            result = {
                code: 412,
                msg: '查询失败',
                data: err.message
            };
        }
        return result;
    }

    // 200 成功是组长，412 异常，212 不是组长，213 没有小组
    static async isGroupLeader(team_id, leader) {
        let result = null;
        try {
            let team = await TeamModel.getTeamByTeamId(team_id, 0);
            if (team === null) {
                result = {
                    code: 213,
                    msg: '查询失败，没有该小组',
                    data: false
                };
            } else {
                if (team.leader !== leader) {
                    result = {
                        code: 212,
                        msg: '查询成功，不是组长',
                        data: false
                    };
                } else {
                    result = {
                        code: 200,
                        msg: '查询成功，是组长',
                        data: true
                    };
                }
            }
        } catch (err) {
            result = {
                code: 412,
                msg: '查询失败',
                data: err.message
            };
        }
        return result;
    }

    // 200 成功是成员，412 异常，211 不是成员，213 没有小组
    static async isGroupMember(team_id, member_username) {
        let result = null;
        try {
            let team = await TeamModel.getTeamByTeamId(team_id, 0);
            if (team === null) {
                result = {
                    code: 213,
                    msg: '查询失败，没有该小组',
                    data: false
                };
            } else {
                let team = await TeamModel.getUserByTeamIdUsername(team_id, member_username);
                if (team.length === 0) {
                    result = {
                        code: 211,
                        msg: '查询成功，不是成员',
                        data: false
                    };
                } else {
                    result = {
                        code: 200,
                        msg: '查询成功，是成员',
                        data: true
                    };
                }
            }
        } catch (err) {
            result = {
                code: 412,
                msg: '查询失败',
                data: err.message
            };
        }
        return result;
    }

    // 200 成功是成员，412 异常，211 不是成员，213 没有小组
    static async isGroupOrgMember(team_id, member_username) {
        let result = null;
        try {
            let team = await TeamModel.getTeamByTeamId(team_id, 0);
            if (team === null) {
                result = {
                    code: 213,
                    msg: '查询失败，没有该小组',
                    data: false
                };
            } else {
                let team = await TeamModel.getOrgByTeamIdOrgName(team_id, member_username);
                if (team.length === 0) {
                    result = {
                        code: 211,
                        msg: '查询成功，不是成员',
                        data: false
                    };
                } else {
                    result = {
                        code: 200,
                        msg: '查询成功，是成员',
                        data: true
                    };
                }
            }
        } catch (err) {
            result = {
                code: 412,
                msg: '查询失败',
                data: err.message
            };
        }
        return result;
    }

    static async addUserToGrope(team_id, leader, user) {
        let result = null;
        try {
            let team = await TeamModel.getTeamByTeamId(team_id, 0);
            if (team === null) {
                result = {
                    code: 213,
                    msg: '没有该小组',
                    data: false
                };
            } else if (team.limit === 0 || (team.limit === 1 && team.leader === leader)) {
                let wrongUser = user.slice(0);
                for (let i = 0; i < wrongUser.length; i++) {
                    let users = await TeamModel.getUserByUsername(user[i].username);
                    if (users !== null) {
                        wrongUser.splice(i, 1);
                        i--;
                    }
                }
                if (user.length === wrongUser.length) {
                    result = {
                        code: 210,
                        msg: '添加失败，没有user',
                        data: wrongUser
                    };
                } else {
                    let wrongUser2 = user.slice(0);
                    for (let i = 0; i < wrongUser2.length; i++) {
                        let members = await TeamModel.getUserByTeamIdUsername(team_id, user[i].username);
                        if (members.length === 0) {
                            wrongUser2.splice(i, 1);
                            i--;
                        }
                    }
                    if (user.length === wrongUser2.length) {
                        result = {
                            code: 211,
                            msg: '添加失败，user已经在小组中',
                            data: wrongUser2
                        };
                    } else {
                        for (let i = 0; i < user.length; i++) {
                            await TeamModel.createMembers(team_id, user[i].username);
                            await ToastModel.createToast(user[i].username, 1,
                                Toast_info.t1(team.team_name),
                                leader, team_id, team.team_name, null, null);
                        }
                        result = {
                            code: 200,
                            msg: '添加成功',
                            data: true
                        };
                    }
                }
            } else if (team.limit === 1 && team.leader !== leader) {
                result = {
                    code: 212,
                    msg: '添加失败，leader不是组长, 需要验证',
                    data: false
                };
            } else if (team.limit === 2) {
                result = {
                    code: 215,
                    msg: '添加失败，该小组不允许添加',
                    data: false
                };
            } else {
                result = {
                    code: 412,
                    msg: '添加失败',
                    data: err
                };
            }
        } catch (err) {
            result = {
                code: 412,
                msg: '添加失败',
                data: err.message
            };
        }
        return result;
    }

    // 200 成功，412 异常，210 没有该user，211 user已经在小组中，213 没有小组，214 需要组长审核，215 不允许添加
    static async addUserToGrope2(team_id, username) {
        let result = null;
        try {
            let team = await TeamModel.getTeamByTeamId(team_id, 0);
            if (team === null) {
                result = {
                    code: 213,
                    msg: '没有该小组',
                    data: false
                };
            } else if (team.limit === 0) {
                let user = await TeamModel.getUserByUsername(username);
                if (user === null) {
                    result = {
                        code: 210,
                        msg: '添加失败，没有user',
                        data: false
                    };
                } else if (user.account_state === 0) {
                    let team = await TeamModel.getUserByTeamIdUsername(team_id, username);
                    if (team.length === 0) {
                        await TeamModel.createMembers(team_id, username);
                        result = {
                            code: 200,
                            msg: '添加成功',
                            data: true
                        };
                    } else {
                        result = {
                            code: 211,
                            msg: '添加失败，user已经在小组中',
                            data: false
                        };
                    }
                } else if (user.account_state === 1) {
                    let team = await TeamModel.getOrgByTeamIdOrgName(team_id, username);
                    if (team.length === 0) {
                        await TeamModel.createOrganizaitons(team_id, username);
                        result = {
                            code: 200,
                            msg: '添加成功',
                            data: true
                        };
                    } else {
                        result = {
                            code: 211,
                            msg: '添加失败，机构已经在小组中',
                            data: false
                        };
                    }
                }
            } else if (team.limit === 1) {
                let user = await TeamModel.getUserByUsername(username);
                if (user === null) {
                    result = {
                        code: 210,
                        msg: '添加失败，没有user',
                        data: false
                    };
                } else if (user.account_state === 0) {
                    let member = await TeamModel.getUserByTeamIdUsername(team_id, username);
                    if (member.length === 0) {
                        let toast = await ToastModel.getToastByMessage(0, username, team_id);
                        if (toast === null) {
                            await ToastModel.createToast(team.leader, 0,
                                Toast_info.t0(username, team.team_name),
                                username, team_id, team.team_name, null, null);
                        }
                        result = {
                            code: 214,
                            msg: '添加失败，需要组长审核',
                            data: true
                        };
                    } else {
                        result = {
                            code: 211,
                            msg: '添加失败，user已经在小组中',
                            data: false
                        };
                    }
                } else if (user.account_state === 1) {
                    let member = await TeamModel.getOrgByTeamIdOrgName(team_id, username);
                    if (member.length === 0) {
                        let toast = await ToastModel.getToastByMessage(7, username, team_id);
                        if (toast === null) {
                            await ToastModel.createToast(team.leader, 7,
                                Toast_info.t7(username, team.team_name),
                                username, team_id, team.team_name, null, null);
                        }
                        result = {
                            code: 214,
                            msg: '添加失败，需要组长审核',
                            data: true
                        };
                    } else {
                        result = {
                            code: 211,
                            msg: '添加失败，机构已经在小组中',
                            data: false
                        };
                    }
                }
            } else if (team.limit === 2) {
                result = {
                    code: 215,
                    msg: '添加失败，该小组不允许添加',
                    data: false
                };
            }
        } catch (err) {
            result = {
                code: 412,
                msg: '添加失败',
                data: err.message
            };
        }
        return result;
    }


    static async rejectUserToGrope(username, team_id, leader) {
        let result = null;
        try {
            let team = await TeamModel.getTeamByTeamId(team_id, 0);
            if (team === null) {
                result = {
                    code: 213,
                    msg: '没有该小组',
                    data: false
                };
                return;
            }
            if (team.leader !== leader) {
                result = {
                    code: 212,
                    msg: 'leader不是组长，拒绝失败',
                    data: false
                };
                return;
            }
            await ToastModel.createToast(username, 6,
                Toast_info.t6(team.team_name),
                leader, team_id, team.team_name, null, null);
            result = {
                code: 200,
                msg: '拒绝成功',
                data: true
            };
        } catch (err) {
            result = {
                code: 412,
                msg: '拒绝失败',
                data: err.message
            };
        }
        return result;
    }

    // 200 成功，412 异常，212 组长不正确, 216 不能删除组长，211 小组没有该用户
    static async deleteUserFromGrope(team_id, leader, username) {
        let result = null;
        try {
            let team = await TeamModel.getTeamByTeamId(team_id, 0);
            if (team.leader === leader) {
                let user_team = await TeamModel.getUserByTeamIdUsername(team_id, username);
                if (team.leader === username) {
                    result = {
                        code: 216,
                        msg: '删除失败，不能删除组长',
                        data: false
                    };
                } else if (user_team.length === 0) {
                    result = {
                        code: 211,
                        msg: '删除失败，user不在小组中',
                        data: false
                    };
                } else {
                    await TeamModel.deleteMember(team_id, username);
                    await ToastModel.createToast(username, 2,
                        Toast_info.t2(team.team_name),
                        username, team_id, team.team_name, null, null);
                    result = {
                        code: 200,
                        msg: '删除成功',
                        data: true
                    };
                }
            } else {
                result = {
                    code: 212,
                    msg: '删除失败，leader不是组长',
                    data: false
                };
            }
        } catch (err) {
            result = {
                code: 412,
                msg: '删除失败',
                data: err.message
            };
        }
        return result;
    }

    // 200 成功，412 异常，211 成员不正确，216 组长不能退出，213 该小组不存在
    static async deleteUserFromGrope2(team_id, username) {
        let result = null;
        try {
            let teams = await TeamModel.getTeamByTeamId(team_id, 0);
            if (teams === null) {
                result = {
                    code: 213,
                    msg: '查询失败，没有该小组',
                    data: false
                };
            } else {
                if (teams.leader === username) {
                    result = {
                        code: 216,
                        msg: '删除失败,组长不能退出',
                        data: false
                    };
                } else {
                    let team = await TeamModel.getUserByTeamIdUsername(team_id, username);
                    if (team.length === 0) {
                        result = {
                            code: 211,
                            msg: '删除失败，user不在小组中',
                            data: false
                        };
                    } else {
                        await TeamModel.deleteMember(team_id, username);
                        await ToastModel.createToast(teams.leader, 5,
                            Toast_info.t5(username, teams.team_name),
                            username, team_id, teams.team_name, null, null);
                        result = {
                            code: 200,
                            msg: '删除成功',
                            data: true
                        };
                    }
                }
            }
        } catch (err) {
            result = {
                code: 412,
                msg: '删除失败',
                data: err.message
            };
        }
        return result;
    }

    // 200 成功，412 异常，212 组长不正确，211 成员不正确
    static async updateTeamLeader(team_id, leader, username) {
        let result = null;
        try {
            let team = await TeamModel.getTeamByTeamId(team_id, 0);
            if (team.leader === leader) {
                let isMember = await TeamModel.getUserByTeamIdUsername(team_id, username);
                if (isMember.length === 0) {
                    result = {
                        code: 211,
                        msg: '修改组长失败，user不是小组成员',
                        data: false
                    };
                } else {
                    await TeamModel.updateTeamLeader(team_id, leader, username);
                    await ToastModel.createToast(username, 4,
                        Toast_info.t4(team.team_name),
                        leader, team_id, team.team_name, null, null);
                    result = {
                        code: 200,
                        msg: '修改组长成功',
                        data: true
                    };
                }
            } else {
                result = {
                    code: 212,
                    msg: '修改组长失败，leader不是组长',
                    data: false
                };
            }
        } catch (err) {
            result = {
                code: 412,
                msg: '修改失败',
                data: err.message
            };
        }
        return result;
    }

    // 200 成功，412 异常，212 组长不正确， 213 没有小组
    static async deleteGroup(team_id, leader) {
        let result = null;
        try {
            let team = await TeamModel.getTeamByTeamId(team_id, 0);
            if (team === null) {
                result = {
                    code: 213,
                    msg: '删除失败，没有该小组',
                    data: false
                };
            } else if (team.leader !== leader) {
                result = {
                    code: 212,
                    msg: '删除失败，组长不正确',
                    data: false
                };
            } else {
                for (let i = 0; i < team.members.length; i++) {
                    await ToastModel.createToast(team.members[i].member_username, 3,
                        Toast_info.t3(team.team_name),
                        leader, team_id, team.team_name, null, null);
                }
                if (team.logo !== defaultLogo) {
                    let tem = team.logo.split('/');
                    let filePath = './static/' + tem[3] + '/' + tem[4] + '/' + tem[5];
                    fs.unlinkSync(filePath);
                }
                await TeamModel.deleteTeamMember(team_id);
                await TeamModel.deleteTeamLabel(team_id);
                await TeamModel.deleteTeamPit(team_id);
                await TeamModel.deleteTeam(team_id);

                result = {
                    code: 200,
                    msg: '删除成功',
                    data: true
                };
            }
        } catch (err) {
            result = {
                code: 412,
                msg: '查询失败',
                data: err.message
            };
        }
        return result;
    }

    // 200 成功，412 异常，212 组长不存在或组长不正确， 213小组不存在，401 cookie不正确重新登录，400 参数不齐全
    static async modifyGroup(ctx) {
        let req = ctx.request.body;
        let cookie_user = await CookieController.getUsernameFromCtx(ctx);
        if (cookie_user === -2) {
            ctx.body = {
                code: 401,
                msg: 'cookie超时，请重新登录',
                data: null
            };
            return;
        }
        req.leader = cookie_user;
        if (req.team_id) {
            try {
                let team = await TeamModel.getTeamByTeamId(req.team_id, 0);
                if (team === null) {
                    ctx.response.status = 213;
                    ctx.body = {
                        code: 213,
                        msg: '小组不存在',
                        data: null
                    }
                } else {
                    let leader = await TeamModel.getUserByUsername(req.leader);
                    if (leader === null) {
                        ctx.response.status = 212;
                        ctx.body = {
                            code: 212,
                            msg: '组长不存在',
                            data: null
                        }
                    } else {
                        if (team.leader === req.leader) {
                            if (req.logo !== team.logo && team.logo !== defaultLogo) {
                                let tem = team.logo.split('/');
                                let filePath = './static/' + tem[3] + '/' + tem[4] + '/' + tem[5];
                                fs.unlinkSync(filePath);
                            }
                            await TeamModel.updateTeamDescription(req);
                            await TeamModel.deleteTeamLabel(req.team_id);
                            for (let i = 0; i < req.teamlabels.length; i++) {
                                await TeamModel.createTeamLabel(req.team_id, req.teamlabels[i].label);
                            }
                            let data = await TeamModel.getTeamByTeamId(req.team_id, 0);
                            ctx.response.status = 200;
                            ctx.body = {
                                code: 200,
                                msg: '修改小组信息成功',
                                data: data
                            }
                        } else {
                            ctx.response.status = 212;
                            ctx.body = {
                                code: 212,
                                msg: '组长不正确',
                                data: null
                            }
                        }
                    }
                }
            } catch (err) {
                ctx.response.status = 412;
                ctx.body = {
                    code: 412,
                    msg: '修改小组失败',
                    data: err.message
                }
            }
        } else {
            ctx.response.status = 400;
            ctx.body = {
                code: 400,
                msg: '参数不齐全',
            }
        }
    }

    // 200 成功，412 异常
    static async getDefaultGroup() {
        let result = null;
        try {
            let data = await TeamModel.getDefaultTeam();
            result = {
                code: 200,
                msg: '查询成功',
                data: data
            };
        } catch (err) {
            result = {
                code: 412,
                msg: '查询失败',
                data: err.message
            };
        }
        return result;
    }

}
module.exports = TeamController;