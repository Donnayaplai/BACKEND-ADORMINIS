const express = require('express');
const router = express.Router();
const { createNewDorm, getDormInfo, updateDormInfo } = require('../controllers/dorm');

// Create new dormitory
router.post('/:userID', createNewDorm);

// Get dorm info
router.get('/info/:dormID', getDormInfo);

// Update dormitory info
router.post('/update/:dormID', updateDormInfo);

module.exports = router;