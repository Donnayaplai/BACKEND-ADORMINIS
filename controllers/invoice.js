const { Op } = require("sequelize");
const invoiceModel = require('../models/invoice');
const invoiceDetailModel = require('../models/invoiceDetail');
const settingModel = require('../models/setting');
const listOfCostModel = require('../models/listOfCost');
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

module.exports = { createInvoice };