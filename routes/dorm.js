const express = require('express');
const router = express.Router();

const dormController = require('../controllers/dorm');

//Create new dormitory
router.post('/', dormController.createNewDorm);
module.exports = router;
