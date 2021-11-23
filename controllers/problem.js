const db = require('../config/dbConnection');
const problemModel = require('../models/problem');
const rentModel = require('../models/rent');
const roomModel = require('../models/room');
const problemQuery = require('../queries/problem');

const getRoomNoByRentId = async (rentID) => {
    const { ROOMID: roomId } = await rentModel.findOne({
        attributes: ['ROOMID'],
        where: {
            RENTID: rentID
        }
    });

    const { ROOMNO: roomNo } = await roomModel.findOne({
        attributes: ['ROOMNO'],
        where: {
            ROOMID: roomId
        }
    });

    return roomNo;
};

const sendComplaint = async (req, res) => {
    const { rentID, dormID } = req.params;
    const { title, detail } = req.body;

    const todayDate = new Date().toISOString().slice(0, 10);

    const complaint = {
        TITLE: title,
        DETAIL: detail,
        INFORMEDDATE: todayDate,
        RENTID: rentID,
        DORMID: dormID
    };

    problemModel.create(complaint)
        .then((data) => {
            return res.status(200).send(data);
        })
        .catch(() => {
            return res.status(400).json({ message: "มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง" });
        });
};

const getComplaintDetail = async (req, res) => {
    const { problemID } = req.params;

    const { TITLE: title, DETAIL: detail, INFORMEDDATE: informDate, REVISIONDATE: revisionDate, STATUS: status, RENTID: rentID } = await problemModel.findOne({
        where: {
            PROBLEMID: problemID
        }
    });

    const complaintDetail = {
        problemID: problemID,
        roomNo: await getRoomNoByRentId(rentID),
        title: title,
        detail: detail,
        informDate: informDate,
        revisionDate: revisionDate,
        status: status,
    };

    return res.status(200).send(complaintDetail)
};

const getResidentComplaintList = async (req, res) => {
    const { rentID } = req.params;

    await db.query(
        problemQuery.getResidentComplaintList,
        {
            replacements: [rentID],
            type: db.QueryTypes.SELECT,
        }
    )
        .then((data) => {
            return res.status(200).send(data);
        })
        .catch(() => {
            return res.status(400).json({ message: "มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง" });
        });
};

const getAdminComplaintList = async (req, res) => {
    const { dormID } = req.params;

    const complaintList = await db.query(
        problemQuery.getAdminComplaintList,
        {
            replacements: [dormID],
            type: db.QueryTypes.SELECT,
        }
    );

    let adminComplaintList = [];

    complaintList.forEach(async (cl) => {
        adminComplaintList.push({
            PROBLEMID: cl.PROBLEMID,
            ROOMNO: await getRoomNoByRentId(cl.RENTID),
            TITLE: cl.TITLE,
            INFORMEDDATE: cl.INFORMEDDATE,
            STATUS: cl.STATUS
        });

        if (adminComplaintList.length == complaintList.length) {
            function compare(a, b) {
                if (a.INFORMEDDATE < b.INFORMEDDATE) {
                    return 1;
                }
                if (a.INFORMEDDATE > b.INFORMEDDATE) {
                    return -1;
                }
                if (a.PROBLEMID < b.PROBLEMID) {
                    return 1;
                }
                if (a.PROBLEMID > b.PROBLEMID) {
                    return -1;
                }
                return 0;
            }
            adminComplaintList.sort(compare)
            return res.status(200).send(adminComplaintList);
        }
    });
};

const removeComplaint = async (req, res) => {
    const { problemID } = req.params;

    await problemModel.destroy({
        where: {
            PROBLEMID: problemID
        }
    })
        .then((data) => {
            return res.status(200).send(String(data + " row deleted"));
        })
        .catch(() => {
            return res.status(400).json({ message: "มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง" });
        });
};

const reviseComplaint = async (req, res) => {
    const { problemID } = req.params;

    await problemModel.update({
        REVISIONDATE: new Date().toISOString().slice(0, 10),
        STATUS: 1
    }, {
        where: {
            PROBLEMID: problemID
        }
    })
        .then((data) => {
            return res.status(200).send(String(data + " row updated"));
        })
        .catch(() => {
            return res.status(400).json({ message: "มีข้อผิดพลาดเกิดขึ้น กรุณาลองใหม่อีกครั้ง" });
        });
};

module.exports = { sendComplaint, getComplaintDetail, getResidentComplaintList, getAdminComplaintList, removeComplaint, reviseComplaint };