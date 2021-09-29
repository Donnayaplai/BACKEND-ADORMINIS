require('sequelize');
const roomModel = require('../models/room');

// exports.getAllRoomByBuildingID = async (buildingID) => {
//   const allroom = await roomModel.findAll({
//     where: {
//       BUILDINGID: buildingID,
//     },
//   });
//   return allroom;
// };

exports.getAllRoomByBuildingID = (req, res) => {
  const buildingID = req.params.buildingID;
  roomModel
    .findAll({ where: { BUILDINGID: buildingID } })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving all room.',
      });
    });
};
