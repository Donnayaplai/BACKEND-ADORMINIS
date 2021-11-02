const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboard');

// Get all data in dashboard
router.get('/:dormID', getDashboardData);

module.exports = router;