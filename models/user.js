const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/dbConnection');

class USER extends Model {}

USER.init(
  {
    USERID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    FNAME: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    LNAME: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    TELNO: {
      type: DataTypes.STRING,
    },
    GENDER: {
      type: DataTypes.STRING,
    },
    IDCARDNO: {
      type: DataTypes.STRING,
    },
    DATEOFBIRTH: {
      type: DataTypes.DATE,
    },
    ADDRESS: {
      type: DataTypes.STRING,
    },
    EMAIL: {
      type: DataTypes.STRING,
    },
    PASSWORD: {
      type: DataTypes.STRING,
    },
    ROLEID: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    sequelize,
    modelName: 'USER',
  }
);

module.exports = USER;
