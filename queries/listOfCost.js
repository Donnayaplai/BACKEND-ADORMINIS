// Invoice controller
const getCostPrice = `
    SELECT c.COSTNAME , id.PRICE
    FROM INVOICE_DETAIL id
    JOIN COST c 
    ON id.COSTID = c.COSTID 
    WHERE c.COSTID = :costID
    AND id.INVOICEID = :invoiceID ;
`

module.exports = { getCostPrice };