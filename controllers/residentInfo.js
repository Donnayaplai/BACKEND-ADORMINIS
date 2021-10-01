require('sequelize');
const db = require('../config/dbConnection');

const RESIDENT_INFO = async (roomID) => {
  const residentInfo = await db.query(
    `SELECT u.USERID , u.FNAME , u.LNAME , u.TELNO , u.GENDER , u.IDCARDNO , u.EMAIL , u.PERSONALCODE ,
            r.RENTID , r.CHECKINDATE , r.CHECKOUTDATE , r.CONTRACTOFRENTID ,
            r2.ROOMID , r2.ROOMNO ,r2.FLOOR , r2.BUILDINGID , r2.ROOMTYPEID , r2.STATUS ,
            cor.STARTDATE , cor.ENDDATE 
    FROM USER u JOIN RENT r 
    ON u.USERID = r.USERID
    JOIN ROOM r2
    ON r.ROOMID = r2.ROOMID
    JOIN CONTRACT_OF_RENT cor
    ON r.CONTRACTOFRENTID = cor.CONTRACTOFRENTID
    WHERE r.ROOMID = ?
    AND r.CHECKOUTDATE IS NULL`,
    {
      replacements: [roomID],
      type: db.QueryTypes.SELECT,
    }
  );
  // console.log(residentInfo, "<<<residentInfo")
  return residentInfo;
};

module.exports = { RESIDENT_INFO };
