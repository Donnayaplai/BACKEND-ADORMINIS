require('sequelize');
const buildingModel = require('../models/building');

exports.getBuildingByDormID = async (dormID) => {
  const building = await buildingModel.findAll({
    where: {
      DORMID: dormID,
    },
  });
  return building;
};
