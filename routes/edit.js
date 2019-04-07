const db = require('../db');
const bcrypt = require('bcrypt');

async function setEmail(id, email) {
  try{
    await db.query('UPDATE Account SET email = $1 WHERE aid = $2',  [email, id]);
    console.log("Email update success!");
  }
  catch (err){
    console.log(err);
  }
}

async function setPhone(id, phone) {
  try{
    await db.query('UPDATE Account SET phone = $1 WHERE aid = $2',  [phone, id]);
    console.log('Phone update success!');
  }
  catch (err){
    console.log(err);
  }
}

async function checkPassword(id, password, hash) {
  try{
    return await bcrypt.compareSync(password, hash);
    console.log('Comparison success!')
  }
  catch (err){
    console.log(err);
  }
}

async function setPassword(id, password) {
  try{
    const newHash = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    await db.query('UPDATE Account SET hash = $1 WHERE aid = $2',  [newHash, id]);
    console.log('Password update success!');
  }
  catch (err){
    console.log(err);
  }
}

module.exports = {
  setEmail,
  setPhone,
  checkPassword,
  setPassword
};
