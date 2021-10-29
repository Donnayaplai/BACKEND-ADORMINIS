// Calculate controller
const getRoomListByBuildingID = `
    SELECT b.BUILDINGNAME , r.ROOMID , r.ROOMNO , r.FLOOR , r.STATUS
    FROM BUILDING b 
    JOIN ROOM r 
    ON b.BUILDINGID = r.BUILDINGID
    WHERE r.BUILDINGID = ? 
    ORDER BY r.FLOOR , r.ROOMNO;
`
// Invoice controller & Rent controller
const getRoomPrice = `
    SELECT PRICE 
    FROM ROOM r 
    JOIN ROOM_TYPE rt
    ON r.ROOMTYPEID = rt.ROOMTYPEID
    WHERE r.ROOMID = ? ;
`
// Invoice controller
const getListOfNotAvailableRoom = `
    SELECT r.ROOMID
    FROM DORMITORY d 
    JOIN BUILDING b 
    ON d.DORMID = b.DORMID 
    JOIN ROOM r 
    ON b.BUILDINGID = r.BUILDINGID
    WHERE d.DORMID = ?
    AND r.STATUS = 0;
`
// Setting controller
const getListOfRoomInSetting = `
    SELECT r.ROOMID , r.ROOMNO , r.FLOOR , r.STATUS , r.BUILDINGID , b.BUILDINGNAME , r.ROOMTYPEID , rt.ROOMNAME 
    FROM ROOM r 
    JOIN BUILDING b 
    ON r.BUILDINGID = b.BUILDINGID 
    JOIN DORMITORY d 
    ON b.DORMID = d.DORMID 
    JOIN ROOM_TYPE rt 
    ON r.ROOMTYPEID = rt.ROOMTYPEID 
    WHERE b.DORMID = ? ;
`

module.exports = { getRoomListByBuildingID, getRoomPrice, getListOfNotAvailableRoom, getListOfRoomInSetting };