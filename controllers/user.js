const userModel = require('../models/user');
const db = require('../config/dbConnection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
    const dbDateOfBirth = await userModel.findOne({
      attributes: ['DATEOFBIRTH'],
      where: {
        IDCARDNO: idCardNo,
      },
    });

    if (dateOfBirth === dbDateOfBirth.dataValues.DATEOFBIRTH) {
      return res.status(200).send(userId);
    } else {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Date of birth is not match' }] });
    }
  } else {
    return res.status(200).send('User not found');
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
      return res.status(400).json({ errors: [{ msg: 'Email already exist' }] });
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
      console.log('New user was created: ', email);
      res.status(200).send('User registered');
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
};

const adminRegister = async (req, res) => {
  let { fName, lName, telNo, gender, idCardNo, dateOfBirth, email, password } = req.body;

  try {
    const user = await userModel.findOne({
      attributes: ['EMAIL'],
      where: {
        EMAIL: email,
      },
    });

    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exist' }] });
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
        ROLEID: 1, // Admin
      });
      console.log('New user was created: ', newUser.EMAIL);
      res.status(200).send('User registered');
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
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
      res.status(400).json({ error: 'Email not found' });
    }

    const dbPassword = user.PASSWORD;
    bcrypt.compare(password, dbPassword).then(async (match) => {
      if (!match) {
        res.status(400).json({ error: 'Email or password incorrect' });
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
          ROLEID: payload.dataValues.ROLEID,
        };
        res.status(200).send(data);
      }
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
};

const getUserDetail = async (req, res) => {
  const { authorization } = req.headers;
  console.log(authorization);
  jwt.verify(authorization, process.env.AUTH_KEY, async (err, userDetail) => {
    if (err) {
      res.status(400).send(err.message);
    } else {
      if (userDetail.ROLEID == 0) {
        const user = await db.query(
          `SELECT  u.USERID, u.FNAME, u.LNAME, u.EMAIL, u.ROLEID, r.RENTID, r2.ROOMID, r2.ROOMNO, d.DORMID, d.DORMNAMETH 
            FROM USER u JOIN RENT r 
            ON u.USERID =r.USERID 
            JOIN ROOM r2 
            ON r.ROOMID = r2.ROOMID 
            JOIN BUILDING b 
            ON r2.BUILDINGID = b.BUILDINGID 
            JOIN DORMITORY d 
            ON b.DORMID = d.DORMID 
            WHERE u.USERID = ?
            AND r.CHECKOUTDATE IS NULL`,
          {
            replacements: [userDetail.USERID],
            type: db.QueryTypes.SELECT,
          }
        );
        console.log(user);
        res.status(200).send(user[0]);
      } else if (userDetail.ROLEID == 1) {
        user = await db.query(
          `SELECT  u.USERID, u.FNAME, u.LNAME, u.EMAIL,  u.ROLEID, d.DORMID, d.DORMNAMETH 
            FROM USER u JOIN MANAGE m 
            ON u.USERID = m.USERID 
            JOIN DORMITORY d 
            ON m.DORMID = d.DORMID
            WHERE u.USERID = ?`,
          {
            replacements: [userDetail.USERID],
            type: db.QueryTypes.SELECT,
          }
        );
        res.status(200).send(user[0]);
      }
    }
  });
};

module.exports = { verifyUser, residentRegister, adminRegister, userLogin, getUserDetail, };
