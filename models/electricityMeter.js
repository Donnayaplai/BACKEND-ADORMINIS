const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection');

class ELECTRICITYMETER extends Model {}
ELECTRICITYMETER.init(
  {
    EMETERID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    ELECTRICITYNO: {
      type: DataTypes.DECIMAL,
    },
    METERDATE: {
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
    modelName: 'ELECTRICITYMETER',
  }
);

module.exports = ELECTRICITYMETER;
