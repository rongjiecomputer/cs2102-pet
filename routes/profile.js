const db = require('../db');

async function getTplObjectForProfile(id) {
  const data = await db.query('SELECT * FROM Account WHERE aid = $1', [id]);
  if (data.rowCount > 0) {
    const user = data.rows[0]
    user.isPetOwner = (await client.query('SELECT 1 FROM PetOwner WHERE aid = $1', [id])).rowCount > 0;
    user.isCareTaker = (await client.query('SELECT 1 FROM CareTaker WHERE aid = $1', [id])).rowCount > 0;
    return { displayedUser: user };
  } else {
    return { displayedUser: null };
  }
}

module.exports = {
  getTplObjectForProfile,
};
