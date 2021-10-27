require('sequelize');
const userModel = require('../models/user');
const db = require('../config/dbConnection');

const getResidentInfo = async (req, res) => {
  const { roomID } = req.params;

  const residentInfo = await db.query(
    `SELECT u.USERID , u.FNAME , u.LNAME , u.TELNO , u.GENDER , u.IDCARDNO , u.DATEOFBIRTH, u.ADDRESS ,
            r.RENTID , r.CHECKINDATE , r.CHECKOUTDATE ,
            r2.ROOMID , r2.ROOMNO ,r2.FLOOR , r2.BUILDINGID , r2.ROOMTYPEID , r2.STATUS ,
            cor.CONTRACTOFRENTID , cor.STARTDATE , cor.ENDDATE
    FROM USER u JOIN RENT r 
    ON u.USERID = r.USERID
    JOIN ROOM r2
    ON r.ROOMID = r2.ROOMID
    JOIN CONTRACT_OF_RENT cor
    ON r.CONTRACTOFRENTID = cor.CONTRACTOFRENTID
    WHERE r.ROOMID = ?
    AND r.CHECKOUTDATE IS NULL`,
    {
      replacements: [roomID],
      type: db.QueryTypes.SELECT,
    }
  );
  // console.log(residentInfo, "<<<residentInfo")
  return res.status(200).send(residentInfo);
};

const editResidentInfo = async (req, res) => {
  const { userID } = req.params;
  const { fName, lName, telNo, gender, idCardNo, dateOfBirth, address } = req.body;

  const oldInfo = await userModel.findOne({
    where: {
      USERID: userID
    }
  });

  const updateData = {
    FNAME: fName ? fName : oldInfo.dataValues.FNAME,
    LNAME: lName ? lName : oldInfo.dataValues.LNAME,
    TELNO: telNo ? telNo : oldInfo.dataValues.TELNO,
    GENDER: gender ? gender : oldInfo.dataValues.GENDER,
    IDCARDNO: idCardNo ? idCardNo : oldInfo.dataValues.IDCARDNO,
    DATEOFBIRTH: dateOfBirth ? dateOfBirth : oldInfo.dataValues.DATEOFBIRTH,
    ADDRESS: address ? address : oldInfo.dataValues.ADDRESS
  };

  userModel.update(updateData, {
    where: {
      USERID: userID
    }
  });

  return res.status(200).send('Success');
};

module.exports = { getResidentInfo, editResidentInfo };