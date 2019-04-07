const db = require('../db');

async function addPet(id, name, weight, bday, breed, mc, remarks) {
  try{
    await db.query('INSERT INTO Pet VALUES ($1, $2, $3, $4, $5, $6, $7)',  [id, name, weight, bday, breed, mc, remarks]);
    console.log("Pet insert success!");
  }
  catch (err){
    console.log(err);
  }
}


module.exports = {
  addPet
};
