require('sequelize');
const dormModel = require('../models/dorm');

const CREATE_DORM = async (req, res) => {
  // Generate code
  const genCode = async () => {
    var code = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (var i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return code;
  };

  const dorm = {
    DORMNAMETH: req.body.dormNameTH ? req.body.dormNameTH : null,
    DORMNAMEENG: req.body.dormNameENG ? req.body.dormNameENG : null,
    NUMOFBUILDING: req.body.numOfBuylding ? req.body.numOfBuylding : null,
    ADDRESS: req.body.address ? req.body.address : null,
    PROVINCE: req.body.province ? req.body.province : null,
    STREET: req.body.street ? req.body.street : null,
    POSTCODE: req.body.postCode ? req.body.postCode : null,
    TELNO: req.body.telNo ? req.body.telNo : null,
    SUBDISTRICT: req.body.subdistrict ? req.body.subdistrict : null,
    DISTRICT: req.body.district ? req.body.district : null,
    DORMCODE: await genCode(),
  };

  dormModel
    .create(dorm)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });
};

module.exports = { CREATE_DORM };
