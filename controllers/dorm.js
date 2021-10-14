require('sequelize');
const dormModel = require('../models/dorm');

const db = require('../config/dbConnection');

const createNewDorm = async (req, res) => {
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

  const dormID = async () => {
    const id = await db.query(
      `SELECT MAX(DORMID) AS DORMID
          FROM DORMITORY
          `,
      {
        type: db.QueryTypes.SELECT,
      }
    );
    return id[0].DORMID;
  }
  const nextDormID = String(Number(await dormID()) + 1);

  dormModel
    .create(dormInfo)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });

  return res.status(200).send({ DORMID: nextDormID });
};

module.exports = { createNewDorm };