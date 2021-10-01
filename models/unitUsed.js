const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection');

class UNIT_USED extends Model {}
UNIT_USED.init(
  {
    UNITUSEDID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    WATERUNIT: {
      type: DataTypes.DECIMAL,
    },
    ELECTRICIRYUNIT: {
      type: DataTypes.DECIMAL,
    },
    UNITUSEDDATE: {
      type: DataTypes.DATE,
    },
    ROOMID: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    sequelize,
    modelName: 'UNIT_USED',
  }
);

module.exports = UNIT_USED;
