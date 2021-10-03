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

const getOldCoRDetail = async (rentID, CoRID) => {
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
    ENDDATE: oldEndDate.dataValues.ENDDATE
  }
  return data;
}

const getUserAndCoRInfo = async (rentID) => {
  const info = await db.query(
    `SELECT u.FNAME , u.LNAME , u.TELNO , u.GENDER , u.IDCARDNO , u.EMAIL , r.CHECKINDATE , cor.STARTDATE , cor.ENDDATE 
    FROM USER u JOIN RENT r 
    ON u.USERID = r.USERID
    JOIN CONTRACT_OF_RENT cor 
    ON r.CONTRACTOFRENTID = cor.CONTRACTOFRENTID
    WHERE r.RENTID  = ?`,
    {
      replacements: [rentID],
      type: db.QueryTypes.SELECT,
    }
  );
  console.log(info)
  return info;
}

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

const getRentID = async () => {
  const id = await db.query(
    `SELECT MAX(RENTID) AS RENTID
        FROM RENT
        `,
    {
      type: db.QueryTypes.SELECT,
    }
  );
  return id[0].RENTID;
};

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
  const oldRentID = await getRentID();
  const newRentID = Number(oldRentID) + 1;
  const checkOutDate = new Date().toISOString().slice(0, 10);
  const roomPrice = await getRoomPriceByRoomID(roomID);
  const multPrePaid = await settingModel.findOne({
    attributes: ['MULTPREPAID'],
    where: {
      DORMID: dormID,
    },
  });

  const cor = {
    CONTRACTOFRENTID: newCoRID,
    GUARANTEEFEE: roomPrice,
    PREPAID: roomPrice * multPrePaid.dataValues.MULTPREPAID,
  };
  const rent = {
    CONTRACTOFRENTID: newCoRID,
    CHECKOUTDATE: checkOutDate,
    USERID: await getUserByCode(code),
    ROOMID: roomID,
  };

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

  return { roomID, dormID, newCoRID, newRentID };
};

const addUserWithoutCode = async (req, res) => {
  const roomID = req.params.roomID;
  const buildingID = req.params.buildingID;

  const dormID = await getDormIDByBuildingID(buildingID);
  const oldCoRID = await getCoRID();
  const newCoRID = Number(oldCoRID) + 1;
  const oldUserID = await getUserID();
  const newUserID = Number(oldUserID) + 1;
  const roomPrice = await getRoomPriceByRoomID(roomID);
  const multPrePaid = await settingModel.findOne({
    attributes: ['MULTPREPAID'],
    where: {
      DORMID: dormID,
    },
  });

  const user = {
    FNAME: req.body.fName ? req.body.fName : null,
    LNAME: req.body.lName ? req.body.lName : null,
    TELNO: req.body.telNo ? req.body.telNo : null,
    GENDER: req.body.gender ? req.body.gender : null,
    IDCARDNO: req.body.idCardNo ? req.body.idCardNo : null,
    EMAIL: req.body.email ? req.body.email : null,
    ROLEID: 0
  };
  console.log("User: ", user)
  const cor = {
    CONTRACTOFRENTID: newCoRID,
    STARTDATE: req.body.startDate ? req.body.startDate : null,
    ENDDATE: req.body.endDate ? req.body.endDate : null,
    GUARANTEEFEE: roomPrice,
    PREPAID: roomPrice * multPrePaid.dataValues.MULTPREPAID,
  };
  console.log("CoR: ", cor)
  const rent = {
    CHECKINDATE: req.body.checkInDate ? req.body.checkInDate : null,
    CONTRACTOFRENTID: newCoRID,
    USERID: newUserID,
    ROOMID: roomID,
  };
  console.log("Rent: ", rent)

  userModel.create(user)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log(err);
      return {
        message: err.message,
      };
    });

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

  rentModel.create(rent)
    .then((data) => {
      return data;
    })
    .catch((err) => {
      console.log(err);
      return {
        message: err.message,
      };
    });

  roomModel.update(
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

  return { roomID, dormID };
};

const addCoRDetail = async (req, res) => {
  const roomID = req.params.roomID;
  const newCoRID = req.params.newCoRID;
  const newRentID = req.params.newRentID;

  const cor = {
    STARTDATE: req.body.startDate ? req.body.startDate : null,
    ENDDATE: req.body.endDate ? req.body.endDate : null
  }
  const rent = {
    CHECKINDATE: req.body.checkInDate ? req.body.checkInDate : null,
    CHECKOUTDATE: null
  }

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

  rentModel.update(rent, {
    where: {
      RENTID: newRentID,
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

  roomModel.update(
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
};

const editCoR = async (req, res) => {
  const rentID = req.params.rentID;
  const CoRID = req.params.CoRID;
  const oldDetail = await getOldCoRDetail(rentID, CoRID)
  const oldCheckInDate = oldDetail.CHECKINDATE
  const oldStartDate = oldDetail.STARTDATE
  const oldEndDate = oldDetail.ENDDATE

  const rent = {
    CHECKINDATE: req.body.checkInDate ? req.body.checkInDate : oldCheckInDate
  }
  const cor = {
    STARTDATE: req.body.startDate ? req.body.startDate : oldStartDate,
    ENDDATE: req.body.endDate ? req.body.endDate : oldEndDate
  }

  // console.log("Rent: ", rent)
  // console.log("CoR: ", cor)

  rentModel.update(rent, {
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

  CoRModel.update(cor, {
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
}

const removeUser = async (req, res) => {
  const rentID = req.params.rentID;
  const roomID = req.params.roomID;
  const checkOutDate = new Date().toISOString().slice(0, 10);

  const rent = {
    CHECKOUTDATE: checkOutDate
  };

  rentModel.update(rent, {
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
};

module.exports = { getUserInfoByCode, getUserAndCoRInfo, addUserToRoom, addUserWithoutCode, addCoRDetail, editCoR, removeUser };