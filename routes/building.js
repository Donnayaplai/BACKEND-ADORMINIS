const express = require('express');
const router = express.Router();
const { getBuildingByDormID } = require('../controllers/building');

// Get list of all building
router.get('/all/:dormID', getBuildingByDormID);

module.exports = router;