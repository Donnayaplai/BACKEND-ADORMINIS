const db = require('../config/dbConnection');
const buildingModel = require('../models/building');
const electricMeterModel = require('../models/electricityMeter');
const listOfCostModel = require('../models/listOfCost');
const roomModel = require('../models/room');
const roomTypeModel = require('../models/roomType');
const settingModel = require('../models/setting');
const waterMeterModel = require('../models/waterMeter');
const roomQuery = require('../queries/room');

const getOldCostSettingDetail = async (settingID) => {
  const oldDetail = await settingModel.findOne({
    attributes: [
      'WATERPRICE',
      'ELECTRICITYPRICE',
      'MINWATERUNIT',
      'MINWATERPRICE',
      'GUARANTEEFEE',
      'MULTPREPAID',
      'MAINTENANCEFEE',
      'PARKINGFEE',
      'INTERNETFEE',
      'CLEANINGFEE',
      'OTHER',
      'INVOICEDATE'
    ],
    where: {
      SETTINGID: settingID
    }
  });
  return oldDetail.dataValues;
};

const getBuildingID = async (buildingName, dormID) => {
  const { BUILDINGID: buildingID } = await buildingModel.findOne({
    attributes: ['BUILDINGID'],
    where: {
      BUILDINGNAME: buildingName,
      DORMID: dormID
    }
  });
  return buildingID;
};

const getRoomTypeID = async (roomTypeName, dormID) => {
  const { ROOMTYPEID: roomTypeID } = await roomTypeModel.findOne({
    attributes: ['ROOMTYPEID'],
    where: {
      ROOMNAME: roomTypeName,
      DORMID: dormID
    }
  });
  return roomTypeID;
};

const getCostSettingByDormID = async (req, res) => {
  const { dormID } = req.params;

  const { SETTINGID: settingID } = await settingModel.findOne({
    attributes: ['SETTINGID'],
    where: {
      DORMID: dormID
    }
  });

  return res.status(200).send(await getOldCostSettingDetail(settingID));
};

const uocCostSetting = async (req, res) => {
  const { dormID } = req.params;
  const { waterPrice, electricityPrice, minWaterUnit, minWaterPrice, guaranteeFee, multPrePaid, maintenanceFee, parkingFee, internetFee, cleaningFee, invoiceDate, other } = req.body;

  const isSetting = await settingModel.findOne({
    attributes: ['SETTINGID'],
    where: {
      DORMID: dormID
    }
  });

  if (!isSetting) {

    const costDetail = {
      WATERPRICE: waterPrice ? waterPrice : 0,
      ELECTRICITYPRICE: electricityPrice ? electricityPrice : 0,
      MINWATERUNIT: minWaterUnit ? minWaterUnit : 0,
      MINWATERPRICE: minWaterPrice ? minWaterPrice : 0,
      GUARANTEEFEE: guaranteeFee ? guaranteeFee : 0,
      MULTPREPAID: multPrePaid ? multPrePaid : 0,
      MAINTENANCEFEE: maintenanceFee ? maintenanceFee : 0,
      PARKINGFEE: parkingFee ? parkingFee : 0,
      INTERNETFEE: internetFee ? internetFee : 0,
      CLEANINGFEE: cleaningFee ? cleaningFee : 0,
      OTHER: other ? other : 0,
      INVOICEDATE: invoiceDate ? invoiceDate : 1,
      DORMID: dormID
    };

    await settingModel.create(costDetail)
      .then((data) => {
        return res.status(200).send(data);
      })
      .catch(() => {
        return res.status(400).json({ message: "มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง" });
      });

  } else {

    const settingID = isSetting.dataValues.SETTINGID;
    const oldCostSettingDetail = await getOldCostSettingDetail(settingID);

    const costDetail = {
      WATERPRICE: waterPrice ? waterPrice : oldCostSettingDetail.WATERPRICE,
      ELECTRICITYPRICE: electricityPrice ? electricityPrice : oldCostSettingDetail.ELECTRICITYPRICE,
      MINWATERUNIT: minWaterUnit ? minWaterUnit : oldCostSettingDetail.MINWATERUNIT,
      MINWATERPRICE: minWaterPrice ? minWaterPrice : oldCostSettingDetail.MINWATERPRICE,
      GUARANTEEFEE: guaranteeFee ? guaranteeFee : oldCostSettingDetail.GUARANTEEFEE,
      MULTPREPAID: multPrePaid ? multPrePaid : oldCostSettingDetail.MULTPREPAID,
      MAINTENANCEFEE: maintenanceFee ? maintenanceFee : oldCostSettingDetail.MAINTENANCEFEE,
      PARKINGFEE: parkingFee ? parkingFee : oldCostSettingDetail.PARKINGFEE,
      INTERNETFEE: internetFee ? internetFee : oldCostSettingDetail.INTERNETFEE,
      CLEANINGFEE: cleaningFee ? cleaningFee : oldCostSettingDetail.CLEANINGFEE,
      OTHER: other ? other : oldCostSettingDetail.OTHER,
      INVOICEDATE: invoiceDate ? invoiceDate : oldCostSettingDetail.INVOICEDATE,
    };

    await settingModel.update(costDetail, {
      where: {
        DORMID: dormID,
      },
    })
      .then((data) => {
        return res.status(200).send(data);
      })
      .catch(() => {
        return res.status(400).json({ message: "มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง" });
      });
  }
};

