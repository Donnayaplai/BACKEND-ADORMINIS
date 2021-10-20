const express = require('express');
const router = express.Router();
const rentController = require('../controllers/rent');
const roomController = require('../controllers/room');

// Get all room by buildingID
router.get('/all/:buildingID', roomController.getAllRoomByBuildingID);

// Add resident to specific room
router.post('/:buildingID/:roomID', async (req, res) => {
  req.params.roomID;
  req.params.buildingID;
  console.log("Add resident to room ID ", req.params.roomID);
  await rentController.addUserToRoom(req, res);
});

// Edit Cor and rent info
router.post('/edit/:rentID/:CoRID', async (req, res) => {
  req.params.rentID;
  req.params.CoRID;
  console.log("Edit information to rent ID ", req.params.rentID);
  await rentController.editCoRAndRentInfo(req, res);
});

// Remove resident
router.post('/remove/:roomID/:rentID', async (req, res) => {
  req.params.roomID;
  req.params.rentID;
  console.log("Remove resident from room ID ", req.params.roomID);
  await rentController.removeUser(req, res);
});

module.exports = router;