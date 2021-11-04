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
    .catch(() => {
      return res.status(400).json({ message: "มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง" });
    });
};

module.exports = { getBuildingByDormID };