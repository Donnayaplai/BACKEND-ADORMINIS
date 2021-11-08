// Calculate controller
const getOldElectricMeterNo = `
    SELECT ELECTRICITYNO 
    FROM ELECTRICITYMETER 
    WHERE ROOMID = :roomID 
    AND METERDATE NOT LIKE :thisBillingCycle
    AND METERDATE < :todayDate
    ORDER BY METERDATE DESC , EMETERID DESC LIMIT 1;
`
// Calculate controller
const getOldWaterMeterNo = `
    SELECT WATERNO 
    FROM WATERMETER 
    WHERE ROOMID = :roomID 
    AND METERDATE NOT LIKE :thisBillingCycle
    AND METERDATE < :todayDate
    ORDER BY METERDATE DESC , WMETERID DESC LIMIT 1;
`

module.exports = { getOldElectricMeterNo, getOldWaterMeterNo };