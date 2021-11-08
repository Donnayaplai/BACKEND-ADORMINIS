const { Op } = require("sequelize");
const db = require('../config/dbConnection');
const electricMeterModel = require('../models/electricityMeter');
const invoiceDetailModel = require('../models/invoiceDetail');
const invoiceModel = require('../models/invoice');
const roomModel = require('../models/room');
const settingModel = require('../models/setting');
const unitUsedModel = require('../models/unitUsed');
const waterMeterModel = require('../models/waterMeter');
const meterQuery = require('../queries/meter');
const roomQuery = require('../queries/room');

const todayDate = new Date().toISOString().slice(0, 10);

const getOldElectricMeterNo = async (roomID, thisBillingCycle) => {
  const electricMeterNo = await db.query(
    meterQuery.getOldElectricMeterNo,
    {
      replacements: { roomID: roomID, thisBillingCycle: thisBillingCycle + '%', todayDate: todayDate },
      type: db.QueryTypes.SELECT
    }
  );
  return electricMeterNo[0].ELECTRICITYNO;
};

const getOldWaterMeterNo = async (roomID, thisBillingCycle) => {
  const waterMeterNo = await db.query(
    meterQuery.getOldWaterMeterNo,
    {
      replacements: { roomID: roomID, thisBillingCycle: thisBillingCycle + '%', todayDate: todayDate },
      type: db.QueryTypes.SELECT
    }
  );
  return waterMeterNo[0].WATERNO;
};

const getElectricPricePerUnit = async (dormID) => {
  const { ELECTRICITYPRICE: electricityPrice } = await settingModel.findOne({
    attributes: ['ELECTRICITYPRICE'],
    where: {
      DORMID: dormID
    }
  });
  return electricityPrice;
};

const getWaterPricePerUnit = async (dormID) => {
  const { WATERPRICE: waterPrice } = await settingModel.findOne({
    attributes: ['WATERPRICE'],
    where: {
      DORMID: dormID
    }
  });
  return waterPrice;
};

const getMinWaterUnit = async (dormID) => {
  const { MINWATERUNIT: minWaterUnit } = await settingModel.findOne({
    attributes: ['MINWATERUNIT'],
    where: {
      DORMID: dormID
    }
  });
  return minWaterUnit;
};

const getMinWaterPrice = async (dormID) => {
  const { MINWATERPRICE: minWaterPrice } = await settingModel.findOne({
    attributes: ['MINWATERPRICE'],
    where: {
      DORMID: dormID
    }
  });
  return minWaterPrice;
};

const getRoomNoByRoomId = async (roomID) => {
  const { ROOMNO: roomNo } = await roomModel.findOne({
    attributes: ['ROOMNO'],
    where: {
      ROOMID: roomID
    }
  });
  return roomNo;
};

const getInvoiceId = async (roomID, thisBillingCycle) => {
  const { INVOICEID: invoiceId } = await invoiceModel.findOne({
    attributes: ['INVOICEID'],
    where: {
      ROOMID: roomID,
      INVOICEDATE: { [Op.startsWith]: thisBillingCycle }
    }
  });
  return invoiceId;
};

const sumPrice = async (invoiceID) => {
  const price = await invoiceDetailModel.findAll({
    attributes: ['PRICE'],
    where: {
      INVOICEID: invoiceID
    }
  });

  let totalPrice = 0;

  price.forEach(async (p) => {
    totalPrice += p.dataValues.PRICE;
  })
  return totalPrice
};

