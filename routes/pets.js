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

async function displayPets(id) {
  try {
    const data = await db.query('SELECT p.name, weight, birthday, b.name as breed, mc.name as medicalcondition, remark\n' +
        'FROM Pet p\n' +
        'INNER JOIN Breed b\n' +
        'ON p.breed = b.breed\n' +
        'INNER JOIN medicalcondition mc\n' +
        'ON p.medicalcondition = mc.medicalcondition\n' +
        'WHERE aid = $1', [id]);
    console.log('Pets select success!');
    return data;
  } catch (err) {
    console.log(err);
  }
}

async function getBreeds() {
  try {
    return await db.query('SELECT name FROM Breed');
  } catch (err) {
    console.log(err);
  }
}

async function getMC() {
  try {
    return await db.query('SELECT name FROM MedicalCondition');
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  addPet,
  displayPets,
  getBreeds,
  getMC
};
