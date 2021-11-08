// Invoice controller
const getAdminInvoiceList = `
    SELECT i.INVOICEID AS "invoiceID" , r.ROOMNO AS "roomNo" , r.FLOOR AS "floor" , i.TOTALPRICE AS "totalPrice" , 
    SUBSTRING(i.INVOICEDATE,1,7) AS "billingCycle" , 
    SUBSTRING(i.INVOICEDATE,1,4) AS "billingYear" , 
    SUBSTRING(i.INVOICEDATE,6,2) AS "billingMonth"
    FROM DORMITORY d 
    JOIN BUILDING b 
    ON d.DORMID = b.DORMID 
    JOIN ROOM r 
    ON b.BUILDINGID = r.BUILDINGID
    JOIN INVOICE i 
    ON r.ROOMID = i.ROOMID 
    WHERE d.DORMID = ?
    AND i.TOTALPRICE IS NOT NULL
    ORDER BY 5 DESC , r.FLOOR , r.ROOMNO;
`
// Invoice controller
const getResidentInvoiceList = `
    SELECT i.INVOICEID AS "invoiceID" , i.TOTALPRICE AS "totalPrice" , 
    SUBSTRING(i.INVOICEDATE,1,7) AS "billingCycle" , 
    SUBSTRING(i.INVOICEDATE,1,4) AS "billingYear" , 
    SUBSTRING(i.INVOICEDATE,6,2) AS "billingMonth"
    FROM INVOICE i 
    JOIN ROOM r 
    ON i.ROOMID = r.ROOMID
    JOIN RENT r2 
    ON r.ROOMID  = r2.ROOMID 
    WHERE r2.RENTID = :rentID
    AND i.VIEWDATE <= :todayDate
    AND i.TOTALPRICE IS NOT NULL
    ORDER BY 3 DESC;
`
// Invoice controller
const getInvoiceDetail = `
    SELECT r.ROOMID , r.ROOMNO , i.INVOICEDATE , i.TOTALPRICE 
    FROM INVOICE i 
    JOIN ROOM r 
    ON i.ROOMID = r.ROOMID 
    WHERE i.INVOICEID = ? ;
`

module.exports = { getAdminInvoiceList, getResidentInvoiceList, getInvoiceDetail };