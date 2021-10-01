require('sequelize');
const User = require('../models/user');
const Role = require('../models/role');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

User.belongsTo(Role);

async function registerUser(req, res) {
  var { fname, lname, telno, gender, IDCardNo, email, password } = req.body;
  try {
    let user = await User.findOne({
      attributes: ['EMAIL'],
      where: {
        EMAIL: email,
      },
    });
    console.log(
      { fname, lname, telno, gender, IDCardNo, email, password },
      '<<<user'
    );
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exist' }] });
    }
    //Encrypt password
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    console.log(password, '<<<pass');
    console.log(
      { fname, lname, telno, gender, IDCardNo, email, password },
      '<<<user2'
    );
    let newUser = await User.create({
      FNAME: fname,
      LNAME: lname,
      TELNO: telno,
      GENDER: gender,
      IDCARDNO: IDCardNo,
      EMAIL: email,
      PASSWORD: password,
    });
    console.log(newUser);
    //Return jsonwebtoken
    const payload = {
      User: await User.findOne({
        attributes: ['USERID'],
        where: {
          EMAIL: email,
        },
      }),
    };
    console.log(payload);
    // jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000000 });
    let token = jwt.sign(payload, 'sectret');
    console.log(token);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
}

module.exports = { registerUser };
