const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/dbConnection');
const userModel = require('../models/user');
const userQuery = require('../queries/user');

const verifyUser = async (req, res) => {
  const { idCardNo, dateOfBirth } = req.body;

  const user = await userModel.findOne({
    attributes: ['USERID'],
    where: {
      IDCARDNO: idCardNo
    }
  });

  if (user) {

    const userId = user.dataValues;

    const { DATEOFBIRTH: dbDateOfBirth } = await userModel.findOne({
      attributes: ['DATEOFBIRTH'],
      where: {
        IDCARDNO: idCardNo
      }
    });

    if (dateOfBirth === dbDateOfBirth) {
      return res.status(200).send(userId);
    } else {
      return res.status(400).send("Date of birth is not match");
    }
  } else {
    return res.status(400).send("User not found");
  }
};

const residentRegister = async (req, res) => {
  let { email, password } = req.body;
  const { userId } = req.params;

  try {
    const user = await userModel.findOne({
      attributes: ['EMAIL'],
      where: {
        EMAIL: email
      }
    });

    if (user) {
      return res.status(400).send("Email already exist");
    } else {
      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      await userModel.update(
        {
          EMAIL: email,
          PASSWORD: password
        },
        {
          where: {
            USERID: userId
          }
        }
      );
      return res.status(200).send("User registered");
    }
  } catch (err) {
    return res.status(500).send("Server error");
  }
};

const adminRegister = async (req, res) => {
  let { fName, lName, telNo, gender, idCardNo, dateOfBirth, email, password } = req.body;

  try {
    const user = await userModel.findOne({
      attributes: ['EMAIL'],
      where: {
        EMAIL: email
      }
    });

    if (user) {
      return res.status(400).send("User already exist");
    } else {
      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      let newUser = await userModel.create({
        FNAME: fName,
        LNAME: lName,
        TELNO: telNo,
        GENDER: gender,
        IDCARDNO: idCardNo,
        DATEOFBIRTH: dateOfBirth,
        EMAIL: email,
        PASSWORD: password,
        ROLEID: 1 // Admin
      });
      return res.status(200).send("User registered");
    }
  } catch (err) {
    return res.status(500).send("Server error");
  }
};

const userLogin = async (req, res) => {
  let { email, password } = req.body;

  try {
    const user = await userModel.findOne({
      where: {
        EMAIL: email
      }
    });

    if (!user) {
      res.status(400).send("Email not found");
    }

    const dbPassword = user.PASSWORD;

    bcrypt.compare(password, dbPassword).then(async (match) => {
      if (!match) {
        res.status(400).send("Email or password incorrect");
      } else {
        // Return jsonwebtoken
        const payload = await userModel.findOne({
          attributes: ['USERID', 'ROLEID'],
          where: {
            EMAIL: email
          }
        });
        let token = jwt.sign(payload.dataValues, process.env.AUTH_KEY);

        const data = {
          TOKEN: token,
          ROLEID: payload.dataValues.ROLEID
        };
        return res.status(200).send(data);
      }
    });
  } catch (err) {
    return res.status(500).send("Server error");
  }
};

const getUserDetail = async (req, res) => {
  const { authorization } = req.headers;

  jwt.verify(authorization, process.env.AUTH_KEY, async (err, userDetail) => {
    if (err) {
      return res.status(400).send(err.message);
    } else {
      if (userDetail.ROLEID == 0) {
        const user = await db.query(
          userQuery.getResidentDetail,
          {
            replacements: [userDetail.USERID],
            type: db.QueryTypes.SELECT,
          }
        );
        return res.status(200).send(user[0]);
      } else if (userDetail.ROLEID == 1) {
        user = await db.query(
          userQuery.getAdminDetail,
          {
            replacements: [userDetail.USERID],
            type: db.QueryTypes.SELECT,
          }
        );
        return res.status(200).send(user[0]);
      }
    }
  });
};

const getUserInfo = async (req, res) => {
  const { userID } = req.params;

  const info = await userModel.findOne({
    attributes: ['USERID', 'FNAME', 'LNAME', 'TELNO', 'GENDER', 'IDCARDNO', 'DATEOFBIRTH', 'ADDRESS', 'EMAIL'],
    where: {
      USERID: userID
    }
  });

  return res.status(200).send(info.dataValues);
};

const editUser = async (req, res) => {
  const { userID } = req.params;
  const { fName, lName, telNo, gender, idCardNo, dateOfBirth } = req.body;

  if (fName != "") {
    await userModel.update({ FNAME: fName }, {
      where: {
        USERID: userID
      }
    });
  }
  if (lName != "") {
    await userModel.update({ LNAME: lName }, {
      where: {
        USERID: userID
      }
    });
  }
  if (telNo != "") {
    await userModel.update({ TELNO: telNo }, {
      where: {
        USERID: userID
      }
    });
  }
  if (gender != "") {
    await userModel.update({ GENDER: gender }, {
      where: {
        USERID: userID
      }
    });
  }
  if (idCardNo != "") {
    await userModel.update({ IDCARDNO: idCardNo }, {
      where: {
        USERID: userID
      }
    });
  }
  if (dateOfBirth != "") {
    await userModel.update({ DATEOFBIRTH: dateOfBirth }, {
      where: {
        USERID: userID
      }
    });
  }

  return res.status(200).send(String("Information has been updated to user ID " + userID));
};

module.exports = { verifyUser, residentRegister, adminRegister, userLogin, getUserDetail, getUserInfo, editUser };