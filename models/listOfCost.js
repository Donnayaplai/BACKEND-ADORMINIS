const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection');

class LISTOFCOST extends Model { }

LISTOFCOST.init(
    {
        LISTID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        ROOM: {
            type: DataTypes.BOOLEAN,
        },
        ELECTRICITY: {
            type: DataTypes.BOOLEAN,
        },
        WATER: {
            type: DataTypes.BOOLEAN,
        },
        MAINTENANCEFEE: {
            type: DataTypes.BOOLEAN,
        },
        PARKINGFEE: {
            type: DataTypes.BOOLEAN,
        },
        INTERNETFEE: {
            type: DataTypes.BOOLEAN,
        },
        CLEANINGFEE: {
            type: DataTypes.BOOLEAN,
        },
        OTHER: {
            type: DataTypes.BOOLEAN,
        },
        ROOMID: {
            type: DataTypes.INTEGER,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
        sequelize,
        modelName: 'LISTOFCOST',
    }
);

module.exports = LISTOFCOST;
