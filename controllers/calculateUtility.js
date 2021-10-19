const electricMeterModel = require('../models/electricityMeter');
const waterMeterModel = require('../models/waterMeter');
const invoiceDetail = require('../models/invoiceDetail');
const unitUsedModel = require('../models/unitUsed');
const settingModel = require('../models/setting');
const roomModel = require('../models/room');
const db = require('../config/dbConnection');

const getOldElectricMeterNo = async (roomID, previousBillingCycle) => {
  const electricMeterNo = await db.query(
    `SELECT ELECTRICITYNO 
      FROM ELECTRICITYMETER 
      WHERE ROOMID = :roomID 
      AND METERDATE LIKE :previousBillingCycle
      ORDER BY EMETERID DESC LIMIT 1`,
    {
      replacements: { roomID: roomID, previousBillingCycle: previousBillingCycle + '%' },
      type: db.QueryTypes.SELECT,
    }
  );
  return electricMeterNo[0].ELECTRICITYNO;
};

const getOldWaterMeterNo = async (roomID, previousBillingCycle) => {
  const waterMeterNo = await db.query(
    `SELECT WATERNO 
      FROM WATERMETER 
      WHERE ROOMID = :roomID 
      AND METERDATE LIKE :previousBillingCycle
      ORDER BY WMETERID DESC LIMIT 1`,
    {
      replacements: { roomID: roomID, previousBillingCycle: previousBillingCycle + '%' },
      type: db.QueryTypes.SELECT,
    }
  );
  return waterMeterNo[0].WATERNO;
};

const getElectricPricePerUnit = async (dormID) => {
  const settingPrice = await settingModel.findOne({
    attributes: ['ELECTRICITYPRICE'],
    where: {
      DORMID: dormID,
    },
  });
  return settingPrice.dataValues.ELECTRICITYPRICE;
};

const getWaterPricePerUnit = async (dormID) => {
  const settingPrice = await settingModel.findOne({
    attributes: ['WATERPRICE'],
    where: {
      DORMID: dormID,
    },
  });
  return settingPrice.dataValues.WATERPRICE;
};

const getMinWaterUnit = async (dormID) => {
  const minWaterUnit = await settingModel.findOne({
    attributes: ['MINWATERUNIT'],
    where: {
      DORMID: dormID,
    },
  });
  return minWaterUnit.dataValues.MINWATERUNIT;
};

const getMinWaterPrice = async (dormID) => {
  const minWaterPrice = await settingModel.findOne({
    attributes: ['MINWATERPRICE'],
    where: {
      DORMID: dormID,
    },
  });
  return minWaterPrice.dataValues.MINWATERPRICE;
};

const getRoomNoByRoomId = async (roomID) => {
  const roomNo = await roomModel.findOne({
    attributes: ['ROOMNO'],
    where: {
      ROOMID: roomID,
    },
  });
  return roomNo.dataValues.ROOMNO;
};

const getOldMeterNo = async (req, res) => {
  const { dormID } = req.params;

  const todayDate = new Date().toISOString().slice(0, 10);
  const thisBillingYear = todayDate.slice(0, 4);
  const thisBillingMonth = todayDate.slice(5, 7);
  const thisBillingCycle = todayDate.slice(0, 7);
  let previousBillingCycle = '';

  if (thisBillingMonth == 1) {
    let year = Number(thisBillingYear) - 1
    let month = 12
    previousBillingCycle = year + '-' + month
  } else {
    let year = thisBillingYear
    let month = Number(thisBillingMonth) - 1
    if (month < 10) { month = '0' + month }
    previousBillingCycle = year + '-' + month
  }

  const roomList = await db.query(
    `SELECT b.BUILDINGNAME , r.ROOMID , r.ROOMNO , r.STATUS
      FROM DORMITORY d JOIN BUILDING b 
      ON d.DORMID = b.DORMID 
      JOIN ROOM r 
      ON b.BUILDINGID = r.BUILDINGID
      WHERE d.DORMID = ?
      ORDER BY r.ROOMID`,
    {
      replacements: [dormID],
      type: db.QueryTypes.SELECT,
    }
  );

  const lastIndexId = roomList[roomList.length - 1].ROOMID;

  let arrayRoomWithMeter = [];

  roomList.forEach(async (roomList) => {

    arrayRoomWithMeter.push({
      buildingName: roomList.BUILDINGNAME,
      roomID: roomList.ROOMID,
      roomNo: roomList.ROOMNO,
      status: roomList.STATUS,
      oldElectricMeterNo: await getOldElectricMeterNo(roomList.ROOMID, previousBillingCycle),
      oldWaterMeterNo: await getOldWaterMeterNo(roomList.ROOMID, previousBillingCycle)
    });

    if (roomList.ROOMID == lastIndexId) {
      return res.status(200).send({ thisBillingCycle, arrayRoomWithMeter });
    }
  })
};

