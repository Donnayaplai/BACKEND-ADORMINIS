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

//Add resident without code
router.post('/:buildingID/:roomID', async (req, res) => {
  req.params.roomID;
  req.params.buildingID;
  const addResident = await rentController.addUserWithoutCode(req, res);
  res.json(addResident);
});

//Insert addtional info in Profile page
router.post('/addRes/:roomID/:newCoRID/:rentID', async (req, res) => {
  req.params.roomID;
  req.params.newCoRID;
  req.params.rentID;
  console.log('Test Add CoR');
  const addCoRDetail = await rentController.addCoRDetail(req, res);
  res.json(addCoRDetail);
});

//Remove resident
router.post('/remove/:roomID/:rentID', async (req, res) => {
  req.params.roomID;
  req.params.rentID;
  const userRemoved = await rentController.removeUser(req, res);
  res.json(userRemoved);
});

module.exports = router;