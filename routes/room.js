const express = require('express');
const router = express.Router();
const {
  checkRoomStatus,
  addUserToRoom,
  editResidentInfo,
  removeUser,
} = require('../controllers/rent');
const {
  getAllRoomByBuildingID,
  getRoomInfo,
  editCost,
} = require('../controllers/room');

// Check room status before add user to room
router.get('/status/:roomID', checkRoomStatus);

// Add resident to specific room
router.post('/add/:buildingID/:roomID', addUserToRoom);

// Edit resident info in roomTable page
router.post('/edit/:rentID', editResidentInfo);

// Remove resident from room
router.post('/remove/:roomID/:rentID', removeUser);

// Get list of all room by buildingID
router.get('/all/:buildingID', getAllRoomByBuildingID);

// Get room information
router.get('/info/:dormID/:roomID', getRoomInfo);

// Edit list of cost in specific room
router.post('/cost/:roomID', editCost);

module.exports = router;
