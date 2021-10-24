const userModel = require('../models/user');
const rentModel = require('../models/rent');
const roomModel = require('../models/room');
const CoRModel = require('../models/contractOfRent');
const settingModel = require('../models/setting');
const listOfCostModel = require('../models/listOfCost');
const db = require('../config/dbConnection');

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

const getUserID = async () => {
  const id = await db.query(
    `SELECT MAX(USERID) AS USERID
        FROM USER
        `,
    {
      type: db.QueryTypes.SELECT,
    }
  );
  return id[0].USERID;
};

const getGuaranteeFee = async (dormID) => {
  const guaranteeFee = await settingModel.findOne({
    attributes: ['GUARANTEEFEE'],
    where: {
      DORMID: dormID,
    },
  });
  return guaranteeFee.dataValues.GUARANTEEFEE;
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

const getMultPrePaid = async (dormID) => {
  const multPrePaid = await settingModel.findOne({
    attributes: ['MULTPREPAID'],
    where: {
      DORMID: dormID,
    },
  });
  return multPrePaid.dataValues.MULTPREPAID;
};

const isUserInRoom = async (idCardNo) => {
  const userID = await userModel.findOne({
    attributes: ['USERID'],
    where: {
      IDCARDNO: idCardNo,
    },
  });

  if (userID == null) {
    return false; // New user
  } else {
    const isInRoom = await rentModel.findAll({
      where: {
        USERID: userID.dataValues.USERID,
        CHECKOUTDATE: null,
      },
    });

    if (!isInRoom[0]) {
      return false;
    } else {
      return true; // User already in room
    }
  }
};

const getOldCoRAndRentDetail = async (rentID, CoRID) => {
  const oldCheckInDate = await rentModel.findOne({
    attributes: ['CHECKINDATE'],
    where: {
      RENTID: rentID,
    },
  });
  const oldStartDate = await CoRModel.findOne({
    attributes: ['STARTDATE'],
    where: {
      CONTRACTOFRENTID: CoRID,
    },
  });
  const oldEndDate = await CoRModel.findOne({
    attributes: ['ENDDATE'],
    where: {
      CONTRACTOFRENTID: CoRID,
    },
  });
  const data = {
    CHECKINDATE: oldCheckInDate.dataValues.CHECKINDATE,
    STARTDATE: oldStartDate.dataValues.STARTDATE,
    ENDDATE: oldEndDate.dataValues.ENDDATE,
  };
  return data;
};

const checkRoomStatus = async (req, res) => {
  const { roomID } = req.params;

  const roomStatus = await roomModel.findOne({
    attributes: ['STATUS'],
    where: {
      ROOMID: roomID,
    },
  });

  if (roomStatus.dataValues.STATUS == 0) {
    // Have other user, disable checkbox
    return res.status(200).send({ status: false });
  } else {
    // No have user, enable checkbox
    return res.status(200).send({ status: true });
  }
};

const addUserToRoom = async (req, res) => {
  const { roomID, buildingID } = req.params;
  const {
    fName,
    lName,
    telNo,
    gender,
    idCardNo,
    dateOfBirth,
    address,
    startDate,
    endDate,
    checkInDate,
    listOfCost,
  } = req.body;
  console.log(req.body);

  const userStatus = await isUserInRoom(idCardNo);

  if (userStatus == false) {
    const dormID = await getDormIDByBuildingID(buildingID);
    const nextCoRID = Number(await getCoRID()) + 1;
    const nextUserID = Number(await getUserID()) + 1;
    const guaranteeFee = await getGuaranteeFee(dormID);
    const roomPrice = await getRoomPriceByRoomID(roomID);
    const prePaid = Number(await getMultPrePaid(dormID)) * roomPrice;

    const userInfo = {
      FNAME: fName,
      LNAME: lName,
      TELNO: telNo,
      GENDER: gender,
      IDCARDNO: idCardNo,
      DATEOFBIRTH: dateOfBirth,
      ADDRESS: address ? address : null,
      ROLEID: 0, // Resident
    };

    const corInfo = {
      CONTRACTOFRENTID: nextCoRID,
      STARTDATE: startDate,
      ENDDATE: endDate,
      GUARANTEEFEE: guaranteeFee,
      PREPAID: prePaid,
    };

    // Create new cor
    CoRModel.create(corInfo)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        console.log(err);
        return {
          message: err.message,
        };
      });

    const isIdCardNoExist = await userModel.findOne({
      attributes: ['USERID'],
      where: {
        IDCARDNO: idCardNo,
      },
    });

    if (!isIdCardNoExist) {
      // New user

      // Create new user
      userModel
        .create(userInfo)
        .then((data) => {
          return data;
        })
        .catch((err) => {
          console.log(err);
          return {
            message: err.message,
          };
        });
      console.log('New user created');

      // Create new rent for new user
      rentModel
        .create({
          CHECKINDATE: checkInDate ? checkInDate : null,
          CONTRACTOFRENTID: nextCoRID,
          USERID: nextUserID,
          ROOMID: roomID,
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
    } else {
      // Old user

      const thisUserID = isIdCardNoExist.dataValues.USERID;

      // Update user
      userModel
        .update(userInfo, {
          where: {
            IDCARDNO: idCardNo,
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
      console.log('User updated');

      // Create new rent for old user
      rentModel
        .create({
          CHECKINDATE: checkInDate ? checkInDate : null,
          CONTRACTOFRENTID: nextCoRID,
          USERID: thisUserID,
          ROOMID: roomID,
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
    }

    // Update room status to not available
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

    let costs = {
      MAINTENANCEFEE: 0,
      PARKINGFEE: 0,
      INTERNETFEE: 0,
      CLEANINGFEE: 0,
      OTHER: 0,
    };

    listOfCost.forEach(async (loc) => {
      if (loc == 4) {
        costs.MAINTENANCEFEE = 1;
      } else if (loc == 5) {
        costs.PARKINGFEE = 1;
      } else if (loc == 6) {
        costs.INTERNETFEE = 1;
      } else if (loc == 7) {
        costs.CLEANINGFEE = 1;
      } else if (loc == 8) {
        costs.OTHER = 1;
      }
    });

    listOfCostModel
      .update(costs, {
        where: {
          ROOMID: roomID,
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

    const message = String('Resident has been added to room ID ' + roomID);
    return res.status(200).send(message);
  } else {
    return res.status(400).send('User already in room');
  }
};

const editCoRAndRentInfo = async (req, res) => {
  const { rentID, CoRID } = req.params;
  const { startDate, endDate, checkInDate } = req.body.editUserData;
  const oldDetail = await getOldCoRAndRentDetail(rentID, CoRID);
  const oldCheckInDate = oldDetail.CHECKINDATE;
  const oldStartDate = oldDetail.STARTDATE;
  const oldEndDate = oldDetail.ENDDATE;

  const rentInfo = {
    CHECKINDATE: checkInDate ? checkInDate : oldCheckInDate,
  };
  const corInfo = {
    STARTDATE: startDate ? startDate : oldStartDate,
    ENDDATE: endDate ? endDate : oldEndDate,
  };

  // Update rent
  rentModel
    .update(rentInfo, {
      where: {
        RENTID: rentID,
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

  // Update cor
  CoRModel.update(corInfo, {
    where: {
      CONTRACTOFRENTID: CoRID,
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

  const message = String('Information has been updated to rent ID ' + rentID);
  return res.status(200).send(message);
};

const removeUser = async (req, res) => {
  const { rentID, roomID } = req.params;
  const checkOutDate = new Date().toISOString().slice(0, 10);
  const userInRoom = await rentModel.findAll({
    where: {
      ROOMID: roomID,
      CHECKOUTDATE: null,
    },
  });

  // Update rent
  rentModel
    .update(
      {
        CHECKOUTDATE: checkOutDate,
      },
      {
        where: {
          RENTID: rentID,
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

  if (userInRoom.length == 1) {
    // Update room status to available
    roomModel
      .update(
        { STATUS: 1 },
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
  }

  const message = String('User has been removed from room ID ' + roomID);
  return res.status(200).send(message);
};

module.exports = {
  checkRoomStatus,
  addUserToRoom,
  editCoRAndRentInfo,
  removeUser,
};
