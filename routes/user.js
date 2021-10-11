const express = require('express');
const router = express.Router();
const { RESIDENT_INFO } = require('../controllers/residentInfo');
const { verifyUser, residentRegister, adminRegister, userLogin, getUserDetail } = require('../controllers/user');
const { validation } = require('../middleware/formValidation');
const { verifyUserSchema } = require('../schema/verifyUser');
const { residentRegisterSchema } = require('../schema/residentRegister');
const { adminRegisterSchema } = require('../schema/adminRegister');

//Get resident info RoomTable page
router.get('/info/:roomID', async (req, res) => {
  const roomID = req.params.roomID;
  const residentInfo = await RESIDENT_INFO(roomID);
  res.json(residentInfo);
});

router.post('/verifyUser', verifyUserSchema, validation, verifyUser);

router.post('/register/:userId', residentRegisterSchema, validation, residentRegister);

router.post('/adminRegister', adminRegisterSchema, validation, adminRegister);

router.post('/login', userLogin);

router.get('/detail', getUserDetail);

module.exports = router;
