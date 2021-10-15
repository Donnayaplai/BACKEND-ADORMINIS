const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection');

class INVOICE extends Model { }

INVOICE.init(
    {
        INVOICEID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        TOTALPRICE: {
            type: DataTypes.DECIMAL,
        },
        INVOICEDATE: {
            type: DataTypes.DATE,
        },
        DUEDATE: {
            type: DataTypes.DECIMAL,
        },
        ROOMID: {
            type: DataTypes.INTEGER,
        },
        PAYMENTID: {
            type: DataTypes.INTEGER,
        },
    },
    {
        freezeTableName: true,
        timestamps: false,
        sequelize,
        modelName: 'INVOICE',
    }
);

module.exports = INVOICE;
