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
    .catch((err) => {
      return res.status(400).send(err.message);
    });
};

module.exports = { getResidentInfo };