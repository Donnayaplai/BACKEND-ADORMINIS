const dormModel = require('../models/dorm');
const manageModel = require('../models/manage');

const createNewDorm = async (req, res) => {
  const { userID } = req.params;
  const { dormNameTH, dormNameENG, address, province, street, postCode, telNo, subdistrict, district } = req.body;

  const dormInfo = {
    DORMNAMETH: dormNameTH ? dormNameTH : null,
    DORMNAMEENG: dormNameENG ? dormNameENG : null,
    ADDRESS: address ? address : null,
    PROVINCE: province ? province : null,
    STREET: street ? street : null,
    POSTCODE: postCode ? postCode : null,
    TELNO: telNo ? telNo : null,
    SUBDISTRICT: subdistrict ? subdistrict : null,
    DISTRICT: district ? district : null
  };

  let dormInsertId;

  await dormModel.create(dormInfo).then(resultId => dormInsertId = resultId.null);

  await manageModel.create({ USERID: userID, DORMID: dormInsertId });

  return res.status(200).send({ dormID: dormInsertId });
};

const getDormInfo = async (req, res) => {
  const { dormID } = req.params;

  await dormModel.findOne({
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

const updateDormInfo = async (req, res) => {
  const { dormID } = req.params;
  const { dormNameTH, dormNameENG, address, province, street, postCode, telNo, subdistrict, district } = req.body;

  const dormInfo = {
    DORMNAMETH: dormNameTH ? dormNameTH : null,
    DORMNAMEENG: dormNameENG ? dormNameENG : null,
    ADDRESS: address ? address : null,
    PROVINCE: province ? province : null,
    STREET: street ? street : null,
    POSTCODE: postCode ? postCode : null,
    TELNO: telNo ? telNo : null,
    SUBDISTRICT: subdistrict ? subdistrict : null,
    DISTRICT: district ? district : null
  };

  dormModel.update(dormInfo, {
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

module.exports = { createNewDorm, getDormInfo, updateDormInfo };