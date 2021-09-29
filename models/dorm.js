const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection');

class DORMITORY extends Model {}

DORMITORY.init(
  {
    DORMID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    DORMNAMETH: {
      type: DataTypes.STRING,
    },
    DORMNAMEENG: {
      type: DataTypes.STRING,
    },
    NUMOFBUILDING: {
      type: DataTypes.INTEGER,
    },
    ADDRESS: {
      type: DataTypes.STRING,
    },
    PROVINCE: {
      type: DataTypes.STRING,
    },
    STREET: {
      type: DataTypes.STRING,
    },
    POSTCODE: {
      type: DataTypes.STRING,
    },
    TELNO: {
      type: DataTypes.STRING,
    },
    SUBDISTRICT: {
      type: DataTypes.STRING,
    },
    DISTRICT: {
      type: DataTypes.STRING,
    },
    DORMCODE: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    sequelize,
    modelName: 'DORMITORY',
  }
);

module.exports = DORMITORY;
