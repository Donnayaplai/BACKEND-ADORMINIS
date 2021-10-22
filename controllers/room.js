require('sequelize');
const roomModel = require('../models/room');
const roomTypeModel = require('../models/roomType');
const settingModel = require('../models/setting')
const listOfCostModel = require('../models/listOfCost');

const getAllRoomByBuildingID = (req, res) => {
  const { buildingID } = req.params;
  roomModel
    .findAll({ where: { BUILDINGID: buildingID } })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || 'Some error occurred while retrieving all room.',
      });
    });
};

const getRoomType = async (roomID) => {
  const room = await roomModel.findOne({
    attributes: ['ROOMTYPEID'],
    where: {
      ROOMID: roomID,
    },
  });

  const roomType = await roomTypeModel.findOne({
    attributes: ['ROOMNAME', 'PRICE'],
    where: {
      ROOMTYPEID: room.dataValues.ROOMTYPEID,
    },
  });

  return roomType.dataValues;
}

const getDormSetting = async (dormID) => {
  const setting = await settingModel.findOne({
    where: {
      DORMID: dormID,
    },
  });
  return setting.dataValues;
};

const getRoomInfo = async (req, res) => {
  const { dormID, roomID } = req.params;

  const cost = await listOfCostModel.findOne({
    where: {
      ROOMID: roomID,
    },
  });

  let listOfCost = []
  const { ROOMNAME: roomName, PRICE: roomPrice } = await getRoomType(roomID)
  const { MAINTENANCEFEE: maintenancePrice, PARKINGFEE: parkingPrice, INTERNETFEE: internetPrice, CLEANINGFEE: cleaningPrice, OTHER: otherPrice } = await getDormSetting(dormID);

  if (cost.dataValues.MAINTENANCEFEE == true) {
    listOfCost.push({ costId: "4", costName: "ส่วนกลาง", constPrice: maintenancePrice })
  };
  if (cost.dataValues.PARKINGFEE == true) {
    listOfCost.push({ costId: "5", costName: "ที่จอดรถ", constPrice: parkingPrice })
  };
  if (cost.dataValues.INTERNETFEE == true) {
    listOfCost.push({ costId: "6", costName: "อินเทอร์เน็ต", constPrice: internetPrice })
  };
  if (cost.dataValues.CLEANINGFEE == true) {
    listOfCost.push({ costId: "7", costName: "รักษาความสะอาด", constPrice: cleaningPrice })
  };
  if (cost.dataValues.OTHER == true) {
    listOfCost.push({ costId: "8", costName: "อื่น ๆ", constPrice: otherPrice })
  };

  return res.status(200).send({ roomName: roomName, roomPrice: roomPrice, listOfCost })
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
  }

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
      ROOMID: roomID,
    },
  })

  return res.status(200).send("Success")
};

module.exports = { getAllRoomByBuildingID, getRoomInfo, editCost };