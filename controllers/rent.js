const db = require('../config/dbConnection');
const buildingModel = require('../models/building');
const CoRModel = require('../models/contractOfRent');
const listOfCostModel = require('../models/listOfCost');
const rentModel = require('../models/rent');
const roomModel = require('../models/room');
const settingModel = require('../models/setting');
const userModel = require('../models/user');
const roomQuery = require('../queries/room');

const getGuaranteeFee = async (dormID) => {
  const { GUARANTEEFEE: guaranteeFee } = await settingModel.findOne({
    attributes: ['GUARANTEEFEE'],
    where: {
      DORMID: dormID,
    },
  });
  return guaranteeFee;
};

const getRoomPrice = async (roomID) => {
  const roomPrice = await db.query(
    roomQuery.getRoomPrice,
    {
      replacements: [roomID],
      type: db.QueryTypes.SELECT,
    }
  );
  return roomPrice[0].PRICE;
};

const getMultPrePaid = async (dormID) => {
  const { MULTPREPAID: multPrePaid } = await settingModel.findOne({
    attributes: ['MULTPREPAID'],
    where: {
      DORMID: dormID,
    },
  });
  return multPrePaid;
};

const isUserInRoom = async (idCardNo) => {
  const user = await userModel.findOne({
    attributes: ['USERID'],
    where: {
      IDCARDNO: idCardNo,
    },
  });

  if (user == null) {
    return false; // New user
  } else {
    const isInRoom = await rentModel.findAll({
      where: {
        USERID: user.dataValues.USERID,
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

const checkRoomStatus = async (req, res) => {
  const { roomID } = req.params;

  const { STATUS: roomStatus } = await roomModel.findOne({
    attributes: ['STATUS'],
    where: {
      ROOMID: roomID
    }
  });

  if (roomStatus == 0) {
    // Have other user, disable checkbox
    return res.status(200).send({ status: false });
  } else {
    // No have user, enable checkbox
    return res.status(200).send({ status: true });
  }
};

const addUserToRoom = async (req, res) => {
  const { roomID, buildingID } = req.params;
  const { fName, lName, telNo, gender, idCardNo, dateOfBirth, address, startDate, endDate, checkInDate, listOfCost } = req.body;

  const userStatus = await isUserInRoom(idCardNo);

  if (userStatus == false) {

    const { DORMID: dormID } = await buildingModel.findOne({
      attributes: ['DORMID'],
      where: {
        BUILDINGID: buildingID
      }
    });

    const guaranteeFee = await getGuaranteeFee(dormID);
    const roomPrice = await getRoomPrice(roomID);
    const prePaid = Number(await getMultPrePaid(dormID)) * roomPrice;

    const userInfo = {
      FNAME: fName,
      LNAME: lName,
      TELNO: telNo,
      GENDER: gender,
      IDCARDNO: idCardNo,
      DATEOFBIRTH: dateOfBirth,
      ADDRESS: address ? address : null,
      ROLEID: 0 // Resident
    };

    const corInfo = {
      STARTDATE: startDate,
      ENDDATE: endDate,
      GUARANTEEFEE: guaranteeFee,
      PREPAID: prePaid
    };

    let CoRInsertId;

    await CoRModel.create(corInfo).then(resultId => CoRInsertId = resultId.null);

    const user = await userModel.findOne({
      attributes: ['USERID'],
      where: {
        IDCARDNO: idCardNo
      }
    });

    if (!user) {
      // New user
      let userInsertId;

      await userModel.create(userInfo).then(resultId => userInsertId = resultId.null);

      await rentModel.create({
        CHECKINDATE: checkInDate ? checkInDate : null,
        CONTRACTOFRENTID: CoRInsertId,
        USERID: userInsertId,
        ROOMID: roomID
      });

    } else {
      // Old user
      await userModel.update(userInfo, {
        where: {
          USERID: user.dataValues.USERID
        }
      });

      await rentModel.create({
        CHECKINDATE: checkInDate ? checkInDate : null,
        CONTRACTOFRENTID: CoRInsertId,
        USERID: user.dataValues.USERID,
        ROOMID: roomID
      });
    }

    let costs = {
      MAINTENANCEFEE: 0,
      PARKINGFEE: 0,
      INTERNETFEE: 0,
      CLEANINGFEE: 0,
      OTHER: 0
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

    await listOfCostModel.update(costs, {
      where: {
        ROOMID: roomID
      }
    });

    // Update room status to not available
    await roomModel.update({ STATUS: 0 }, {
      where: {
        ROOMID: roomID
      }
    });

    return res.status(200).send(String("Resident has been added to room ID " + roomID));
  } else {
    return res.status(400).json({ message: "ผู้ใช้มีห้องพักอยู่แล้ว" });
  }
};

const editResidentInfo = async (req, res) => {
  const { rentID } = req.params;
  const { fName, lName, telNo, gender, idCardNo, dateOfBirth, address, startDate, endDate, checkInDate } = req.body;

  const { CHECKINDATE: oldCheckInDate, USERID: userID, CONTRACTOFRENTID: CoRID } = await rentModel.findOne({
    attributes: ['CHECKINDATE', 'USERID', 'CONTRACTOFRENTID'],
    where: {
      RENTID: rentID
    }
  });

  const { FNAME: oldFirstName, LNAME: oldLastName, TELNO: oldTelNo, GENDER: oldGender, IDCARDNO: oldIdCardNo, DATEOFBIRTH: oldDateOfBirth, ADDRESS: oldAddress } = await userModel.findOne({
    where: {
      USERID: userID
    }
  });

  const { STARTDATE: oldStartDate, ENDDATE: oldEndDate } = await CoRModel.findOne({
    attributes: ['STARTDATE', 'ENDDATE'],
    where: {
      CONTRACTOFRENTID: CoRID
    }
  });

  const userData = {
    FNAME: fName ? fName : oldFirstName,
    LNAME: lName ? lName : oldLastName,
    TELNO: telNo ? telNo : oldTelNo,
    GENDER: gender ? gender : oldGender,
    IDCARDNO: idCardNo ? idCardNo : oldIdCardNo,
    DATEOFBIRTH: dateOfBirth ? dateOfBirth : oldDateOfBirth,
    ADDRESS: address ? address : oldAddress
  };

  if (fName != "" || lName != "" || telNo != "" || gender != "" || idCardNo != "" || dateOfBirth != "" || address != "") {
    await userModel.update(userData, {
      where: {
        USERID: userID
      }
    });
  }

  if (startDate != "" || endDate != "") {
    await CoRModel.update(({
      STARTDATE: startDate ? startDate : oldStartDate,
      ENDDATE: endDate ? endDate : oldEndDate
    }), {
      where: {
        CONTRACTOFRENTID: CoRID
      }
    });
  }

  if (checkInDate != "") {
    await rentModel.update({ CHECKINDATE: checkInDate ? checkInDate : oldCheckInDate }, {
      where: {
        RENTID: rentID
      }
    });
  }

  return res.status(200).send(String("Information has been updated to rent ID " + rentID));
};

const removeUser = async (req, res) => {
  const { rentID, roomID } = req.params;

  const userInRoom = await rentModel.findAll({
    where: {
      ROOMID: roomID,
      CHECKOUTDATE: null
    }
  });

  await rentModel.update({ CHECKOUTDATE: new Date().toISOString().slice(0, 10) },
    {
      where: {
        RENTID: rentID
      }
    });

  if (userInRoom.length == 1) {
    // Update room status to available
    await roomModel.update({ STATUS: 1 },
      {
        where: {
          ROOMID: roomID
        }
      });
  }

  return res.status(200).send(String("User has been removed from room ID " + roomID));
};

module.exports = { checkRoomStatus, addUserToRoom, editResidentInfo, removeUser };