require('sequelize');
const dormModel = require('../models/dorm');
const manageModel = require('../models/manage');

const createNewDorm = async (req, res) => {
  const { userID } = req.params;
  const {
    dormNameTH,
    dormNameENG,
    address,
    province,
    street,
    postCode,
    telNo,
    subdistrict,
    district
  } = req.body;

  const dormInfo = {
    DORMNAMETH: dormNameTH ? dormNameTH : null,
    DORMNAMEENG: dormNameENG ? dormNameENG : null,
    ADDRESS: address ? address : null,
    PROVINCE: province ? province : null,
    STREET: street ? street : null,
    POSTCODE: postCode ? postCode : null,
    TELNO: telNo ? telNo : null,
    SUBDISTRICT: subdistrict ? subdistrict : null,
    DISTRICT: district ? district : null,
  };

  let dormInsertId;

  await dormModel.create(dormInfo)
    .then(resultId => dormInsertId = resultId.null)
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });

  await manageModel.create({ USERID: userID, DORMID: dormInsertId })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });

  return res.status(200).send({ dormID: dormInsertId });
};

const getDormInfo = async (req, res) => {
  const { dormID } = req.params;

  const dormInfo = await dormModel.findOne({
    where: {
      DORMID: dormID
    },
  })

  return res.status(200).send(dormInfo.dataValues);
};

const updateDormInfo = async (req, res) => {
  const { dormID } = req.params;
  const {
    dormNameTH,
    dormNameENG,
    address,
    province,
    street,
    postCode,
    telNo,
    subdistrict,
    district
  } = req.body;

  const dormInfo = {
    DORMNAMETH: dormNameTH ? dormNameTH : null,
    DORMNAMEENG: dormNameENG ? dormNameENG : null,
    ADDRESS: address ? address : null,
    PROVINCE: province ? province : null,
    STREET: street ? street : null,
    POSTCODE: postCode ? postCode : null,
    TELNO: telNo ? telNo : null,
    SUBDISTRICT: subdistrict ? subdistrict : null,
    DISTRICT: district ? district : null,
  };

  dormModel.update(dormInfo, {
    where: {
      DORMID: dormID
    }
  })
    .then(data => {
      res.status(200).send(data);
      console.log("Info updated!!");
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message
      });
    });
};

module.exports = { createNewDorm, getDormInfo, updateDormInfo };