const db = require('../config/dbConnection');
const historyQuery = require('../queries/history');

const getHistory = async (req, res) => {
  let { dormID, input } = req.params;

  let history;

  if (Number(input.replace('/', '')) || Number(input.replace('-', ''))) {
    history = await db.query(historyQuery.searchByRoomNo, {
      replacements: { dormID: dormID, input: input },
      type: db.QueryTypes.SELECT,
    });

    if (history.length == 0) {
      input = String('%' + input + '%');

      history = await db.query(historyQuery.searchByTelNo, {
        replacements: { dormID: dormID, input: input },
        type: db.QueryTypes.SELECT,
      });

      if (history.length == 0) {
        history = await db.query(historyQuery.searchByIdCardNo, {
          replacements: { dormID: dormID, input: input },
          type: db.QueryTypes.SELECT,
        });
      }
    }
  } else {
    input = String('%' + input + '%');

    history = await db.query(historyQuery.searchByName, {
      replacements: { dormID: dormID, input: input },
      type: db.QueryTypes.SELECT,
    });
  }

  return res.status(200).send(history);
};

module.exports = { getHistory };
