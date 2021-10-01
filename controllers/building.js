require('sequelize');
const buildingModel = require('../models/building');

exports.getBuildingByDormID = (req, res) => {
  const dormID = req.params.dormID;
  buildingModel
    .findAll({ where: { DORMID: dormID } })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving all building.',
      });
    });
};
