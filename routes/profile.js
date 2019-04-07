const db = require('../db');

async function getTplObjectForProfile(id) {
  const data = await db.query('SELECT * FROM Account WHERE aid = $1', [id]);
  if (data.rowCount > 0) {
    return {
      displayedUser: data.rows[0]
    };
  } else {
    return {
      displayedUser: null
    };
  }
}



module.exports = {
  getTplObjectForProfile,
};