const calculateAndSummary = async (req, res) => {
  const { dormID } = req.params;
  let { arrayMeter } = req.body;

  const electricPricePerUnit = await getElectricPricePerUnit(dormID);
  const waterPricePerUnit = await getWaterPricePerUnit(dormID);
  const minWaterUnit = await getMinWaterUnit(dormID);
  const minWaterPrice = await getMinWaterPrice(dormID);
  const todayDate = new Date().toISOString().slice(0, 10);
  const thisBillingYear = todayDate.slice(0, 4);
  const thisBillingMonth = todayDate.slice(5, 7);
  const thisBillingCycle = todayDate.slice(0, 7);
  let previousBillingCycle = '';

  if (thisBillingMonth == 1) {
    let year = Number(thisBillingYear) - 1
    let month = 12
    previousBillingCycle = year + '-' + month
  } else {
    let year = thisBillingYear
    let month = Number(thisBillingMonth) - 1
    if (month < 10) { month = '0' + month }
    previousBillingCycle = year + '-' + month
  }

  let summary = [];

  for (let i = 0; i < arrayMeter.length; i++) {
    let oldElectricMeterNo = await getOldElectricMeterNo(arrayMeter[i].roomID, previousBillingCycle);
    let electricMeterNo = arrayMeter[i].electricMeterNo ? Number(arrayMeter[i].electricMeterNo) : oldElectricMeterNo;
    let oldWaterMeterNo = await getOldWaterMeterNo(arrayMeter[i].roomID, previousBillingCycle);
    let waterMeterNo = arrayMeter[i].waterMeterNo ? Number(arrayMeter[i].waterMeterNo) : oldWaterMeterNo;
    let electricUnit = 0;
    let waterUnit = 0;

    if (electricMeterNo < oldElectricMeterNo && waterMeterNo < oldWaterMeterNo) {
      // Electric
      electricMeterNo += 9999.9;
      electricUnit = electricMeterNo - oldElectricMeterNo;
      // Water
      waterMeterNo += 9999.999;
      waterUnit = waterMeterNo - oldWaterMeterNo;

    } else if (electricMeterNo < oldElectricMeterNo && waterMeterNo > oldWaterMeterNo) {
      // Electric
      electricMeterNo += 9999.9;
      electricUnit = electricMeterNo - oldElectricMeterNo;
      // Water
      waterUnit = waterMeterNo - oldWaterMeterNo;

    } else if (electricMeterNo > oldElectricMeterNo && waterMeterNo < oldWaterMeterNo) {
      // Electric
      electricUnit = electricMeterNo - oldElectricMeterNo;
      // Water
      waterMeterNo += 9999.999;
      waterUnit = waterMeterNo - oldWaterMeterNo;

    } else if (electricMeterNo > oldElectricMeterNo && waterMeterNo > oldWaterMeterNo) {
      // Electric
      electricUnit = electricMeterNo - oldElectricMeterNo;
      // Water
      waterUnit = waterMeterNo - oldWaterMeterNo;

    } else if (electricMeterNo < oldElectricMeterNo && waterMeterNo == oldWaterMeterNo) {
      // Electric
      electricMeterNo += 9999.9;
      electricUnit = electricMeterNo - oldElectricMeterNo;
      // Water
      waterUnit = 0;

    } else if (electricMeterNo > oldElectricMeterNo && waterMeterNo == oldWaterMeterNo) {
      // Electric
      electricUnit = electricMeterNo - oldElectricMeterNo;
      // Water
      waterUnit = 0;

    } else if (electricMeterNo == oldElectricMeterNo && waterMeterNo < oldWaterMeterNo) {
      // Electric
      electricUnit = 0;
      // Water
      waterMeterNo += 9999.999;
      waterUnit = waterMeterNo - oldWaterMeterNo;

    } else if (electricMeterNo == oldElectricMeterNo && waterMeterNo > oldWaterMeterNo) {
      // Electric
      electricUnit = 0;
      // Water
      waterUnit = waterMeterNo - oldWaterMeterNo;

    } else if (electricMeterNo == oldElectricMeterNo && waterMeterNo == oldWaterMeterNo) {
      // Electric
      electricUnit = 0;
      // Water
      waterUnit = 0;
    }

    let electricPrice = Number((electricUnit * electricPricePerUnit).toFixed(2));
    let waterPrice = 0;
    if (waterUnit > minWaterUnit) {
      waterPrice = Number(((waterUnit - minWaterUnit) * waterPricePerUnit + minWaterPrice).toFixed(2));

    } else {
      waterPrice = minWaterPrice;
    }

    const unitUsedData = {
      WATERUNIT: Number(waterUnit.toFixed(3)),
      ELECTRICIRYUNIT: Number(electricUnit.toFixed(1)),
      UNITUSEDDATE: todayDate,
      ROOMID: arrayMeter[i].roomID
    };

    const invoiceDetailElectricData = {
      PRICE: electricPrice,
      COSTID: 2,
      // INVOICEID:
    };

    const invoiceDetailWaterData = {
      PRICE: waterPrice,
      COSTID: 3,
      // INVOICEID:
    };

    const electricMeterData = {
      ELECTRICITYNO: Number(arrayMeter[i].electricMeterNo),
      METERDATE: todayDate,
      ROOMID: arrayMeter[i].roomID,
    };

    const waterMeterData = {
      WATERNO: Number(arrayMeter[i].waterMeterNo),
      METERDATE: todayDate,
      ROOMID: arrayMeter[i].roomID,
    };

    const summaryData = {
      roomNo: await getRoomNoByRoomId(arrayMeter[i].roomID),
      electricUnit: Number(electricUnit.toFixed(1)),
      electricPrice: electricPrice,
      waterUnit: Number(waterUnit.toFixed(3)),
      waterPrice: waterPrice,
      totalPrice: Number((electricPrice + waterPrice).toFixed(2)),
    }

    // console.log(unitUsedData);
    // console.log(invoiceDetailElectricData);
    // console.log(invoiceDetailWaterData);
    // console.log(electricMeterData);
    // console.log(waterMeterData);

    // await unitUsedModel.create(unitUsedData);
    // await invoiceDetail.create(invoiceDetailElectricData);
    // await invoiceDetail.create(invoiceDetailWaterData);
    // await electricMeterModel.create(electricMeterData);
    // await waterMeterModel.create(waterMeterData);

    summary.push(summaryData);
  }
  return res.status(200).send({ thisBillingCycle, summary });
};

module.exports = { getOldMeterNo, calculateAndSummary };
