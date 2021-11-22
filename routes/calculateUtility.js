const express = require('express');
const router = express.Router();
const { getMeterNo, calculate, getSummaryData } = require('../controllers/calculateUtility');

// Get meter no.
router.get('/meter/:buildingID', getMeterNo);

// Calculate unit and price then insert to database
router.post('/:dormID', calculate);

// Get summary from calculation
router.get('/summary/:buildingID', getSummaryData);

module.exports = router;