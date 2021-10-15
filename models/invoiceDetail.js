const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection');

class INVOICE_DETAIL extends Model { }

INVOICE_DETAIL.init(
    {
        DETAILID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        PRICE: {
            type: DataTypes.DECIMAL,
        },
        COSTID: {
            type: DataTypes.INTEGER,
        },
        INVOICEID: {
            type: DataTypes.INTEGER,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
        sequelize,
        modelName: 'INVOICE_DETAIL',
    }
);

module.exports = INVOICE_DETAIL;
