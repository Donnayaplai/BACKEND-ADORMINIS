require('sequelize');
const roomModel = require('../models/room');

exports.getAllRoomByBuildingID = async (buildingID) => {
  const allroom = await roomModel.findAll({
    where: {
      BUILDINGID: buildingID,
    },
  });
  return allroom;
};
