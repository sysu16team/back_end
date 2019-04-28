const db = require('../config/db');
const Sequelize = require('sequelize');
const moment = require('moment');

module.exports = function(sequelize, DataTypes){
    return sequelize.define('tr',{
        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            allowNull:false,
            autoIncrement:true
        },
        username:{
            type:DataTypes.CHAR(20),
            allowNull:false,
        },
        task_id:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        state:{
            type: DataTypes.INTEGER,
            allowNull:false
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        questionnaire_path: {
            type: DataTypes.CHAR(128),
            allowNull: true
        },
        createdAt:{
            type: DataTypes.DATE,
            get() {
                return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        // 更新时间
        updatedAt:{
            type: DataTypes.DATE,
            get() {
                return moment(this.getDataValue('updatedAt')).format('YYYY-MM-DD HH:mm:ss');
            }
        }
    }, {
        freezeTableName: true
    });
};