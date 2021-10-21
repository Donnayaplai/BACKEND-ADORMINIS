const express = require('express');
const router = express.Router();
const { checkRoomStatus, addUserToRoom, editCoRAndRentInfo, removeUser } = require('../controllers/rent');
const { getAllRoomByBuildingID, getRoomInfo, removeCost } = require('../controllers/room');

// Get all room by buildingID
router.get('/all/:buildingID', getAllRoomByBuildingID);

// Check room status before add resident
router.get('/status/:roomID', checkRoomStatus);

// Room information
router.get('/info/:dormID/:roomID', getRoomInfo);

// Remove cost in specific room
router.post('/removeCost/:roomID', removeCost);

// Add resident to specific room
router.post('/:buildingID/:roomID', async (req, res) => {
  req.params.roomID;
  req.params.buildingID;
  console.log("Add resident to room ID ", req.params.roomID);
  await addUserToRoom(req, res);
});

// Edit Cor and rent info
router.post('/edit/:rentID/:CoRID', async (req, res) => {
  req.params.rentID;
  req.params.CoRID;
  console.log("Edit information to rent ID ", req.params.rentID);
  await editCoRAndRentInfo(req, res);
});

// Remove resident
router.post('/remove/:roomID/:rentID', async (req, res) => {
  req.params.roomID;
  req.params.rentID;
  console.log("Remove resident from room ID ", req.params.roomID);
  await removeUser(req, res);
});

module.exports = router;