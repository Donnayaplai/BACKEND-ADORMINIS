const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection');

class BUILDING extends Model {}

BUILDING.init(
  {
    BUILDINGID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    BUILDINGNAME: {
      type: DataTypes.STRING,
    },
    NUMOFFLOOR: {
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
    modelName: 'BUILDING',
  }
);

module.exports = BUILDING;
