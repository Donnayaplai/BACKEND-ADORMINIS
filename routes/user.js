const express = require('express');
const router = express.Router();
const { RESIDENT_INFO } = require('../controllers/residentInfo');
const userController = require('../controllers/user');

//Get resident info RoomTable page
router.get('/info/:roomID', async (req, res) => {
  const roomID = req.params.roomID;
  const residentInfo = await RESIDENT_INFO(roomID);
  res.json(residentInfo);
});

router.post('/verifyUser', userController.verifyUser);

router.post('/register/:userId', userController.residentRegister);

router.post('/adminRegister', userController.adminRegister);

router.post('/login', userController.userLogin);

router.get('/detail', userController.getUserDetail);

module.exports = router;
