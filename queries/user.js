// Resident info controller
const getResidentInfo = `
    SELECT u.USERID , u.FNAME , u.LNAME , u.TELNO , u.GENDER , u.IDCARDNO , u.DATEOFBIRTH, u.ADDRESS ,
    r.RENTID , r.CHECKINDATE , r.CHECKOUTDATE ,
    r2.ROOMID , r2.ROOMNO ,r2.FLOOR , r2.BUILDINGID , r2.ROOMTYPEID , r2.STATUS ,
    cor.CONTRACTOFRENTID , cor.STARTDATE , cor.ENDDATE
    FROM USER u 
    JOIN RENT r 
    ON u.USERID = r.USERID
    JOIN ROOM r2
    ON r.ROOMID = r2.ROOMID
    JOIN CONTRACT_OF_RENT cor
    ON r.CONTRACTOFRENTID = cor.CONTRACTOFRENTID
    WHERE r.ROOMID = ?
    AND r.CHECKOUTDATE IS NULL;
`
// User controller
const getResidentDetail = `
    SELECT  u.USERID, r.RENTID, r2.ROOMID, r2.ROOMNO, d.DORMID, d.DORMNAMETH 
    FROM USER u 
    JOIN RENT r 
    ON u.USERID =r.USERID 
    JOIN ROOM r2 
    ON r.ROOMID = r2.ROOMID 
    JOIN BUILDING b 
    ON r2.BUILDINGID = b.BUILDINGID 
    JOIN DORMITORY d 
    ON b.DORMID = d.DORMID 
    WHERE u.USERID = ?
    AND r.CHECKOUTDATE IS NULL;
`
// User controller
const getAdminDetail = `
    SELECT  u.USERID, d.DORMID, d.DORMNAMETH 
    FROM USER u 
    JOIN MANAGE m 
    ON u.USERID = m.USERID 
    JOIN DORMITORY d 
    ON m.DORMID = d.DORMID
    WHERE u.USERID = ? ;
`

module.exports = { getResidentInfo, getResidentDetail, getAdminDetail };