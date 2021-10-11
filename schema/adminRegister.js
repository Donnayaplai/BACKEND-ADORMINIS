const { body } = require('express-validator');

const schema = [
    body('fName')
        .not().isNumeric()
        .withMessage('กรุณากรอกชื่อให้ถูกต้อง'),
    body('lName')
        .not().isNumeric()
        .withMessage('กรุณากรอกนามสกุลให้ถูกต้อง'),
    body('telNo')
        .isNumeric()
        .withMessage('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง'),
    body('gender')
    .notEmpty()
        .withMessage('กรุณาระบุเพศ'),
    body('idCardNo')
        .isLength(13)
        .withMessage('กรุณากรอกเลขบัตรประชาให้ถูกต้อง'),
    body('dateOfBirth')
        .isDate()
        .withMessage('กรุณาระบุวันเดือนปีเกิด'),
    body('email')
        .isEmail()
        .withMessage('กรุณากรอก email ให้ถูกต้อง'),
    body('password')
        .isLength({ min: 6, max: 20 })
        .withMessage('กรุณากรอกรหัสผ่านความยาว 6 - 20 ตัวเลขหรือตัวอักษร')
];

module.exports = { adminRegisterSchema: schema }