const getOldMeterNo = async (req, res) => {
  const { buildingID } = req.params;

  const thisBillingCycle = new Date().toISOString().slice(0, 7);

  const roomList = await db.query(
    roomQuery.getRoomListByBuildingID,
    {
      replacements: [buildingID],
      type: db.QueryTypes.SELECT
    }
  );

  let arrayRoomWithMeter = [];

  roomList.forEach(async (rl) => {

    arrayRoomWithMeter.push({
      buildingName: rl.BUILDINGNAME,
      roomID: rl.ROOMID,
      roomNo: rl.ROOMNO,
      floor: rl.FLOOR,
      status: rl.STATUS,
      oldElectricMeterNo: await getOldElectricMeterNo(rl.ROOMID, thisBillingCycle),
      oldWaterMeterNo: await getOldWaterMeterNo(rl.ROOMID, thisBillingCycle)
    });

    if (arrayRoomWithMeter.length == roomList.length) {
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
  const thisBillingYear = todayDate.slice(0, 4);
  const thisBillingMonth = todayDate.slice(5, 7);
  const thisBillingCycle = todayDate.slice(0, 7);
  let previousBillingCycle = '';
  let nextBillingCycle = '';
  let viewDate;

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

  if (thisBillingMonth == 12) {
    let year = Number(thisBillingYear) + 1
    let month = 1
    nextBillingCycle = year + '-' + month
  } else {
    let year = thisBillingYear
    let month = Number(thisBillingMonth) + 1
    if (month < 10) { month = '0' + month }
    nextBillingCycle = year + '-' + month
  }

  let { INVOICEDATE: settingInvoiceDay } = await settingModel.findOne({
    attributes: ['INVOICEDATE'],
    where: {
      DORMID: dormID
    }
  });

  if (settingInvoiceDay < 10) {
    settingInvoiceDay = String('0' + settingInvoiceDay)
  }

  if (Number(todayDate.slice(8, 10)) > Number(settingInvoiceDay)) {
    viewDate = String(nextBillingCycle + '-' + settingInvoiceDay)
  } else {
    viewDate = String(thisBillingCycle + '-' + settingInvoiceDay)
  }

  let summary = [];

  arrayMeter.forEach(async (am) => {
    let oldElectricMeterNo = await getOldElectricMeterNo(am.roomID, previousBillingCycle);
    let electricMeterNo = am.electricMeterNo ? Number(am.electricMeterNo) : oldElectricMeterNo;
    let oldWaterMeterNo = await getOldWaterMeterNo(am.roomID, previousBillingCycle);
    let waterMeterNo = am.waterMeterNo ? Number(am.waterMeterNo) : oldWaterMeterNo;
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
      waterPrice = Number((((waterUnit - minWaterUnit) * waterPricePerUnit) + minWaterPrice).toFixed(2));

    } else {
      waterPrice = minWaterPrice;
    }

    const unitUsedData = {
      WATERUNIT: Number(waterUnit.toFixed(3)),
      ELECTRICIRYUNIT: Number(electricUnit.toFixed(1)),
      UNITUSEDDATE: todayDate,
      ROOMID: am.roomID
    };

    const electricMeterData = {
      ELECTRICITYNO: Number(am.electricMeterNo),
      METERDATE: todayDate,
      ROOMID: am.roomID
    };

    const waterMeterData = {
      WATERNO: Number(am.waterMeterNo),
      METERDATE: todayDate,
      ROOMID: am.roomID
    };

    const summaryData = {
      roomNo: await getRoomNoByRoomId(am.roomID),
      electricUnit: Number(electricUnit.toFixed(1)),
      electricPrice: electricPrice,
      waterUnit: Number(waterUnit.toFixed(3)),
      waterPrice: waterPrice,
      totalPrice: Number((electricPrice + waterPrice).toFixed(2))
    };

    const isAvailable = await roomModel.findOne({
      where: {
        ROOMID: am.roomID,
        STATUS: 1
      }
    });

    if (!isAvailable) {

      const invoiceID = await getInvoiceId(am.roomID, thisBillingCycle);
      const isElectricCost = await invoiceDetailModel.findOne({ where: { COSTID: 2, INVOICEID: invoiceID } });
      const isWaterCost = await invoiceDetailModel.findOne({ where: { COSTID: 3, INVOICEID: invoiceID } });

      if (!isElectricCost) {
        await invoiceDetailModel.create({
          PRICE: electricPrice,
          COSTID: 2,
          INVOICEID: invoiceID
        });
      } else {
        await invoiceDetailModel.update({ PRICE: electricPrice },
          {
            where: {
              COSTID: 2,
              INVOICEID: invoiceID
            }
          });
      }

      if (!isWaterCost) {
        await invoiceDetailModel.create({
          PRICE: waterPrice,
          COSTID: 3,
          INVOICEID: invoiceID
        });
      } else {
        await invoiceDetailModel.update({ PRICE: waterPrice },
          {
            where: {
              COSTID: 3,
              INVOICEID: invoiceID
            }
          });
      }

      await invoiceModel.update({
        TOTALPRICE: await sumPrice(invoiceID),
        INVOICEDATE: todayDate,
        VIEWDATE: viewDate
      },
        {
          where: {
            INVOICEID: invoiceID
          }
        });

    }

    await unitUsedModel.create(unitUsedData);

    await electricMeterModel.create(electricMeterData);

    await waterMeterModel.create(waterMeterData);

    summary.push(summaryData);

    if (summary.length == arrayMeter.length) {
      return res.status(200).send({ thisBillingCycle, summary });
    }
  })
};

module.exports = { getOldMeterNo, calculateAndSummary };