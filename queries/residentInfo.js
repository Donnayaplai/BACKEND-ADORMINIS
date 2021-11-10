// Resident info controller
const getResidentRoomDorm = `
    SELECT d.DORMNAMETH , d.DORMNAMEENG , d.ADDRESS , d.PROVINCE , d.STREET , d.POSTCODE , d.TELNO , d.SUBDISTRICT , d.DISTRICT , 
    r2.ROOMNO , r2.FLOOR , 
    b.BUILDINGNAME , 
    cor.STARTDATE , cor.ENDDATE , 
    r.CHECKINDATE 
    FROM RENT r 
    JOIN CONTRACT_OF_RENT cor 
    ON r.CONTRACTOFRENTID = cor.CONTRACTOFRENTID 
    JOIN ROOM r2 
    ON r.ROOMID = r2.ROOMID 
    JOIN BUILDING b 
    ON r2.BUILDINGID = b.BUILDINGID 
    JOIN DORMITORY d 
    ON b.DORMID = d.DORMID 
    WHERE r.RENTID = ? ;
`

module.exports = { getResidentRoomDorm };