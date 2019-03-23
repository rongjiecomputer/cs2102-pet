const db = require('../db');

async function findUserById(id) {
  const data = await db.query('SELECT * FROM Account WHERE aid = $1', [id]);
  if (data.a) {
    
  }
}