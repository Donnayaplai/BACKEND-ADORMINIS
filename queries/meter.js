// Calculate controller
const getOldElectricMeterNo = `
    SELECT ELECTRICITYNO 
    FROM ELECTRICITYMETER 
    WHERE ROOMID = :roomID 
    AND METERDATE LIKE :previousBillingCycle
    ORDER BY EMETERID DESC LIMIT 1;
`
// Calculate controller
const getOldWaterMeterNo = `
    SELECT WATERNO 
    FROM WATERMETER 
    WHERE ROOMID = :roomID 
    AND METERDATE LIKE :previousBillingCycle
    ORDER BY WMETERID DESC LIMIT 1;
`

module.exports = { getOldElectricMeterNo, getOldWaterMeterNo };