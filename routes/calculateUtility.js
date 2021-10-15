const express = require('express');
const router = express.Router();

const { calculateAndSummary } = require('../controllers/calculateUtility');

router.post('/:dormID', calculateAndSummary);

module.exports = router;
