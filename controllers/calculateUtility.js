const eMeter = require('../models/electricityMeter');
const wMeter = require('../models/waterMeter');
const unitUsed = require('../models/unitUsed');
const setting = require('../models/setting');

const db = require('../config/dbConnection');

const OLD_EMETER = async (roomID) => {
  const eMeterNo = await db.query(
    `SELECT ELECTRICITYNO 
        FROM ELECTRICITYMETER 
        WHERE ROOMID = ? 
        ORDER BY METERDATE DESC LIMIT 1`,
    {
      replacements: [roomID],
      type: db.QueryTypes.SELECT,
    }
  );
  // console.log(eMeterNo[0].ELECTRICITYNO, "<<<meterNo")
  return eMeterNo[0].ELECTRICITYNO;
};

const GET_EUNIT = async (req, res) => {
  var eMeterNo = Number(req.body.eMeterNo);
  var oldEMeterNo = await OLD_EMETER(req.params.roomID);

  if (eMeterNo < oldEMeterNo) {
    eMeterNo += Number(9999.0);
    const ELECTRICIRYUNIT = eMeterNo - oldEMeterNo;

    // console.log(eMeterNo, "<<<if")
    // console.log(ELECTRICIRYUNIT)
    return ELECTRICIRYUNIT;
  } else {
    const ELECTRICIRYUNIT = eMeterNo - oldEMeterNo;
    // console.log(ELECTRICIRYUNIT)
    return ELECTRICIRYUNIT;
  }
  // console.log(req.body.eUnit)
  // console.log(eUnit)
  // console.log(oldEUnit)
  // console.log(result)
};

const OLD_WMETER = async (roomID) => {
  const wMeterNo = await db.query(
    `SELECT WATERNO 
        FROM WATERMETER 
        WHERE ROOMID = ? 
        ORDER BY METERDATE DESC LIMIT 1`,
    {
      replacements: [roomID],
      type: db.QueryTypes.SELECT,
    }
  );
  // console.log(wMeterNo[0].WATERNO, "<<<meterNo")
  return wMeterNo[0].WATERNO;
};

const GET_WUNIT = async (req, res) => {
  var wMeterNo = Number(req.body.wMeterNo);
  var oldWMeterNo = await OLD_WMETER(req.params.roomID);

  if (wMeterNo < oldWMeterNo) {
    wMeterNo += Number(9999.0);
    const WATERUNIT = wMeterNo - oldWMeterNo;

    // console.log(wMeterNo, "<<<if")
    // console.log(WATERUNIT)
    return WATERUNIT;
  } else {
    const WATERUNIT = wMeterNo - oldWMeterNo;

    // console.log(WATERUNIT)
    return WATERUNIT;
  }
};

const GET_EPRICE = async (req, res) => {
  const dormID = req.params.dormID;

  const ELECTRICITYPRICE = await setting.findOne({
    attributes: ['ELECTRICITYPRICE'],
    where: {
      DORMID: dormID,
    },
  });
  // console.log("ELECTRICITYPRICE: ", ELECTRICITYPRICE.dataValues.ELECTRICITYPRICE)

  var price = Number(0);
  var pricePerUnit = ELECTRICITYPRICE.dataValues.ELECTRICITYPRICE;
  var unitUsed = await GET_EUNIT(req, res);

  price = unitUsed * pricePerUnit;
  console.log('price: ', price);
  return price;
};

const GET_WPRICE = async (req, res) => {
  // pseudo
  // get min_unit from dormsetting
  // if GET_WUNIT[0].WATERUNIT > min_unit
  // then price = ((GET_WUNIT[0].WATERUNIT - min_unit) * water_unit_price) + min_price ***???
  // else price = min_price
  const dormID = req.params.dormID;

  const MINWATERUNIT = await setting.findOne({
    attributes: ['MINWATERUNIT'],
    where: {
      DORMID: dormID,
    },
  });
  // console.log("MINWATERUNIT: ", MINWATERUNIT.dataValues.MINWATERUNIT)

  const WATERPRICE = await setting.findOne({
    attributes: ['WATERPRICE'],
    where: {
      DORMID: dormID,
    },
  });
  // console.log("WATERPRICE: ", WATERPRICE.dataValues.WATERPRICE)

  const MINWATERPRICE = await setting.findOne({
    attributes: ['MINWATERPRICE'],
    where: {
      DORMID: dormID,
    },
  });
  // console.log("MINWATERPRICE: ", MINWATERPRICE.dataValues.MINWATERPRICE)

  var price = Number(0);
  var minUnit = MINWATERUNIT.dataValues.MINWATERUNIT;
  var pricePerUnit = WATERPRICE.dataValues.WATERPRICE;
  var minPrice = MINWATERPRICE.dataValues.MINWATERPRICE;
  var unitUsed = await GET_WUNIT(req, res);

  if (unitUsed.WATERUNIT > minUnit) {
    price = (unitUsed.WATERUNIT - minUnit) * pricePerUnit + minPrice;
    console.log(
      unitUsed.WATERUNIT,
      ' - ',
      minUnit,
      ' * ',
      pricePerUnit,
      ' + ',
      minPrice
    );
  } else {
    price = minPrice;
  }
  console.log('price: ', price);
  return price;
};

const ADD_UNIT_USED = async (req, res) => {
  const waterUnit = await GET_WUNIT(req, res);
  const electricityUnit = await GET_EUNIT(req, res);
  const todayDate = new Date().toISOString().slice(0, 10);
  const roomID = req.params.roomID;

  // ADD_UNIT_USED
  const unit_used = {
    WATERUNIT: waterUnit,
    ELECTRICIRYUNIT: electricityUnit,
    UNITUSEDDATE: todayDate,
    ROOMID: roomID,
  };
  console.log(unit_used);

  // ADD_ELECTRICITY_METER
  const electricityMeter = {
    ELECTRICITYNO: req.body.eMeterNo,
    METERDATE: todayDate,
    ROOMID: roomID,
  };
  console.log(electricityMeter);

  // ADD_WATER_METER
  const waterMeter = {
    WATERNO: req.body.wMeterNo,
    METERDATE: todayDate,
    ROOMID: roomID,
  };
  console.log(waterMeter);

  eMeter
    .create(electricityMeter)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });

  wMeter
    .create(waterMeter)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });

  unitUsed
    .create(unit_used)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });

  return unit_used;
};

module.exports = { GET_EPRICE, GET_WPRICE, ADD_UNIT_USED };
