const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
    const dbDateOfBirth = await userModel.findOne({
      attributes: ['DATEOFBIRTH'],
      where: {
        IDCARDNO: idCardNo
      }
    });

    if (dateOfBirth === dbDateOfBirth.dataValues.DATEOFBIRTH) {
      res.status(200).send(userId)

    } else {
      return res.status(400).json({ errors: [{ msg: 'Date of birth is not match' }] });
    }

  } else {
    return res.status(400).send(false);
  }
}

const residentRegister = async (req, res) => {
  var { email, password } = req.body;
  const { userId } = req.params;
  try {
    const user = await userModel.findOne({
      attributes: ['EMAIL'],
      where: {
        EMAIL: email
      }
    });

    if (user) {
      return res.status(400).json({ errors: [{ msg: 'Email already exist' }] });

    } else {
      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      await userModel.update({
        EMAIL: email,
        PASSWORD: password
      }, {
        where: {
          USERID: userId
        }
      });
      console.log("New user was created: ", email)
      res.status(200).send('User registered')
    }

  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
}

const adminRegister = async (req, res) => {
  var { fName, lName, telNo, gender, idCardNo, dateOfBirth, email, password } = req.body;
  try {
    const user = await userModel.findOne({
      attributes: ['EMAIL'],
      where: {
        EMAIL: email
      }
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
        ROLEID: 1 // Admin
      });
      console.log("New user was created: ", newUser.EMAIL)
      res.status(200).send('User registered')
    }

  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
}

const userLogin = async (req, res) => {
  var { email, password } = req.body;
  try {
    const user = await userModel.findOne({
      where: {
        EMAIL: email
      }
    });

    if (!user) {
      res.status(400).json({ error: "Email not found" });
    }

    const dbPassword = user.PASSWORD;
    bcrypt.compare(password, dbPassword).then(async (match) => {

      if (!match) {
        res.status(400).json({ error: "Email or password incorrect" });

      } else {
        // Return jsonwebtoken
        const payload = await userModel.findOne({
          attributes: ['USERID', 'ROLEID'],
          where: {
            EMAIL: email
          }
        });
        let token = jwt.sign(payload.dataValues, "sectret");

        const data = {
          TOKEN: token,
          ROLEID: payload.dataValues.ROLEID
        }

        console.log(data)
        res.status(200).send(data);
      }
    });

  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
}

const getUserDetail = async (req, res) => {
  const { authorization } = req.headers

  jwt.verify(authorization, "sectret", async (err, userDetail) => {
    if (err) {
      res.status(400).send(err.message)
    } else {
      const user = await userModel.findOne({
        where: {
          USERID: userDetail.USERID
        }
      });

      res.status(200).send(user)
    }
  })
};

module.exports = { verifyUser, residentRegister, adminRegister, userLogin, getUserDetail };