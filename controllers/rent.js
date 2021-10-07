require('sequelize');
const userModel = require('../models/user');
const rentModel = require('../models/rent');
const roomModel = require('../models/room');
const CoRModel = require('../models/contractOfRent');
const settingModel = require('../models/setting');

const db = require('../config/dbConnection');

// const getUserInfoByCode = async (personalCode) => {
//   const user = await userModel.findOne({
//     where: {
//       PERSONALCODE: personalCode,
//     },
//   });
//   return user;
// };

// const getUserByCode = async (personalCode) => {
//   const userID = await userModel.findOne({
//     attributes: ['USERID'],
//     where: {
//       PERSONALCODE: personalCode,
//     },
//   });
//   return userID.dataValues.USERID;
// };

// const getUserAndCoRInfo = async (rentID) => {
//   const info = await db.query(
//     `SELECT u.FNAME , u.LNAME , u.TELNO , u.GENDER , u.IDCARDNO , u.EMAIL , r.CHECKINDATE , cor.STARTDATE , cor.ENDDATE 
//     FROM USER u JOIN RENT r 
//     ON u.USERID = r.USERID
//     JOIN CONTRACT_OF_RENT cor 
//     ON r.CONTRACTOFRENTID = cor.CONTRACTOFRENTID
//     WHERE r.RENTID  = ?`,
//     {
//       replacements: [rentID],
//       type: db.QueryTypes.SELECT,
//     }
//   );
//   console.log(info)
//   return info;
// }

// const addUserToRoom = async (req, res) => {
//   const roomID = req.params.roomID;
//   const code = req.body.personalCode;
//   const buildingID = req.params.buildingID;

//   const dormID = await getDormIDByBuildingID(buildingID);
//   const oldCoRID = await getCoRID();
//   const newCoRID = Number(oldCoRID) + 1;
//   const oldRentID = await getRentID();
//   const newRentID = Number(oldRentID) + 1;
//   const checkOutDate = new Date().toISOString().slice(0, 10);
//   const roomPrice = await getRoomPriceByRoomID(roomID);
//   const multPrePaid = await settingModel.findOne({
//     attributes: ['MULTPREPAID'],
//     where: {
//       DORMID: dormID,
//     },
//   });

//   const cor = {
//     CONTRACTOFRENTID: newCoRID,
//     GUARANTEEFEE: roomPrice,
//     PREPAID: roomPrice * multPrePaid.dataValues.MULTPREPAID,
//   };
//   const rent = {
//     CONTRACTOFRENTID: newCoRID,
//     CHECKOUTDATE: checkOutDate,
//     USERID: await getUserByCode(code),
//     ROOMID: roomID,
//   };

//   CoRModel.create(cor)
//     .then((data) => {
//       return data;
//     })
//     .catch((err) => {
//       console.log(err);
//       return {
//         message: err.message,
//       };
//     });

//   rentModel
//     .create(rent)
//     .then((data) => {
//       return data;
//     })
//     .catch((err) => {
//       console.log(err);
//       return {
//         message: err.message,
//       };
//     });

//   return { roomID, dormID, newCoRID, newRentID };
// };

// const addCoRDetail = async (req, res) => {
//   const roomID = req.params.roomID;
//   const newCoRID = req.params.newCoRID;
//   const newRentID = req.params.newRentID;

//   const cor = {
//     STARTDATE: req.body.startDate ? req.body.startDate : null,
//     ENDDATE: req.body.endDate ? req.body.endDate : null
//   }
//   const rent = {
//     CHECKINDATE: req.body.checkInDate ? req.body.checkInDate : null,
//     CHECKOUTDATE: null
//   }

//   CoRModel.update(cor, {
//     where: {
//       CONTRACTOFRENTID: newCoRID,
//     },
//   })
//     .then((data) => {
//       return data;
//     })
//     .catch((err) => {
//       console.log(err);
//       return {
//         message: err.message,
//       };
//     });

//   rentModel.update(rent, {
//     where: {
//       RENTID: newRentID,
//     },
//   })
//     .then((data) => {
//       return data;
//     })
//     .catch((err) => {
//       console.log(err);
//       return {
//         message: err.message,
//       };
//     });

//   roomModel.update(
//     { STATUS: 0 },
//     {
//       where: {
//         ROOMID: roomID,
//       },
//     }
//   )
//     .then((data) => {
//       return data;
//     })
//     .catch((err) => {
//       console.log(err);
//       return {
//         message: err.message,
//       };
//     });

//   CoRModel.update(cor, {
//     where: {
//       CONTRACTOFRENTID: newCoRID,
//     },
//   })
//     .then((data) => {
//       return data;
//     })
//     .catch((err) => {
//       console.log(err);
//       return {
//         message: err.message,
//       };
//     });
// };

// const getRentID = async () => {
//   const id = await db.query(
//     `SELECT MAX(RENTID) AS RENTID
//         FROM RENT
//         `,
//     {
//       type: db.QueryTypes.SELECT,
//     }
//   );
//   return id[0].RENTID;
// };