const getBuildingsByDormID = (req, res) => {
  const { dormID } = req.params;

  buildingModel.findAll({
    where: {
      DORMID: dormID
    }
  })
    .then((data) => {
      return res.status(200).send(data);
    })
    .catch(() => {
      return res.status(400).json({ message: "มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง" });
    });
};

const uocBuildings = async (req, res) => {
  const { dormID } = req.params;
  const { arrayBuilding } = req.body;

  for (let i = 0; i < arrayBuilding.length; i++) {
    const building = {
      BUILDINGID: arrayBuilding[i].BUILDINGID ? arrayBuilding[i].BUILDINGID : null,
      BUILDINGNAME: arrayBuilding[i].BUILDINGNAME,
      NUMOFFLOOR: arrayBuilding[i].NUMOFFLOOR,
      DORMID: dormID,
    };

    const isBuilding = await buildingModel.findOne({
      where: {
        BUILDINGID: building.BUILDINGID,
        DORMID: dormID,
      },
    });

    if (!isBuilding) {
      await buildingModel.create(building);
    } else {
      await buildingModel.update(building, {
        where: {
          BUILDINGID: building.BUILDINGID,
        },
      });
    }

    if (i == arrayBuilding.length - 1) {
      return res.status(200).send("Success");
    }
  }
};

const getRoomTypesByDormID = (req, res) => {
  const { dormID } = req.params;

  roomTypeModel.findAll({
    where: {
      DORMID: dormID
    }
  })
    .then((data) => {
      return res.status(200).send(data);
    })
    .catch(() => {
      return res.status(400).json({ message: "มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง" });
    });
};

const uocRoomTypes = async (req, res) => {
  const { dormID } = req.params;
  const { arrayRoomTypes } = req.body;

  for (let i = 0; i < arrayRoomTypes.length; i++) {
    const roomType = {
      ROOMTYPEID: arrayRoomTypes[i].ROOMTYPEID ? arrayRoomTypes[i].ROOMTYPEID : null,
      ROOMNAME: arrayRoomTypes[i].ROOMNAME,
      PRICE: arrayRoomTypes[i].PRICE,
      DORMID: dormID,
    };

    const isRoomType = await roomTypeModel.findOne({
      where: {
        ROOMTYPEID: roomType.ROOMTYPEID,
        DORMID: dormID,
      },
    });

    if (!isRoomType) {
      await roomTypeModel.create(roomType);
    } else {
      await roomTypeModel.update(roomType, {
        where: {
          ROOMTYPEID: roomType.ROOMTYPEID,
        },
      });
    }

    if (i == arrayRoomTypes.length - 1) {
      return res.status(200).send("Success");
    }
  }
};

const getRoomSetingByDormID = async (req, res) => {
  const { dormID } = req.params;

  const roomList = await db.query(
    roomQuery.getListOfRoomInSetting,
    {
      replacements: [dormID],
      type: db.QueryTypes.SELECT,
    }
  );

  return res.status(200).send(roomList);
};

const uocRoomSeting = async (req, res) => {
  const { dormID } = req.params;
  const { buildingName, floor, arrayRoom } = req.body;

  for (let i = 0; i < arrayRoom.length; i++) {
    const room = {
      ROOMID: arrayRoom[i].ROOMID ? arrayRoom[i].ROOMID : null,
      ROOMNO: arrayRoom[i].ROOMNO,
      FLOOR: floor,
      BUILDINGID: await getBuildingID(buildingName, dormID),
      ROOMTYPEID: await getRoomTypeID(arrayRoom[i].ROOMNAME, dormID),
    };

    const isRoom = await roomModel.findOne({
      where: {
        ROOMID: room.ROOMID,
      },
    });

    if (!isRoom) {

      let roomInsertId;

      await roomModel.create(room)
        .then((resultId) => (roomInsertId = resultId.null));

      await listOfCostModel.create({ ROOMID: roomInsertId });

      await electricMeterModel.create({ ROOMID: roomInsertId });

      await waterMeterModel.create({ ROOMID: roomInsertId });

    } else {

      await roomModel.update(room, {
        where: {
          ROOMID: room.ROOMID,
        },
      });
    }

    if (i == arrayRoom.length - 1) {
      return res.status(200).send("Success");
    }
  }
};

const getBuildingsWithFloor = async (req, res) => {
  const { dormID } = req.params;

  await buildingModel.findAll({
    attributes: ['BUILDINGID', 'BUILDINGNAME', 'NUMOFFLOOR'],
    where: {
      DORMID: dormID
    }
  })
    .then((data) => {
      return res.status(200).send(data);
    })
    .catch(() => {
      return res.status(400).json({ message: "มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง" });
    });
};

module.exports = { getCostSettingByDormID, uocCostSetting, getBuildingsByDormID, uocBuildings, getRoomTypesByDormID, uocRoomTypes, getRoomSetingByDormID, uocRoomSeting, getBuildingsWithFloor };