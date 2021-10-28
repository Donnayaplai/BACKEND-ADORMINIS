const db = require('../config/dbConnection');
const problemModel = require('../models/problem');
const rentModel = require('../models/rent');
const roomModel = require('../models/room');
const problemQuery = require('../queries/problem');

const getRoomNoByUserId = async (userID) => {
    const { ROOMID: roomId } = await rentModel.findOne({
        attributes: ['ROOMID'],
        where: {
            USERID: userID
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
    const { userID, dormID } = req.params;
    const { title, detail } = req.body;

    const todayDate = new Date().toISOString().slice(0, 10);

    const complaint = {
        TITLE: title,
        DETAIL: detail,
        INFORMEDDATE: todayDate,
        USERID: userID,
        DORMID: dormID
    };

    problemModel.create(complaint)
        .then((data) => {
            return res.status(200).send(data);
        })
        .catch((err) => {
            return res.status(400).send(err.message);
        });
};

const getComplaintDetail = async (req, res) => {
    const { problemID } = req.params;

    const { TITLE: title, DETAIL: detail, INFORMEDDATE: informDate, REVISIONDATE: revisionDate, STATUS: status, USERID: userID } = await problemModel.findOne({
        where: {
            PROBLEMID: problemID
        }
    });

    const complaintDetail = {
        problemID: problemID,
        roomNo: await getRoomNoByUserId(userID),
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
        .catch((err) => {
            return res.status(400).send(err.message);
        });
};

const getAdminComplaintList = async (req, res) => {
    const { dormID } = req.params;

    await db.query(
        problemQuery.getAdminComplaintList,
        {
            replacements: [dormID],
            type: db.QueryTypes.SELECT,
        }
    )
        .then((data) => {
            return res.status(200).send(data);
        })
        .catch((err) => {
            return res.status(400).send(err.message);
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
        .catch((err) => {
            return res.status(400).send(err.message);
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
        .catch((err) => {
            return res.status(400).send(err.message);
        });
};

module.exports = { sendComplaint, getComplaintDetail, getResidentComplaintList, getAdminComplaintList, removeComplaint, reviseComplaint };