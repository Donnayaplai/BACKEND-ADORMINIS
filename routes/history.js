const express = require('express');
const router = express.Router();
const { getHistory } = require('../controllers/history');

// History
router.get('/:dormID', getHistory);

module.exports = router;