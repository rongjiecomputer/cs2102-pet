const db = require('../db');

async function setEmail(id, email) {
  try{
    await db.query('UPDATE Account SET email = $1 WHERE aid = $2',  [email, id]);
    console.log("Query success");
  }
  catch (err){
    console.log(err);
  }
}

async function setPhone(id, phone) {
  try{
    await db.query('UPDATE Account SET phone = $1 WHERE aid = $2',  [phone, id]);
    console.log("Query success");
  }
  catch (err){
    console.log(err);
  }
}

module.exports = {
  setEmail,
  setPhone
};
