require('sequelize');
const userModel = require('../models/user');
const rentModel = require('../models/rent');
const roomModel = require('../models/room');
const CoRModel = require('../models/contractOfRent');
const settingModel = require('../models/setting');

const db = require('../config/dbConnection');

const getUserInfoByCode = async (personalCode) => {
  const user = await userModel.findOne({
    where: {
      PERSONALCODE: personalCode,
    },
  });
  return user;
};

const getUserByCode = async (personalCode) => {
  const userID = await userModel.findOne({
    attributes: ['USERID'],
    where: {
      PERSONALCODE: personalCode,
    },
  });
  return userID.dataValues.USERID;
};

const getRoomPriceByRoomID = async (roomID) => {
  const roomPrice = await db.query(
    `SELECT PRICE 
        FROM ROOM r JOIN ROOM_TYPE rt
        ON r.ROOMTYPEID = rt.ROOMTYPEID
        WHERE r.ROOMID = ?
        `,
    {
      replacements: [roomID],
      type: db.QueryTypes.SELECT,
    }
  );
  return roomPrice[0].PRICE;
};
// console.log("roomPrice: ", roomPrice[0].PRICE);

const getCoRID = async () => {
  const id = await db.query(
    `SELECT MAX(CONTRACTOFRENTID) AS CONTRACTOFRENTID
        FROM CONTRACT_OF_RENT
        `,
    {
      type: db.QueryTypes.SELECT,
    }
  );
  return id[0].CONTRACTOFRENTID;
};
// console.log("id: ", id[0].CONTRACTOFRENTID);

const getDormIDByBuildingID = async (buildingID) => {
  const dormID = await db.query(
    `SELECT DORMID 
        FROM BUILDING
        WHERE BUILDINGID = ?
        `,
    {
      replacements: [buildingID],
      type: db.QueryTypes.SELECT,
    }
  );
  return dormID[0].DORMID;
};

const addUserToRoom = async (req, res) => {
  const roomID = req.params.roomID;
  const code = req.body.personalCode;
  const buildingID = req.params.buildingID;

  const dormID = await getDormIDByBuildingID(buildingID);
  const oldCoRID = await getCoRID();
  const newCoRID = Number(oldCoRID) + 1;
  const roomPrice = await getRoomPriceByRoomID(roomID);
  const multPrePaid = await settingModel.findOne({
    attributes: ['MULTPREPAID'],
    where: {
      DORMID: dormID,
    },
  });
  // console.log("newCoRID: ", newCoRID);
  // console.log("roomPrice: ", roomPrice);
  // console.log("multPrePaid: ", multPrePaid.dataValues.MULTPREPAID);
  const cor = {
    CONTRACTOFRENTID: newCoRID,
    GUARANTEEFEE: roomPrice,
    PREPAID: roomPrice * multPrePaid.dataValues.MULTPREPAID,
  };
  const rent = {
    CONTRACTOFRENTID: newCoRID,
    USERID: await getUserByCode(code),
    ROOMID: roomID,
  };
  // console.log("rent: ", rent);

  CoRModel.create(cor)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log(err);
      return {
        message: err.message,
      };
    });

  rentModel
    .create(rent)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log(err);
      return {
        message: err.message,
      };
    });

  return { roomID, dormID, newCoRID };
};

const addCoRDetail = async (req, res) => {
  const roomID = req.params.roomID;
  // const dormID = req.params.dormID;
  const newCoRID = req.params.newCoRID;
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  // const checkInDate = req.body.checkInDate;

  const cor = {
    STARTDATE: startDate,
    ENDDATE: endDate,
  };

  CoRModel.update(cor, {
    where: {
      CONTRACTOFRENTID: newCoRID,
    },
  })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log(err);
      return {
        message: err.message,
      };
    });

  roomModel
    .update(
      { STATUS: 0 },
      {
        where: {
          ROOMID: roomID,
        },
      }
    )
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log(err);
      return {
        message: err.message,
      };
    });
};

module.exports = { getUserInfoByCode, addUserToRoom, addCoRDetail };
