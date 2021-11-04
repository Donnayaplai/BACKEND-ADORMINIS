const db = require('../config/dbConnection');
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

module.exports = { getResidentInfo };