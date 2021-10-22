const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection');

class MANAGE extends Model {}
MANAGE.init(
  {
    MANAGEID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    USERID: {
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
    modelName: 'MANAGE',
  }
);

module.exports = MANAGE;
