const express = require('express');
const router = express.Router();

const { getOldMeterNo, calculateAndSummary } = require('../controllers/calculateUtility');

router.get('/meter/:dormID', getOldMeterNo);

router.post('/:dormID', calculateAndSummary);

module.exports = router;
