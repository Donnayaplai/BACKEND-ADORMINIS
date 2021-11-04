const listOfCostModel = require('../models/listOfCost');
const roomModel = require('../models/room');
const roomTypeModel = require('../models/roomType');
const settingModel = require('../models/setting')

const getRoomNo = async (roomID) => {
  const { ROOMNO: roomNo } = await roomModel.findOne({
    attributes: ['ROOMNO'],
    where: {
      ROOMID: roomID
    }
  })
  return roomNo;
};

const getRoomType = async (roomID) => {
  const { ROOMTYPEID: roomTypeID } = await roomModel.findOne({
    attributes: ['ROOMTYPEID'],
    where: {
      ROOMID: roomID
    }
  });

  const roomType = await roomTypeModel.findOne({
    attributes: ['ROOMNAME', 'PRICE'],
    where: {
      ROOMTYPEID: roomTypeID
    }
  });

  return roomType.dataValues;
}

const getDormSetting = async (dormID) => {
  const setting = await settingModel.findOne({
    where: {
      DORMID: dormID
    }
  });
  return setting.dataValues;
};

const getAllRoomByBuildingID = (req, res) => {
  const { buildingID } = req.params;

  roomModel.findAll({
    where: {
      BUILDINGID: buildingID
    }
  })
    .then((data) => {
      return res.status(200).send(data);
    })
    .catch(() => {
      return res.status(400).json({ message: "มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง" });
    });
};

const getRoomInfo = async (req, res) => {
  const { dormID, roomID } = req.params;

  const { MAINTENANCEFEE: maintenanceFee, PARKINGFEE: parkingFee, INTERNETFEE: internetFee, CLEANINGFEE: cleaningFee, OTHER: other } = await listOfCostModel.findOne({
    where: {
      ROOMID: roomID,
    },
  });
  const { ROOMNAME: roomName, PRICE: roomPrice } = await getRoomType(roomID);
  const { MAINTENANCEFEE: maintenancePrice, PARKINGFEE: parkingPrice, INTERNETFEE: internetPrice, CLEANINGFEE: cleaningPrice, OTHER: otherPrice } = await getDormSetting(dormID);
  let listOfCost = [];

  if (maintenanceFee == true) {
    listOfCost.push({ costId: "4", costName: "ส่วนกลาง", costPrice: maintenancePrice })
  };
  if (parkingFee == true) {
    listOfCost.push({ costId: "5", costName: "ที่จอดรถ", costPrice: parkingPrice })
  };
  if (internetFee == true) {
    listOfCost.push({ costId: "6", costName: "อินเทอร์เน็ต", costPrice: internetPrice })
  };
  if (cleaningFee == true) {
    listOfCost.push({ costId: "7", costName: "รักษาความสะอาด", costPrice: cleaningPrice })
  };
  if (other == true) {
    listOfCost.push({ costId: "8", costName: "อื่น ๆ", costPrice: otherPrice })
  };

  return res.status(200).send({ roomNo: await getRoomNo(roomID), roomName: roomName, roomPrice: roomPrice, listOfCost })
};

const editCost = async (req, res) => {
  const { roomID } = req.params;
  const { listOfCost } = req.body;

  let insertData = {
    MAINTENANCEFEE: 0,
    PARKINGFEE: 0,
    INTERNETFEE: 0,
    CLEANINGFEE: 0,
    OTHER: 0
  };

  listOfCost.forEach(async (loc) => {
    if (loc == 4) {
      insertData.MAINTENANCEFEE = 1;
    } else if (loc == 5) {
      insertData.PARKINGFEE = 1;
    } else if (loc == 6) {
      insertData.INTERNETFEE = 1;
    } else if (loc == 7) {
      insertData.CLEANINGFEE = 1
    } else if (loc == 8) {
      insertData.OTHER = 1
    }
  })

  await listOfCostModel.update(insertData, {
    where: {
      ROOMID: roomID
    }
  })
    .then((data) => {
      return res.status(200).send(data);
    })
    .catch(() => {
      return res.status(400).json({ message: "มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง" });
    });
};

module.exports = { getAllRoomByBuildingID, getRoomInfo, editCost };