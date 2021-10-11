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
    body('startDate')
        .isDate()
        .withMessage('กรุณาระบุวันเริ่มสัญญา'),
    body('endDate')
        .isDate()
        .withMessage('กรุณาระบุวันสิ้นสุดสัญญา')
];

module.exports = { addUserToRoomSchema: schema }