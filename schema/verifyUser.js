const { body } = require('express-validator');

const schema = [
    body('idCardNo')
        .isLength(13)
        .withMessage('กรุณากรอกเลขบัตรประชาให้ถูกต้อง'),
    body('dateOfBirth')
        .isDate()
        .withMessage('กรุณาระบุวันเดือนปีเกิด')
];

module.exports = { verifyUserSchema: schema }