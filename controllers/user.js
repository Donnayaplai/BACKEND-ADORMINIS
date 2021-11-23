const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/dbConnection');
const manageModel = require('../models/manage');
const userModel = require('../models/user');
const userQuery = require('../queries/user');

const verifyUser = async (req, res) => {
  const { idCardNo, dateOfBirth } = req.body;

  const user = await userModel.findOne({
    attributes: ['USERID'],
    where: {
      IDCARDNO: idCardNo,
    },
  });

  if (user) {
    const userId = user.dataValues;

    const { DATEOFBIRTH: dbDateOfBirth } = await userModel.findOne({
      attributes: ['DATEOFBIRTH'],
      where: {
        IDCARDNO: idCardNo,
      },
    });

    if (dateOfBirth === dbDateOfBirth) {
      return res.status(200).send(userId);
    } else {
      return res.status(400).json({ message: 'กรุณาระบุวันเกิดให้ถูกต้อง' });
    }
  } else {
    return res.status(400).json({ message: 'ไม่พบผู้ใช้ดังกล่าวในระบบ' });
  }
};

const residentRegister = async (req, res) => {
  let { email, password } = req.body;
  const { userId } = req.params;

  try {
    const user = await userModel.findOne({
      attributes: ['EMAIL'],
      where: {
        EMAIL: email,
      },
    });

    if (user) {
      return res
        .status(400)
        .json({ message: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาลองอีกครั้ง' });
    } else {
      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      await userModel.update(
        {
          EMAIL: email,
          PASSWORD: password,
        },
        {
          where: {
            USERID: userId,
          },
        }
      );
      return res.status(200).send('User registered');
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง' });
  }
};

const adminRegister = async (req, res) => {
  let { fName, lName, telNo, gender, idCardNo, dateOfBirth, email, password } =
    req.body;

  try {
    const user = await userModel.findOne({
      attributes: ['EMAIL'],
      where: {
        EMAIL: email,
      },
    });

    if (user) {
      return res
        .status(400)
        .json({ message: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาลองอีกครั้ง' });
    } else {
      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      await userModel.create({
        FNAME: fName,
        LNAME: lName,
        TELNO: telNo,
        GENDER: gender,
        IDCARDNO: idCardNo,
        DATEOFBIRTH: dateOfBirth,
        EMAIL: email,
        PASSWORD: password,
        ROLEID: 1, // Admin
      });
      return res.status(200).send('User registered');
    }
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง' });
  }
};

const userLogin = async (req, res) => {
  let { email, password } = req.body;

  try {
    const user = await userModel.findOne({
      where: {
        EMAIL: email,
      },
    });

    if (!user) {
      res.status(400).json({ message: 'ไม่พบผู้ใช้' });
    }

    const dbPassword = user.PASSWORD;

    bcrypt.compare(password, dbPassword).then(async (match) => {
      if (!match) {
        res.status(400).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
      } else {
        // Return jsonwebtoken
        const payload = await userModel.findOne({
          attributes: ['USERID', 'ROLEID'],
          where: {
            EMAIL: email,
          },
        });
        let token = jwt.sign(payload.dataValues, process.env.AUTH_KEY);

        const data = {
          TOKEN: token,
          USERID: payload.dataValues.USERID,
          ROLEID: payload.dataValues.ROLEID,
        };
        return res.status(200).send(data);
      }
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: 'มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง' });
  }
};

const getUserDetail = async (req, res) => {
  const { authorization } = req.headers;

  jwt.verify(authorization, process.env.AUTH_KEY, async (err, userDetail) => {
    if (err) {
      return res
        .status(400)
        .json({ message: 'มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง' });
    } else {
      let user;

      const {
        USERID: userId,
        FNAME: fName,
        LNAME: lName,
        EMAIL: email,
        ROLEID: roleId,
      } = await userModel.findOne({
        attributes: ['USERID', 'FNAME', 'LNAME', 'EMAIL', 'ROLEID'],
        where: {
          USERID: userDetail.USERID,
        },
      });

      if (userDetail.ROLEID == 0) {
        const additionalDetails = await db.query(userQuery.getResidentDetail, {
          replacements: [userDetail.USERID],
          type: db.QueryTypes.SELECT,
        });

        user = {
          USERID: userId,
          FNAME: fName,
          LNAME: lName,
          EMAIL: email,
          ROLEID: roleId,
          RENTID: additionalDetails[0] ? additionalDetails[0].RENTID : '',
          ROOMID: additionalDetails[0] ? additionalDetails[0].ROOMID : '',
          ROOMNO: additionalDetails[0] ? additionalDetails[0].ROOMNO : '',
          DORMID: additionalDetails[0] ? additionalDetails[0].DORMID : '',
          DORMNAMETH: additionalDetails[0]
            ? additionalDetails[0].DORMNAMETH
            : '',
        };

        return res.status(200).send(user);
      } else if (userDetail.ROLEID == 1) {
        const additionalDetails = await db.query(userQuery.getAdminDetail, {
          replacements: [userDetail.USERID],
          type: db.QueryTypes.SELECT,
        });

        user = {
          USERID: userId,
          FNAME: fName,
          LNAME: lName,
          EMAIL: email,
          ROLEID: roleId,
          DORMID: additionalDetails[0] ? additionalDetails[0].DORMID : '',
          DORMNAMETH: additionalDetails[0]
            ? additionalDetails[0].DORMNAMETH
            : '',
        };

        return res.status(200).send(user);
      }
    }
  });
};

const getUserInfo = async (req, res) => {
  const { userID } = req.params;

  const info = await userModel.findOne({
    attributes: [
      'USERID',
      'FNAME',
      'LNAME',
      'TELNO',
      'GENDER',
      'IDCARDNO',
      'DATEOFBIRTH',
      'ADDRESS',
      'EMAIL',
    ],
    where: {
      USERID: userID,
    },
  });

  return res.status(200).send(info.dataValues);
};

const editUser = async (req, res) => {
  const { userID } = req.params;
  const { fName, lName, telNo, gender, idCardNo, dateOfBirth } = req.body;

  if (fName != '') {
    await userModel.update(
      { FNAME: fName },
      {
        where: {
          USERID: userID,
        },
      }
    );
  }
  if (lName != '') {
    await userModel.update(
      { LNAME: lName },
      {
        where: {
          USERID: userID,
        },
      }
    );
  }
  if (telNo != '') {
    await userModel.update(
      { TELNO: telNo },
      {
        where: {
          USERID: userID,
        },
      }
    );
  }
  if (gender != '') {
    await userModel.update(
      { GENDER: gender },
      {
        where: {
          USERID: userID,
        },
      }
    );
  }
  if (idCardNo != '') {
    await userModel.update(
      { IDCARDNO: idCardNo },
      {
        where: {
          USERID: userID,
        },
      }
    );
  }
  if (dateOfBirth != '') {
    await userModel.update(
      { DATEOFBIRTH: dateOfBirth },
      {
        where: {
          USERID: userID,
        },
      }
    );
  }

  return res
    .status(200)
    .send(String('Information has been updated to user ID ' + userID));
};

const isFirstLogin = async (req, res) => {
  const { userID } = req.params;

  const manage = await manageModel.findOne({
    where: {
      USERID: userID,
    },
  });

  if (manage) {
    console.log(manage);
    return res.status(200).send(true);
  } else {
    console.log('testttt');
    return res.status(200).send(false); // First time
  }
};

module.exports = {
  verifyUser,
  residentRegister,
  adminRegister,
  userLogin,
  getUserDetail,
  getUserInfo,
  editUser,
  isFirstLogin,
};
