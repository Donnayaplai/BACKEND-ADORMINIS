const { body } = require('express-validator');

const schema = [
    body('email')
        .isEmail()
        .withMessage('กรุณากรอก email ให้ถูกต้อง'),
    body('password')
        .isLength({ min: 6, max: 20 })
        .withMessage('กรุณากรอกรหัสผ่านความยาว 6 - 20 ตัวเลขหรือตัวอักษร')
];

module.exports = { residentRegisterSchema: schema }