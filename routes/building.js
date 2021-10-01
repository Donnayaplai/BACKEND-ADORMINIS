const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/building');

//Get all building by dormID
router.get('/all/:dormID', buildingController.getBuildingByDormID);

module.exports = router;
