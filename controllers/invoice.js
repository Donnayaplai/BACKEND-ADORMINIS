const { Op } = require("sequelize");
const db = require('../config/dbConnection');
const invoiceDetailModel = require('../models/invoiceDetail');
const invoiceModel = require('../models/invoice');
const listOfCostModel = require('../models/listOfCost');
const settingModel = require('../models/setting');
const invoiceQuery = require('../queries/invoice');
const listOfCostQuery = require('../queries/listOfCost');
const roomQuery = require('../queries/room');
const unitUsedQuery = require('../queries/unitUsed');

const getSettingInvoiceDate = async (dormID) => {
    const { INVOICEDATE: invoiceDate } = await settingModel.findOne({
        attributes: ['INVOICEDATE'],
        where: {
            DORMID: dormID
        }
    });
    return invoiceDate;
};

const getDormSetting = async (dormID) => {
    const setting = await settingModel.findOne({
        where: {
            DORMID: dormID
        }
    });
    return setting.dataValues;
};

const getListOfCost = async (roomID) => {
    const listOfCost = await listOfCostModel.findOne({
        where: {
            ROOMID: roomID
        }
    });
    return listOfCost.dataValues;
};

const getRoomPrice = async (roomID) => {
    const roomPrice = await db.query(
        roomQuery.getRoomPrice,
        {
            replacements: [roomID],
            type: db.QueryTypes.SELECT
        }
    );
    return roomPrice[0].PRICE;
};

const getListOfCostInInvoiceDetail = async (costID, invoiceID) => {
    const listOfCost = await db.query(
        listOfCostQuery.getCostPrice,
        {
            replacements: { costID: costID, invoiceID: invoiceID },
            type: db.QueryTypes.SELECT
        }
    );
    return listOfCost[0];
};

const getUnitUsed = async (roomID, billingCycle) => {
    const unit = await db.query(
        unitUsedQuery.getUnitUsed,
        {
            replacements: { roomID: roomID, billingCycle: billingCycle + '%' },
            type: db.QueryTypes.SELECT
        }
    );
    return unit[0];
}

const createInvoice = async (req, res) => {
    const { dormID } = req.params;

    const roomList = await db.query(
        roomQuery.getListOfNotAvailableRoom,
        {
            replacements: [dormID],
            type: db.QueryTypes.SELECT
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
            }
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

    await db.query(
        invoiceQuery.getAdminInvoiceList,
        {
            replacements: [dormID],
            type: db.QueryTypes.SELECT
        }
    )
        .then((data) => {
            return res.status(200).send(data);
        })
        .catch(() => {
            return res.status(400).json({ message: "มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง" });
        });
};

const getResidentInvoiceList = async (req, res) => {
    const { rentID, dormID } = req.params;

    const todayDate = new Date().toISOString().slice(0, 10);
    const day = await getSettingInvoiceDate(dormID);
    const settingDate = String(todayDate.slice(0, 8) + day);
    const thisBillingCycle = todayDate.slice(0, 7);
    const thisBillingYear = thisBillingCycle.slice(0, 4);
    const thisBillingMonth = thisBillingCycle.slice(5, 7);
    let billingCycle;
    let previousBillingCycle;

    if (thisBillingMonth == 1) {
        let year = Number(thisBillingYear) - 1
        let month = 12
        previousBillingCycle = year + '-' + month
    } else {
        let year = thisBillingYear
        let month = Number(thisBillingMonth) - 1
        if (month < 10) { month = '0' + month }
        previousBillingCycle = year + '-' + month
    }

    if (todayDate <= settingDate) {
        billingCycle = settingDate.slice(0, 7);
    } else {
        billingCycle = previousBillingCycle
    }

    await db.query(
        invoiceQuery.getResidentInvoiceList,
        {
            replacements: { rentID: rentID, billingCycle: billingCycle },
            type: db.QueryTypes.SELECT
        }
    )
        .then((data) => {
            return res.status(200).send(data);
        })
        .catch(() => {
            return res.status(400).json({ message: "มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง" });
        });
};

const getInvoiceDetail = async (req, res) => {
    const { invoiceID, dormID } = req.params;

    const roomInvoice = await db.query(
        invoiceQuery.getInvoiceDetail,
        {
            replacements: [invoiceID],
            type: db.QueryTypes.SELECT
        }
    );

    const { WATERPRICE: waterPrice, ELECTRICITYPRICE: electriciryPrice, INVOICEDATE: invoiceDate } = await settingModel.findOne({
        attributes: ['WATERPRICE', 'ELECTRICITYPRICE', 'INVOICEDATE'],
        where: {
            DORMID: dormID
        }
    });

    let invoiceDetail = {
        roomNo: roomInvoice[0].ROOMNO,
        invoiceDate: String(roomInvoice[0].INVOICEDATE.slice(0, 8)) + String(invoiceDate),
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
                unitPrice = electriciryPrice;
            }
            if (costID == 3) {
                unit = (await getUnitUsed(roomInvoice[0].ROOMID, roomInvoice[0].INVOICEDATE.slice(0, 8))).WATERUNIT;
                unitPrice = waterPrice;
            }

            invoiceDetail.costs.push({
                costName: cost.COSTNAME,
                unit: unit,
                unitPrice: unitPrice,
                amountPrice: cost.PRICE,
            });
        }
    }
    return res.status(200).send(invoiceDetail);
};

module.exports = { createInvoice, getAdminInvoiceList, getResidentInvoiceList, getInvoiceDetail };