const express = require('express');
const router = express.Router();

const { getCostSettingByDormID, uocCostSetting, getBuildingsByDormID, uocBuildings, getRoomTypesByDormID, uocRoomTypes, getRoomSetingByDormID, uocRoomSeting } = require('../controllers/setting')

// Get old cost setting detail
router.get('/getCost/:dormID', getCostSettingByDormID);

// UoC cost setting
router.post('/setCost/:dormID', uocCostSetting);

// Get Building list
router.get('/getBuildings/:dormID', getBuildingsByDormID);

// UoC building
router.post('/setBuildings/:dormID', uocBuildings);

// Get room type list
router.get('/getRoomTypes/:dormID', getRoomTypesByDormID);

// UoC room type
router.post('/setRoomTypes/:dormID', uocRoomTypes);

// Get room setting list
router.get('/getRooms/:dormID', getRoomSetingByDormID);

// UoC room setting
router.post('/setRooms/:dormID', uocRoomSeting);

module.exports = router;