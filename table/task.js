const moment = require('moment');
const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes){
    return sequelize.define('task',{
        task_id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            allowNull:false,
            autoIncrement:true
        },
        title:{
            type:DataTypes.CHAR(45),
            allowNull:false
        },
        introduction:{
            type:DataTypes.CHAR(255),
            allowNull:false
        },
        money:{
            type:DataTypes.FLOAT,
            allowNull:false,
            defaultValue:0
        },
        score:{
            type:DataTypes.FLOAT
        },
        max_accepter_number:{
            type:DataTypes.INTEGER
        },
        publisher: {
            type:DataTypes.CHAR(20),
            allowNull:false
        },
        state: {
            type:DataTypes.INTEGER
        },
        type: {
            type:DataTypes.INTEGER
            // 1: 问卷
            // 2: 取快递
        },
        starttime:{
            type:DataTypes.DATE,
            get() {
                return moment(this.getDataValue('starttime')).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        endtime:{
            type:DataTypes.DATE,
            get() {
                return moment(this.getDataValue('endtime')).format('YYYY-MM-DD HH:mm:ss');
            }
        },
        questionnaire_path:{
            type:DataTypes.CHAR(255)
        },
        content:{
            type:DataTypes.TEXT
        },
        createdAt: {
            type: DataTypes.DATE,
            get() {
                return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
            }
        },
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