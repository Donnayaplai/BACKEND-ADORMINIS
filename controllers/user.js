const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const genCode = async () => {
  var code = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (var i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return code;
}

const residentRegister = async (req, res) => {
  var { fname, lname, telno, gender, IDCardNo, email, password } = req.body;
  try {
    let user = await User.findOne({
      attributes: ['EMAIL'],
      where: {
        EMAIL: email
      }
    });

    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exist' }] });
    }
    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    let newUser = await User.create({
      FNAME: fname,
      LNAME: lname,
      TELNO: telno,
      GENDER: gender,
      IDCARDNO: IDCardNo,
      EMAIL: email,
      PASSWORD: password,
      PERSONALCODE: await genCode(),
      ROLEID: 0 // Resident
    });
    console.log("New user was created: ", newUser.EMAIL)
    res.status(200).send('User registered')
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
}

const adminRegister = async (req, res) => {
  var { fname, lname, telno, gender, IDCardNo, email, password } = req.body;
  try {
    let user = await User.findOne({
      attributes: ['EMAIL'],
      where: {
        EMAIL: email
      }
    });

    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exist' }] });
    }
    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    let newUser = await User.create({
      FNAME: fname,
      LNAME: lname,
      TELNO: telno,
      GENDER: gender,
      IDCARDNO: IDCardNo,
      EMAIL: email,
      PASSWORD: password,
      ROLEID: 1 // Admin
    });
    console.log("New user was created: ", newUser.EMAIL)
    res.status(200).send('User registered')
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
}

const userLogin = async (req, res) => {
  var { email, password } = req.body;
  try {
    // Check email
    const user = await User.findOne({
      where: {
        EMAIL: email
      }
    });

    if (!user) {
      res.status(400).json({ error: "Email not found" });
    }
    // Check password
    const dbPassword = user.PASSWORD;
    // console.log("dbPassword: ", dbPassword)
    bcrypt.compare(password, dbPassword).then(async (match) => {
      if (!match) {
        res.status(400).json({ error: "Email or password incorrect" });
      } else {
        // Return jsonwebtoken
        const payload = await User.findOne({
          attributes: ['USERID', 'ROLEID'],
          where: {
            EMAIL: email
          }
        });
        // console.log("Payload: ", payload.dataValues)
        let token = jwt.sign(payload.dataValues, "sectret");
        console.log(token)
        res.status(200).send(token);
      }
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
}

module.exports = { residentRegister, adminRegister, userLogin };