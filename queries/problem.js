const getResidentComplaintList = `
    SELECT p.PROBLEMID , p.TITLE , p.INFORMEDDATE , p.STATUS 
    FROM RENT r 
    JOIN USER u 
    ON r.USERID = u.USERID 
    JOIN PROBLEM p 
    ON u.USERID = p.USERID 
    WHERE RENTID = ?
    ORDER BY p.INFORMEDDATE DESC , p.PROBLEMID DESC;
`

const getAdminComplaintList = `
    SELECT p.PROBLEMID , p.TITLE , p.INFORMEDDATE , p.STATUS 
    FROM DORMITORY d 
    JOIN PROBLEM p 
    ON d.DORMID = p.DORMID 
    WHERE d.DORMID = ?
    ORDER BY p.INFORMEDDATE DESC , p.PROBLEMID DESC;
`

module.exports = { getResidentComplaintList, getAdminComplaintList };