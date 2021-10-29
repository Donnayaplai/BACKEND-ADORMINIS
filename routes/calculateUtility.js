const express = require('express');
const router = express.Router();
const { getOldMeterNo, calculateAndSummary } = require('../controllers/calculateUtility');

// Get meter no. of last month
router.get('/meter/:buildingID', getOldMeterNo);

// Calculare unit and price then insert to database and return summary data
router.post('/:dormID', calculateAndSummary);

module.exports = router;