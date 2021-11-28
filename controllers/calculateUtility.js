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
const thisBillingYear = todayDate.slice(0, 4);
const thisBillingMonth = todayDate.slice(5, 7);
const thisBillingCycle = todayDate.slice(0, 7);
let nextBillingCycle;

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

const getRoomList = async (buildingID) => {
  return await db.query(
    roomQuery.getRoomListByBuildingID,
    {
      replacements: [buildingID],
      type: db.QueryTypes.SELECT
    }
  );
};

const getOldElectricMeterNo = async (roomID, thisBillingCycle) => {
  const electricMeterNo = await db.query(
    meterQuery.getOldElectricMeterNo,
    {
      replacements: { roomID: roomID, thisBillingCycle: thisBillingCycle + '%', todayDate: todayDate },
      type: db.QueryTypes.SELECT
    }
  );
  return electricMeterNo[0] ? electricMeterNo[0].ELECTRICITYNO : 0;
};

const getOldWaterMeterNo = async (roomID, thisBillingCycle) => {
  const waterMeterNo = await db.query(
    meterQuery.getOldWaterMeterNo,
    {
      replacements: { roomID: roomID, thisBillingCycle: thisBillingCycle + '%', todayDate: todayDate },
      type: db.QueryTypes.SELECT
    }
  );
  return waterMeterNo[0] ? waterMeterNo[0].WATERNO : 0;
};

const getNewElectricMeterNo = async (roomID, thisBillingCycle) => {
  const electricMeterNo = await db.query(
    meterQuery.getNewElectricMeterNo,
    {
      replacements: { roomID: roomID, thisBillingCycle: thisBillingCycle + '%', todayDate: todayDate },
      type: db.QueryTypes.SELECT
    }
  );

  if (electricMeterNo[0]) {
    return electricMeterNo[0].ELECTRICITYNO;
  } else {
    return "";
  }
};

const getNewWaterMeterNo = async (roomID, thisBillingCycle) => {
  const waterMeterNo = await db.query(
    meterQuery.getNewWaterMeterNo,
    {
      replacements: { roomID: roomID, thisBillingCycle: thisBillingCycle + '%', todayDate: todayDate },
      type: db.QueryTypes.SELECT
    }
  );
  if (waterMeterNo[0]) {
    return waterMeterNo[0].WATERNO;
  } else {
    return "";
  }
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

const getUnitUsedId = async (roomID, thisBillingCycle) => {
  const unitUsedId = await unitUsedModel.findOne({
    attributes: ['UNITUSEDID'],
    where: {
      ROOMID: roomID,
      UNITUSEDDATE: { [Op.startsWith]: thisBillingCycle }
    }
  });
  return unitUsedId;
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

const getMeterNo = async (req, res) => {
  const { buildingID } = req.params;

  const thisBillingCycle = todayDate.slice(0, 7);

  const roomList = await getRoomList(buildingID);

  let arrayRoomWithMeter = [];

  roomList.forEach(async (rl) => {

    arrayRoomWithMeter.push({
      buildingName: rl.BUILDINGNAME,
      roomID: rl.ROOMID,
      roomNo: rl.ROOMNO,
      floor: rl.FLOOR,
      status: rl.STATUS,
      oldElectricMeterNo: await getOldElectricMeterNo(rl.ROOMID, thisBillingCycle),
      oldWaterMeterNo: await getOldWaterMeterNo(rl.ROOMID, thisBillingCycle),
      newElectricMeterNo: await getNewElectricMeterNo(rl.ROOMID, thisBillingCycle),
      newWaterMeterNo: await getNewWaterMeterNo(rl.ROOMID, thisBillingCycle)
    });

    if (arrayRoomWithMeter.length == roomList.length) {
      function compare(a, b) {
        if (a.floor < b.floor) {
          return -1;
        }
        if (a.floor > b.floor) {
          return 1;
        }
        if (a.roomNo < b.roomNo) {
          return -1;
        }
        if (a.roomNo > b.roomNo) {
          return 1;
        }
        return 0;
      }
      arrayRoomWithMeter.sort(compare)
      return res.status(200).send({ thisBillingCycle, arrayRoomWithMeter });
    }
  })
};

const calculate = async (req, res) => {
  const { dormID } = req.params;
  const { roomID, electricMeterNo, waterMeterNo } = req.body;

  const electricPricePerUnit = await getElectricPricePerUnit(dormID);
  const waterPricePerUnit = await getWaterPricePerUnit(dormID);
  const minWaterUnit = await getMinWaterUnit(dormID);
  const minWaterPrice = await getMinWaterPrice(dormID);
  const oldElectricMeterNo = await getOldElectricMeterNo(roomID, thisBillingCycle);
  let thisElectricMeterNo = electricMeterNo ? Number(electricMeterNo) : oldElectricMeterNo;
  const oldWaterMeterNo = await getOldWaterMeterNo(roomID, thisBillingCycle);
  let thisWaterMeterNo = waterMeterNo ? Number(waterMeterNo) : oldWaterMeterNo;
  let viewDate;

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

  let electricUnit = 0;
  let waterUnit = 0;

  if (thisElectricMeterNo < oldElectricMeterNo) {
    if ((String(oldElectricMeterNo).split("."))[0].length == 4) {
      thisElectricMeterNo += 9999.0;
    } else if ((String(oldElectricMeterNo).split("."))[0].length == 5) {
      thisElectricMeterNo += 99999.0;
    }
    electricUnit = thisElectricMeterNo - oldElectricMeterNo;

  } else if (thisElectricMeterNo > oldElectricMeterNo) {
    electricUnit = thisElectricMeterNo - oldElectricMeterNo;

  } else {
    electricUnit = 0;
  }

  if (thisWaterMeterNo < oldWaterMeterNo) {
    thisWaterMeterNo += 9999.000;
    waterUnit = thisWaterMeterNo - oldWaterMeterNo;

  } else if (thisWaterMeterNo > oldWaterMeterNo) {
    waterUnit = thisWaterMeterNo - oldWaterMeterNo;

  } else {
    waterUnit = 0;
  }

  let electricPrice = Number((electricUnit * electricPricePerUnit).toFixed(2));
  let waterPrice = 0;

  // Check room status
  const isAvailable = await roomModel.findOne({
    where: {
      ROOMID: roomID,
      STATUS: 1
    }
  });

  // Set water price
  if (waterUnit > minWaterUnit) {
    waterPrice = Number((((waterUnit - minWaterUnit) * waterPricePerUnit) + minWaterPrice).toFixed(2));

  } else {

    if (waterUnit == 0 && isAvailable) {
      waterPrice = 0;

    } else {
      waterPrice = minWaterPrice;
    }
  }

  // Set meter and unit only room used
  if (electricMeterNo || waterMeterNo) {

    if (electricMeterNo) {
      await electricMeterModel.create({
        ELECTRICITYNO: electricMeterNo,
        METERDATE: todayDate,
        ROOMID: roomID
      });
    }

    if (waterMeterNo) {
      await waterMeterModel.create({
        WATERNO: waterMeterNo,
        METERDATE: todayDate,
        ROOMID: roomID
      });
    }

    const unitUsedId = await getUnitUsedId(roomID, thisBillingCycle);

    if (!unitUsedId) {
      await unitUsedModel.create({
        WATERUNIT: Number(waterUnit.toFixed(3)),
        ELECTRICIRYUNIT: Number(electricUnit.toFixed(1)),
        UNITUSEDDATE: todayDate,
        ROOMID: roomID
      });

    } else {

      if (electricMeterNo) {
        await unitUsedModel.update({
          ELECTRICIRYUNIT: Number(electricUnit.toFixed(1)),
          UNITUSEDDATE: todayDate,
        }, {
          where: {
            UNITUSEDID: unitUsedId.dataValues.UNITUSEDID
          }
        });
      }

      if (waterMeterNo) {
        await unitUsedModel.update({
          WATERUNIT: Number(waterUnit.toFixed(3)),
          UNITUSEDDATE: todayDate,
        }, {
          where: {
            UNITUSEDID: unitUsedId.dataValues.UNITUSEDID
          }
        });
      }
    }

    // Set price in invoice only not available room
    if (!isAvailable) {

      const invoiceID = await getInvoiceId(roomID, thisBillingCycle);
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
        }
      );
    }
  }

  return res.status(200).send("Success");
};

