const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection');

class SETTING extends Model { }

SETTING.init(
  {
    SETTINGID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    WATERPRICE: {
      type: DataTypes.DECIMAL,
    },
    ELECTRICITYPRICE: {
      type: DataTypes.DECIMAL,
    },
    MINWATERUNIT: {
      type: DataTypes.DECIMAL,
    },
    MINWATERPRICE: {
      type: DataTypes.DECIMAL,
    },
    GUARANTEEFEE: {
      type: DataTypes.DECIMAL,
    },
    MULTPREPAID: {
      type: DataTypes.INTEGER,
    },

    DORMID: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    sequelize,
    modelName: 'SETTING',
  }
);

module.exports = SETTING;
