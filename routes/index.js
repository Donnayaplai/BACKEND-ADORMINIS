var express = require('express');
var router = express.Router();
const buildingController = require('../controllers/building');
const roomController = require('../controllers/room');
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/all-building/:dormID', async (req, res) => {
  const dormID = req.params.dormID;
  const allBuilding = await buildingController.getBuildingByDormID(dormID);
  res.json(allBuilding);
});

router.get('/all-room/:buildingID', async (req, res) => {
  const buildingID = req.params.buildingID;
  const allRoom = await await roomController.getAllRoomByBuildingID(buildingID);
  res.json(allRoom);
});

module.exports = router;
