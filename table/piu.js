const moment = require('moment');
const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes){
    return sequelize.define('piu',{
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            allowNull:false,
            autoIncrement:true
        },
        ins_name:{
            type:DataTypes.CHAR(20),
            allowNull:false,
            references: {
                model: 'user',
                key: 'username',
                deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
            }
        },
        username:{
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
        // 如果为 true 则表的名称和 model 相同，即 user
        // 为 false MySQL创建的表名称会是复数 users
        // 如果指定的表名称本就是复数形式则不变
        freezeTableName: true
    });
};