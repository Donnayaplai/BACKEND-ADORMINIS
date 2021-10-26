const { Op } = require("sequelize");
const invoiceModel = require('../models/invoice');
const invoiceDetailModel = require('../models/invoiceDetail');
const settingModel = require('../models/setting');
const listOfCostModel = require('../models/listOfCost');
const unitUsedModel = require('../models/unitUsed');
const db = require('../config/dbConnection');

const getDormSetting = async (dormID) => {
    const setting = await settingModel.findOne({
        where: {
            DORMID: dormID,
        },
    });
    return setting.dataValues;
};

const getListOfCost = async (roomID) => {
    const listOfCost = await listOfCostModel.findOne({
        where: {
            ROOMID: roomID,
        },
    });
    return listOfCost.dataValues;
};

const getRoomPrice = async (roomID) => {
    const roomPrice = await db.query(
        `SELECT PRICE 
          FROM ROOM r JOIN ROOM_TYPE rt
          ON r.ROOMTYPEID = rt.ROOMTYPEID
          WHERE r.ROOMID = ?
          `,
        {
            replacements: [roomID],
            type: db.QueryTypes.SELECT,
        }
    );
    return roomPrice[0].PRICE;
};

const getListOfCostInInvoiceDetail = async (costID, invoiceID) => {
    const listOfCost = await db.query(
        `SELECT c.COSTNAME , id.PRICE
            FROM INVOICE_DETAIL id
            JOIN COST c 
            ON id.COSTID = c.COSTID 
            WHERE c.COSTID = :costID
            AND id.INVOICEID = :invoiceID`,
        {
            replacements: { costID: costID, invoiceID: invoiceID },
            type: db.QueryTypes.SELECT,
        }
    );
    return listOfCost[0];
};

const getUnitUsed = async (roomID, billingCycle) => {
    const unit = await db.query(
        `SELECT ELECTRICIRYUNIT , WATERUNIT 
        FROM UNIT_USED
        WHERE ROOMID = :roomID
        AND UNITUSEDDATE LIKE :billingCycle
        ORDER BY UNITUSEDID DESC
        LIMIT 1
          `,
        {
            replacements: { roomID: roomID, billingCycle: billingCycle + '%' },
            type: db.QueryTypes.SELECT,
        }
    );
    return unit[0];
}

const createInvoice = async (req, res) => {
    const { dormID } = req.params;

    const roomList = await db.query(
        `SELECT r.ROOMID
          FROM DORMITORY d JOIN BUILDING b 
          ON d.DORMID = b.DORMID 
          JOIN ROOM r 
          ON b.BUILDINGID = r.BUILDINGID
          WHERE d.DORMID = ?
          AND r.STATUS = 0`,
        {
            replacements: [dormID],
            type: db.QueryTypes.SELECT,
        }
    );

    const todayDate = new Date().toISOString().slice(0, 10);
    const thisBillingCycle = todayDate.slice(0, 7);
    const { MAINTENANCEFEE: maintenancePrice, PARKINGFEE: parkingPrice, INTERNETFEE: internetPrice, CLEANINGFEE: cleaningPrice, OTHER: otherPrice } = await getDormSetting(dormID);

    roomList.forEach(async (rl) => {

        const isInvoice = await invoiceModel.findOne({
            attributes: ['INVOICEDATE'],
            where: {
                ROOMID: rl.ROOMID,
                INVOICEDATE: { [Op.startsWith]: thisBillingCycle }
            },
        });

        if (!isInvoice) {

            let invoiceInsertId;

            await invoiceModel.create({
                INVOICEDATE: todayDate,
                ROOMID: rl.ROOMID
            }).then(resultId => invoiceInsertId = resultId.null);

            const { MAINTENANCEFEE: maintenanceFee, PARKINGFEE: parkingFee, INTERNETFEE: internetFee, CLEANINGFEE: cleaningFee, OTHER: other } = await getListOfCost(rl.ROOMID);

            await invoiceDetailModel.create({
                PRICE: await getRoomPrice(rl.ROOMID),
                COSTID: 1,
                INVOICEID: invoiceInsertId
            });

            if (maintenanceFee == true) {
                await invoiceDetailModel.create({
                    PRICE: maintenancePrice,
                    COSTID: 4,
                    INVOICEID: invoiceInsertId
                });
            } if (parkingFee == true) {
                await invoiceDetailModel.create({
                    PRICE: parkingPrice,
                    COSTID: 5,
                    INVOICEID: invoiceInsertId
                });
            } if (internetFee == true) {
                await invoiceDetailModel.create({
                    PRICE: internetPrice,
                    COSTID: 6,
                    INVOICEID: invoiceInsertId
                });
            } if (cleaningFee == true) {
                await invoiceDetailModel.create({
                    PRICE: cleaningPrice,
                    COSTID: 7,
                    INVOICEID: invoiceInsertId
                });
            } if (other == true) {
                await invoiceDetailModel.create({
                    PRICE: otherPrice,
                    COSTID: 8,
                    INVOICEID: invoiceInsertId
                });
            }
        }
    })
    return res.status(200).send("Success");
};

