const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class ROLE extends Model {}
ROLE.init(
  {
    ROLEID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    ROLENAME: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    sequelize,
    modelName: 'ROLE',
  }
);

module.exports = ROLE;
