// Invoice controller
const getUnitUsed = `
    SELECT ELECTRICIRYUNIT , WATERUNIT 
    FROM UNIT_USED
    WHERE ROOMID = :roomID
    AND UNITUSEDDATE LIKE :billingCycle
    ORDER BY UNITUSEDID DESC
    LIMIT 1;
`

module.exports = { getUnitUsed };