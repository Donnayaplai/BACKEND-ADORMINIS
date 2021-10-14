const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection');

class ROOM_TYPE extends Model { }

ROOM_TYPE.init(
  {
    ROOMTYPEID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    ROOMNAME: {
      type: DataTypes.STRING,
    },
    PRICE: {
      type: DataTypes.DECIMAL,
    },
    DORMID: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    sequelize,
    modelName: 'ROOM_TYPE',
  }
);

module.exports = ROOM_TYPE;
