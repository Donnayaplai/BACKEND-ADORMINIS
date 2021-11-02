const db = require('../config/dbConnection');
const roomQuery = require('../queries/room');
const problemQuery = require('../queries/problem');

const getDashboardData = async (req, res) => {
    const { dormID } = req.params;

    const room = await db.query(
        roomQuery.countAllRoom,
        {
            replacements: [dormID],
            type: db.QueryTypes.SELECT
        }
    );
    const availableRoom = await db.query(
        roomQuery.countAvailableRoom,
        {
            replacements: [dormID],
            type: db.QueryTypes.SELECT
        }
    );
    const notAvailableRoom = await db.query(
        roomQuery.countNotAvailableRoom,
        {
            replacements: [dormID],
            type: db.QueryTypes.SELECT
        }
    );
    const resident = await db.query(
        roomQuery.countResident,
        {
            replacements: [dormID],
            type: db.QueryTypes.SELECT
        }
    );
    const complaint = await db.query(
        problemQuery.countComplaint,
        {
            replacements: [dormID],
            type: db.QueryTypes.SELECT
        }
    );

    const data = {
        room: room[0].room,
        availableRoom: availableRoom[0].availableRoom,
        notAvailableRoom: notAvailableRoom[0].notAvailableRoom,
        resident: resident[0].resident,
        complaint: complaint[0].complaint
    };

    return res.status(200).send(data);
};

module.exports = { getDashboardData };