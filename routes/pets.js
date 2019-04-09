const db = require('../db');

async function addPet(id, name, weight, bday, breed, mc, remarks) {
  try{
    await db.query('INSERT INTO Pet VALUES ($1, $2, $3, $4, $5, $6)',  [id, name, weight, bday, breed, remarks]);
    let index = 0;
    while(mc[index]){
      await db.query('INSERT INTO PetMedicalCondition VALUES ($1, $2, $3)',  [id, name, mc[index]]);
      index++;
    }

    console.log("Pet insert success!");
  }
  catch (err){
    console.log(err);
  }
}

async function displayPets(id) {
  try {
    return await db.query('SELECT p.name, weight, birthday, b.name as breed, remark\n' +
        'FROM Pet p\n' +
        'INNER JOIN Breed b\n' +
        'ON p.breed = b.breed\n' +
        'WHERE aid = $1', [id]);
  } catch (err) {
    console.log(err);
  }
}

async function getPetMC() {
  try {
    return await db.query('SELECT p.name, mc.name as medicalcondition\n' +
        'FROM Pet p\n' +
        'INNER JOIN Breed b\n' +
        'ON p.breed = b.breed\n' +
        'full outer JOIN petmedicalcondition pmc\n' +
        'ON p.aid = pmc.aid\n' +
        'and p.name = pmc.name\n' +
        'inner join medicalcondition mc\n' +
        'on mc.medicalcondition = pmc.medicalcondition');
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  addPet,
  displayPets,
  getPetMC
};