const getSummaryData = async (req, res) => {
  const { buildingID } = req.params;

  const roomList = await getRoomList(buildingID);

  let summary = [];

  roomList.forEach(async (rl) => {

    let electricUnit;
    let waterUnit;
    let electricPrice;
    let waterPrice;

    if (rl.STATUS == 1) {
      electricUnit = 0;
      waterUnit = 0;
      electricPrice = 0;
      waterPrice = 0;
    } else {

      const invoiceID = await getInvoiceId(rl.ROOMID, thisBillingCycle);

      electricUnit = await unitUsedModel.findOne({
        attributes: ['ELECTRICIRYUNIT'],
        where: {
          UNITUSEDDATE: { [Op.startsWith]: thisBillingCycle },
          ROOMID: rl.ROOMID
        }
      });

      waterUnit = await unitUsedModel.findOne({
        attributes: ['ELECTRICIRYUNIT'],
        where: {
          UNITUSEDDATE: { [Op.startsWith]: thisBillingCycle },
          ROOMID: rl.ROOMID
        }
      });

      electricPrice = await invoiceDetailModel.findOne({
        attributes: ['PRICE'],
        where: {
          INVOICEID: invoiceID,
          COSTID: 2
        }
      });

      waterPrice = await invoiceDetailModel.findOne({
        attributes: ['PRICE'],
        where: {
          INVOICEID: invoiceID,
          COSTID: 3
        }
      });
    }

    summary.push({
      floor: rl.FLOOR,
      roomNo: rl.ROOMNO,
      electricUnit: electricUnit ? electricUnit.dataValues.ELECTRICIRYUNIT : 0,
      electricPrice: electricPrice ? electricPrice.dataValues.PRICE : 0,
      waterUnit: waterUnit ? waterUnit.dataValues.ELECTRICIRYUNIT : 0,
      waterPrice: waterPrice ? waterPrice.dataValues.PRICE : 0,
      totalPrice: electricPrice && waterPrice ? Number(electricPrice.dataValues.PRICE + waterPrice.dataValues.PRICE) : 0
    });

    if (summary.length == roomList.length) {
      function compare(a, b) {
        if (a.floor < b.floor) {
          return -1;
        }
        if (a.floor > b.floor) {
          return 1;
        }
        if (a.roomNo < b.roomNo) {
          return -1;
        }
        if (a.roomNo > b.roomNo) {
          return 1;
        }
        return 0;
      }
      summary.sort(compare)
      return res.status(200).send({ thisBillingCycle, summary });
    }
  });
};

module.exports = { getMeterNo, calculate, getSummaryData };