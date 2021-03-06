const db = require('../db');

async function addPet(aid, name, weight, bday, breed, mc, remarks) {
  try {
    await db.query('INSERT INTO Pet VALUES ($1, $2, $3, $4, $5, $6)', [aid, name, weight, bday, breed, remarks]);
    if (mc !== undefined) {
      for (const m of mc) {
        await db.query('INSERT INTO PetMedicalCondition VALUES ($1, $2, $3)', [aid, name, m]);
      }
    }
    console.log("Pet insert success!");
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function editPet(aid, name, weight, mc, remarks) {
  try {
    await db.query('UPDATE Pet SET weight = $1, remark = $2 WHERE aid = $3 and name = $4', [weight, remarks, aid, name]);
    await db.query('DELETE FROM PetMedicalCondition WHERE aid = $1 and name = $2', [aid, name]);
    if (mc !== undefined) {
      for (const m of mc) {
        await db.query('INSERT INTO PetMedicalCondition VALUES ($1, $2, $3)', [aid, name, m]);
      }
    }
    console.log('Edit success!');
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function deletePet(aid, name) {
  try {
    await db.query('DELETE FROM Pet WHERE aid = $1 and name = $2', [aid, name]);
    console.log('Delete success!');
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function displayPets(aid) {
  try {
    return await db.query('SELECT p.name, weight, birthday, b.name as breed, remark\n' +
      'FROM Pet p\n' +
      'INNER JOIN Breed b\n' +
      'ON p.breed = b.breed\n' +
      'WHERE aid = $1', [aid]);
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
  deletePet,
  editPet,
  displayPets,
  getPetMC
};
