const buildingModel = require('../models/building');

const getBuildingByDormID = (req, res) => {
  const { dormID } = req.params;

  buildingModel.findAll({
    where: {
      DORMID: dormID
    }
  })
    .then((data) => {
      return res.status(200).send(data);
    })
    .catch((err) => {
      return res.status(400).send(err.message);
    });
};

module.exports = { getBuildingByDormID };