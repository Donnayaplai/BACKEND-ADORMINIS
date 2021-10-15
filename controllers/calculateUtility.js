const electricMeterModel = require('../models/electricityMeter');
const waterMeterModel = require('../models/waterMeter');
const invoiceDetail = require('../models/invoiceDetail');
const unitUsedModel = require('../models/unitUsed');
const settingModel = require('../models/setting');
const roomModel = require('../models/room');
const db = require('../config/dbConnection');

const getOldElectricMeterNo = async (roomID) => {
  const electricMeterNo = await db.query(
    `SELECT ELECTRICITYNO 
        FROM ELECTRICITYMETER 
        WHERE ROOMID = ? 
        ORDER BY METERDATE DESC LIMIT 1`,
    {
      replacements: [roomID],
      type: db.QueryTypes.SELECT,
    }
  );
  return electricMeterNo[0].ELECTRICITYNO;
};

const getOldWaterMeterNo = async (roomID) => {
  const waterMeterNo = await db.query(
    `SELECT WATERNO 
        FROM WATERMETER 
        WHERE ROOMID = ? 
        ORDER BY METERDATE DESC LIMIT 1`,
    {
      replacements: [roomID],
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
}

const calculateAndSummary = async (req, res) => {
  const { dormID } = req.params;
  let { arrayMeter } = req.body;

  const electricPricePerUnit = await getElectricPricePerUnit(dormID);
  const waterPricePerUnit = await getWaterPricePerUnit(dormID);
  const minWaterUnit = await getMinWaterUnit(dormID);
  const minWaterPrice = await getMinWaterPrice(dormID);
  const todayDate = new Date().toISOString().slice(0, 10);
  let summary = [];

  for (let i = 0; i < arrayMeter.length; i++) {
    let oldElectricMeterNo = await getOldElectricMeterNo(arrayMeter[i].roomID);
    let electricMeterNo = arrayMeter[i].electricMeterNo ? Number(arrayMeter[i].electricMeterNo) : oldElectricMeterNo;
    let oldWaterMeterNo = await getOldWaterMeterNo(arrayMeter[i].roomID);
    let waterMeterNo = arrayMeter[i].waterMeterNo ? Number(arrayMeter[i].waterMeterNo) : oldWaterMeterNo;
    let electricUnit = 0;
    let waterUnit = 0;

    // console.log("oldElectricMeterNo ", oldElectricMeterNo);
    // console.log("electricMeterNo ", electricMeterNo);
    // console.log("oldWaterMeterNo ", oldWaterMeterNo);
    // console.log("waterMeterNo ", waterMeterNo);

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
  return res.status(200).send(summary);
};

module.exports = { calculateAndSummary };
