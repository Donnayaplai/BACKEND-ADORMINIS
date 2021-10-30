// Problem controller
const getResidentComplaintList = `
    SELECT p.PROBLEMID , p.TITLE , p.INFORMEDDATE , p.STATUS 
    FROM PROBLEM p 
    JOIN USER u 
    ON p.USERID = u.USERID 
    JOIN RENT r
    ON u.USERID = r.USERID 
    WHERE r.RENTID = ?
    ORDER BY p.INFORMEDDATE DESC , p.PROBLEMID DESC;
`
// Problem controller
const getAdminComplaintList = `
    SELECT p.PROBLEMID , r.ROOMNO , p.TITLE , p.INFORMEDDATE , p.STATUS 
    FROM PROBLEM p
    JOIN DORMITORY d 
    ON p.DORMID = d.DORMID 
    JOIN BUILDING b
    ON d.DORMID = b.DORMID
    JOIN ROOM r
    ON b.BUILDINGID = r.BUILDINGID
    WHERE d.DORMID = ?
    ORDER BY p.INFORMEDDATE DESC , p.PROBLEMID DESC;
`

module.exports = { getResidentComplaintList, getAdminComplaintList };