const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection');

class CONTRACT_OF_RENT extends Model {}

CONTRACT_OF_RENT.init(
  {
    CONTRACTOFRENTID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    STARTDATE: {
      type: DataTypes.DATE,
    },
    ENDDATE: {
      type: DataTypes.DATE,
    },
    GUARANTEEFEE: {
      type: DataTypes.DECIMAL,
    },
    PREPAID: {
      type: DataTypes.DECIMAL,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    sequelize,
    modelName: 'CONTRACT_OF_RENT',
  }
);

module.exports = CONTRACT_OF_RENT;