const getAdminInvoiceList = async (req, res) => {
    const { dormID } = req.params;

    const roomList = await db.query(
        `SELECT i.INVOICEID AS "invoiceID" , r.ROOMNO AS "roomNo" , i.TOTALPRICE AS "totalPrice" , 
        SUBSTRING(i.INVOICEDATE,1,7) AS "billingCycle" , SUBSTRING(i.INVOICEDATE,1,4) AS "billingYear" , 
        SUBSTRING(i.INVOICEDATE,6,2) AS "billingMonth"
        FROM DORMITORY d JOIN BUILDING b 
        ON d.DORMID = b.DORMID 
        JOIN ROOM r 
        ON b.BUILDINGID = r.BUILDINGID
        JOIN INVOICE i 
        ON r.ROOMID = i.ROOMID 
        WHERE d.DORMID = ?
        ORDER BY 4 DESC , r.FLOOR , r.ROOMNO`,
        {
            replacements: [dormID],
            type: db.QueryTypes.SELECT,
        }
    );
    return res.status(200).send(roomList);
};

const getResidentInvoiceList = async (req, res) => {
    const { rentID } = req.params;

    const invoiceList = await db.query(
        `SELECT i.INVOICEID AS "invoiceID" , i.TOTALPRICE AS "totalPrice" , SUBSTRING(i.INVOICEDATE,1,7) AS "billingCycle" , 
        SUBSTRING(i.INVOICEDATE,1,4) AS "billingYear" , SUBSTRING(i.INVOICEDATE,6,2) AS "billingMonth"
        FROM INVOICE i 
        JOIN ROOM r 
        ON i.ROOMID = r.ROOMID
        JOIN RENT r2 
        ON r.ROOMID  = r2.ROOMID 
        WHERE r2.RENTID = ?`,
        {
            replacements: [rentID],
            type: db.QueryTypes.SELECT,
        }
    );
    return res.status(200).send(invoiceList);
};

const getInvoiceDetail = async (req, res) => {
    const { invoiceID, dormID } = req.params;

    const roomInvoice = await db.query(
        `SELECT r.ROOMID , r.ROOMNO , i.INVOICEDATE , i.TOTALPRICE 
        FROM INVOICE i 
        JOIN ROOM r 
        ON i.ROOMID = r.ROOMID 
        WHERE i.INVOICEID = ?`,
        {
            replacements: [invoiceID],
            type: db.QueryTypes.SELECT,
        }
    );

    const setting = await settingModel.findOne({
        attributes: ['WATERPRICE', 'ELECTRICITYPRICE', 'INVOICEDATE'],
        where: {
            DORMID: dormID
        }
    });

    let data = {
        roomNo: roomInvoice[0].ROOMNO,
        invoiceDate: String(roomInvoice[0].INVOICEDATE.slice(0, 8)) + String(setting.dataValues.INVOICEDATE),
        totalPrice: roomInvoice[0].TOTALPRICE,
        costs: []
    }

    for (let i = 1; i <= 8; i++) {

        let costID = i;
        let unit = '';
        let unitPrice = '';

        const cost = await getListOfCostInInvoiceDetail(costID, invoiceID);

        if (cost) {

            if (costID == 2) {
                unit = (await getUnitUsed(roomInvoice[0].ROOMID, roomInvoice[0].INVOICEDATE.slice(0, 8))).ELECTRICIRYUNIT;
                unitPrice = setting.dataValues.ELECTRICITYPRICE;
            }
            if (costID == 3) {
                unit = (await getUnitUsed(roomInvoice[0].ROOMID, roomInvoice[0].INVOICEDATE.slice(0, 8))).WATERUNIT;
                unitPrice = setting.dataValues.WATERPRICE;
            }

            data.costs.push({
                costName: cost.COSTNAME,
                unit: unit,
                unitPrice: unitPrice,
                amountPrice: cost.PRICE,
            });
        }
    }
    return res.status(200).send(data);
};

module.exports = { createInvoice, getAdminInvoiceList, getResidentInvoiceList, getInvoiceDetail };