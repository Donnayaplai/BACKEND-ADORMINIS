const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection');

class PROBLEM extends Model { }
PROBLEM.init(
    {
        PROBLEMID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        TITLE: {
            type: DataTypes.STRING,
        },
        DETAIL: {
            type: DataTypes.STRING,
        },
        INFORMEDDATE: {
            type: DataTypes.DATE,
            primaryKey: true,
        },
        REVISIONDATE: {
            type: DataTypes.DATE,
        },
        STATUS: {
            type: DataTypes.BOOLEAN,
        },
        USERID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        DORMID: {
            type: DataTypes.INTEGER,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
        sequelize,
        modelName: 'PROBLEM',
    }
);

module.exports = PROBLEM;
