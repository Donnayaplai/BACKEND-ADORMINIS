// Problem controller
const getResidentComplaintList = `
    SELECT p.PROBLEMID , p.TITLE , p.INFORMEDDATE , p.STATUS 
    FROM PROBLEM p 
    JOIN RENT r
    ON p.RENTID = r.RENTID 
    WHERE r.RENTID = ?
    ORDER BY p.INFORMEDDATE DESC , p.PROBLEMID DESC;
`
// Problem controller
const getAdminComplaintList = `
    SELECT p.PROBLEMID  , p.TITLE , p.INFORMEDDATE , p.STATUS , p.RENTID 
    FROM PROBLEM p
    JOIN DORMITORY d 
    ON p.DORMID = d.DORMID 
    WHERE d.DORMID = ?
    ORDER BY p.INFORMEDDATE DESC , p.PROBLEMID DESC;
`

module.exports = { getResidentComplaintList, getAdminComplaintList };