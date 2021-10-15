const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection');

class COST extends Model { }

COST.init(
    {
        COSTID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        COSTNAME: {
            type: DataTypes.STRING,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
        sequelize,
        modelName: 'COST',
    }
);

module.exports = COST;