const getDormIDByBuildingID = async (buildingID) => {
  const dormID = await db.query(
    `SELECT DORMID 
        FROM BUILDING
        WHERE BUILDINGID = ?
        `,
    {
      replacements: [buildingID],
      type: db.QueryTypes.SELECT
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
      type: db.QueryTypes.SELECT
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
      type: db.QueryTypes.SELECT
    }
  );
  return id[0].USERID;
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
      type: db.QueryTypes.SELECT
    }
  );
  return roomPrice[0].PRICE;
};

const getMultPrePaid = async (dormID) => {
  const multPrePaid = await settingModel.findOne({
    attributes: ['MULTPREPAID'],
    where: {
      DORMID: dormID
    }
  });
  return multPrePaid.dataValues.MULTPREPAID;
}

const getOldCoRAndRentDetail = async (rentID, CoRID) => {
  const oldCheckInDate = await rentModel.findOne({
    attributes: ['CHECKINDATE'],
    where: {
      RENTID: rentID
    }
  });
  const oldStartDate = await CoRModel.findOne({
    attributes: ['STARTDATE'],
    where: {
      CONTRACTOFRENTID: CoRID
    }
  });
  const oldEndDate = await CoRModel.findOne({
    attributes: ['ENDDATE'],
    where: {
      CONTRACTOFRENTID: CoRID
    }
  });
  const data = {
    CHECKINDATE: oldCheckInDate.dataValues.CHECKINDATE,
    STARTDATE: oldStartDate.dataValues.STARTDATE,
    ENDDATE: oldEndDate.dataValues.ENDDATE
  }
  return data;
}

const addUserToRoom = async (req, res) => {
  const { roomID, buildingID } = req.params;
  const { fName, lName, telNo, gender, idCardNo, dateOfBirth, address, startDate, endDate, checkInDate } = req.body;

  const dormID = await getDormIDByBuildingID(buildingID);
  const nextCoRID = Number(await getCoRID()) + 1;
  const nextUserID = Number(await getUserID()) + 1;
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
    ROLEID: 0
  };

  const corInfo = {
    CONTRACTOFRENTID: nextCoRID,
    STARTDATE: startDate,
    ENDDATE: endDate,
    GUARANTEEFEE: roomPrice,
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
      IDCARDNO: idCardNo
    }
  });

  if (!isIdCardNoExist) { // New user

    // Create new user
    userModel.create(userInfo)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        console.log(err);
        return {
          message: err.message,
        };
      });
    console.log("New user created");

    // Create new rent for new user
    rentModel.create({
      CHECKINDATE: checkInDate,
      CONTRACTOFRENTID: nextCoRID,
      USERID: nextUserID,
      ROOMID: roomID
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

  } else { // Old user

    const thisUserID = isIdCardNoExist.dataValues.USERID;

    // Update user
    userModel.update(userInfo,
      {
        where: {
          IDCARDNO: idCardNo
        }
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
    console.log("User updated");

    // Create new rent for old user
    rentModel.create({
      CHECKINDATE: checkInDate,
      CONTRACTOFRENTID: nextCoRID,
      USERID: thisUserID,
      ROOMID: roomID
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
  roomModel.update(
    { STATUS: 0 },
    {
      where: {
        ROOMID: roomID
      }
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

  return res.status(200).send(console.log("Resident has been added to room ID ", roomID));
};

const editCoRAndRentInfo = async (req, res) => {
  const { rentID, CoRID } = req.params;
  const { startDate, endDate, checkInDate } = req.body;
  const oldDetail = await getOldCoRAndRentDetail(rentID, CoRID)
  const oldCheckInDate = oldDetail.CHECKINDATE
  const oldStartDate = oldDetail.STARTDATE
  const oldEndDate = oldDetail.ENDDATE

  const rentInfo = {
    CHECKINDATE: checkInDate ? checkInDate : oldCheckInDate
  }
  const corInfo = {
    STARTDATE: startDate ? startDate : oldStartDate,
    ENDDATE: endDate ? endDate : oldEndDate
  }

  // Update rent
  rentModel.update(rentInfo, {
    where: {
      RENTID: rentID
    }
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
      CONTRACTOFRENTID: CoRID
    }
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

  return res.status(200).send(console.log("Information has been updated to rent ID ", rentID));
}

const removeUser = async (req, res) => {
  const { rentID, roomID } = req.params;
  const checkOutDate = new Date().toISOString().slice(0, 10);

  // Update rent
  rentModel.update({
    CHECKOUTDATE: checkOutDate
  }, {
    where: {
      RENTID: rentID
    }
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

  const userInRoom = await rentModel.findAll({
    where: {
      ROOMID: roomID,
      CHECKOUTDATE: null
    }
  });

  if (!userInRoom[0]) {

    // Update room status to available
    roomModel
      .update(
        { STATUS: 1 },
        {
          where: {
            ROOMID: roomID
          }
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

  return res.status(200).send(console.log("User has been removed from room ID ", roomID));
};

module.exports = { addUserToRoom, editCoRAndRentInfo, removeUser };