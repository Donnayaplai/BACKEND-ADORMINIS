const express = require('express');
const router = express.Router();

const CU = require('../controller/calculateUtility');

router.get('/e/:dormID/:roomID', async (req, res) => {
  req.params.dormID;
  req.params.roomID;
  const meterNo = await CU.GET_EPRICE(req, res);
  res.json(meterNo);
});

router.get('/w/:dormID/:roomID', async (req, res) => {
  req.params.dormID;
  req.params.roomID;
  const meterNo = await CU.GET_WPRICE(req, res);
  res.json(meterNo);
});

router.get('/unit/:dormID/:roomID', async (req, res) => {
  req.params.dormID;
  req.params.roomID;
  const meterNo = await CU.ADD_UNIT_USED(req, res);
  res.json(meterNo);
});

router.post('/unit/:dormID/:roomID', async (req, res) => {
  req.params.dormID;
  req.params.roomID;
  const meterNo = await CU.ADD_UNIT_USED(req, res);
  res.json(meterNo);
});

module.exports = router;
