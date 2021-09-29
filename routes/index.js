var express = require('express');
var router = express.Router();
const buildingController = require('../controllers/building');
const roomController = require('../controllers/room');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/all-building/:dormID', buildingController.getBuildingByDormID);

router.get('/all-room/:buildingID', roomController.getAllRoomByBuildingID);

module.exports = router;
