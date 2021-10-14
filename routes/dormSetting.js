const express = require('express');
const router = express.Router();

const { createNewDorm } = require('../controllers/dorm');
const { getCostSettingByDormID, uocCostSetting, getBuildingsByDormID, uocBuildings, updateDormInfo } = require('../controllers/setting')

// Create new dormitory
router.post('/', createNewDorm);

// Get old cost setting detail
router.get('/getCost/:dormID', getCostSettingByDormID);

// UoC cost setting
router.post('/setCost/:dormID', uocCostSetting);

// Get Building list
router.get('/getBuildings/:dormID', getBuildingsByDormID);

// UoC building
router.post('/setBuildings/:dormID', uocBuildings);

module.exports = router;