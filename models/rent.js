const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection');

class RENT extends Model {}

RENT.init(
  {
    RENTID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    CHECKINDATE: {
      type: DataTypes.DATE,
    },
    CHECKOUTDATE: {
      type: DataTypes.DATE,
    },
    CONTRACTOFRENTID: {
      type: DataTypes.INTEGER,
    },
    USERID: {
      type: DataTypes.INTEGER,
    },
    ROOMID: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    sequelize,
    modelName: 'RENT',
  }
);

module.exports = RENT;
