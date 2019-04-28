const moment = require('moment');
const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes){
    return sequelize.define('members',{
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            allowNull:false,
            autoIncrement:true
        },
        team_id:{
            type:DataTypes.INTEGER,
            allowNull:false,
            references: {
                model: 'team',
                key: 'team_id',
                deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
            }
        },
        member_username:{
            type:DataTypes.CHAR(20),
            allowNull:false,
            references: {
                model: 'user',
                key: 'username',
                deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            get() {
                return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        // 更新时间
        updatedAt: {
            type: DataTypes.DATE,
            get() {
                return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
            }
        }
    }, {

        freezeTableName: true
    });
};