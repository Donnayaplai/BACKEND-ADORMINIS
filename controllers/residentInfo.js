const db = require('../config/dbConnection');
const residentInfoQuery = require('../queries/residentInfo');
const userQuery = require('../queries/user');

const getResidentInfo = async (req, res) => {
  const { roomID } = req.params;

  await db.query(
    userQuery.getResidentInfo,
    {
      replacements: [roomID],
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

const getResidentRoomDorm = async (req, res) => {
  const { rentID } = req.params;

  const {
    DORMNAMETH: dormNameTH,
    DORMNAMEENG: dormNameENG,
    ADDRESS: address,
    PROVINCE: province,
    STREET: street,
    POSTCODE: postcode,
    TELNO: telNo,
    SUBDISTRICT: subdistrict,
    DISTRICT: district,
    ROOMNO: roomNo,
    FLOOR: floor,
    BUILDINGNAME: buildingName,
    STARTDATE: startDate,
    ENDDATE: endDate,
    CHECKINDATE: checkInDate
  } = (await db.query(
    residentInfoQuery.getResidentRoomDorm,
    {
      replacements: [rentID],
      type: db.QueryTypes.SELECT
    }
  ))[0];

  const subStartDate = [
    startDate.slice(5, 7),  // MM
    startDate.slice(8, 10), // DD
    startDate.slice(0, 4)   // YYYY
  ]

  const subEndDate = [
    endDate.slice(5, 7),  // MM
    endDate.slice(8, 10), // DD
    endDate.slice(0, 4)   // YYYY
  ]

  const date1 = new Date(subStartDate.join('/'));
  const date2 = new Date(subEndDate.join('/'));
  const rentDurationYear = parseInt((date2 - date1) / (1000 * 60 * 60 * 24 * 7 * 52));
  const rentDurationMonth = parseInt((date2 - date1) / (1000 * 60 * 60 * 24 * 30)) - (rentDurationYear * 12);

  return res.status(200).send({ dormNameTH, dormNameENG, address, province, street, postcode, telNo, subdistrict, district, roomNo, floor, buildingName, startDate, endDate, rentDurationYear, rentDurationMonth, checkInDate })
};

module.exports = { getResidentInfo, getResidentRoomDorm };