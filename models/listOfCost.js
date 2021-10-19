const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection');

class LISTOFCOST extends Model { }

LISTOFCOST.init(
    {
        LISTID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        COSTID: {
            type: DataTypes.DECIMAL,
        },
        RENTID: {
            type: DataTypes.INTEGER,
        },
        COSTSTATUS: {
            type: DataTypes.BOOLEAN,
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
