const express = require('express');
const router = express.Router();
const rentController = require('../controllers/rent');
const roomController = require('../controllers/room');

//Get all room by buildingID
router.get('/all/:buildingID', roomController.getAllRoomByBuildingID);

// router.get('/all/:buildingID', async (req, res) => {
//   const buildingID = req.params.buildingID;
//   const rooms = await FIND_ROOMS(buildingID);
//   res.json(rooms);
// });

//Check user info// get user info in Profile page
router.get('/:personalCode', async (req, res) => {
  const personalCode = req.params.personalCode;
  const user = await rentController.getUserInfoByCode(personalCode);
  res.json(user);
});

//Add resident to specific room
router.post('/:buildingID/:roomID', async (req, res) => {
  req.body.personalCode;
  req.params.roomID;
  req.params.buildingID;
  console.log('test', req.body.personalCode, req.params.roomID);
  const addResident = await rentController.addUserToRoom(req, res);
  res.json(addResident);
});

//Insert addtional info in Profile page
router.post('/addRes/:dormID/:roomID/:newCoRID', async (req, res) => {
  req.params.dormID;
  req.params.roomID;
  req.params.newCoRID;
  console.log('Test Add CoR');
  const addCoRDetail = await rentController.addCoRDetail(req, res);
  res.json(addCoRDetail);
});

module.exports = router;
