const profile = require('./profile');
const edit = require('./edit');
const pets = require('./pets');
const db = require('../db');


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}

class Cache {
  /**
   * Helper to get SQL tables that do not change (e.g. Region, ServiceType).
   */
  static async getRows(name) {
    if (this.cache.has(name)) return this.cache.get(name);
    const rows = (await db.query('SELECT * FROM ' + name)).rows;
    this.cache.set(name, rows);
    return rows;
  }
};
Cache.cache = new Map();
Cache.REGION = 'Region';
Cache.SERVICE_TYPE = 'ServiceType';
Cache.MEDICAL_COND = 'MedicalCondition';
Cache.BREED = 'Breed';

function checkNotEmpty(x) {
  return typeof x === 'string' && x !== '';
}

module.exports = (app, passport) => {
  app.get('/', (req, res) => {
    res.render('index');
  });

  app.get('/signup', async (req, res) => {
    const regions = await Cache.getRows(Cache.REGION);
    res.render('signup', { message: req.flash('signupMessage'), regions });
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  app.get('/login', (req, res) => {
    res.render('login', { message: req.flash('loginMessage') });
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }));

  app.get('/profile', isLoggedIn, async (req, res) => {
    const serviceTypes = await Cache.getRows(Cache.SERVICE_TYPE);
    let pets = null;
    if (req.user.isPetOwner) {
      pets = (await db.query(`SELECT * FROM Pet where Pet.aid = $1`, [req.user.aid])).rows;
    }
    res.render('profile', { displayedUser: req.user, serviceTypes, pets });
  });

  app.post('/api/requests/create', isLoggedIn, async (req, res) => {
    console.log(req.body);
    const client = await db.connect();
    try {
      const petOwner = req.user;
      if (!petOwner.isPetOwner) {
        throw Error('Current user is not a pet owner.');
      }

      const data = await client.query(
        `INSERT INTO ServiceRequest(aid, petName, serviceType, maxPrice, dateStart, dateEnd)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [petOwner.aid, req.body.petName, Number.parseInt(req.body.serviceType), Number.parseInt(req.body.maxPrice), req.body.dateStart, req.body.dateEnd]);
      if (data.rowCount == 0) {
        throw Error('Failed to create new service request');
      }
      res.status(200).send({ success: true });
    } catch (e) {
      res.status(200).send({ success: false, error: e.message });
    } finally {
      client.release();
    }
  });

  app.post('/api/service/create', isLoggedIn, async (req, res) => {
    console.log(req.body);
    const client = await db.connect();
    try {
      const careTaker = req.user;
      if (!careTaker.isCareTaker) {
        throw Error('Current user is not a care taker.');
      }
      const data = await client.query(
        `INSERT INTO Service(aid, serviceType, price, dateStart, dateEnd)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [careTaker.aid, req.body.serviceType, req.body.price, req.body.dateStart, req.body.dateEnd]);
      if (data.rowCount == 0) {
        throw Error('Failed to create new service request');
      }
      res.status(200).send({ success: true });
    } catch (e) {
      res.status(200).send({ success: false, error: e.message });
    }
  });

  // Edit Page (Start)
  app.get('/profile/edit', isLoggedIn, (req, res) => {
    res.render('edit', { message: req.flash('editProfileMessage') });
  });

  app.post('/edit/password', async (req, res) => {
    const isSame = await edit.checkPassword(req.user.aid, req.body.oldPwd, req.user.hash);
    if (isSame) {
      await edit.setPassword(req.user.aid, req.body.newPwd, req.user.hash);
      res.redirect('/profile');
    }
    else {
      console.log('Comparison fail!');
      res.redirect('/profile/edit');
    }
  });

  app.post('/edit/email', async (req, res) => {
    await edit.setEmail(req.user.aid, req.body.newEmail);
    res.redirect('/profile');
  });

  app.post('/edit/phone', async (req, res) => {
    await edit.setPhone(req.user.aid, req.body.newPhone);
    res.redirect('/profile');
  });
  // Edit Page (End)

  // Pets Page (Start)
  app.get('/profile/pets', isLoggedIn, async (req, res) => {
    const petsData = await pets.displayPets(req.user.aid);
    const breeds = await Cache.getRows(Cache.BREED);
    const mc = await Cache.getRows(Cache.MEDICAL_COND);
    const petMC = await pets.getPetMC();
    console.log('Get medical condition success!');
    res.render('pets', { displayedUser: req.user, pets: petsData, breeds, mc, petMC });
  });

  app.post('/pets/add', async (req, res) => {
    await pets.addPet(req.user.aid, req.body.petName, req.body.petWeight, req.body.petBday, req.body.petBreed,
      req.body.petMC, req.body.petRemarks);
    res.redirect('/profile/pets');
  });
  // Pets Page (End)

  app.get('/profile/:aid(\\d+)', isLoggedIn, async (req, res) => {
    res.render('profile', await profile.getTplObjectForProfile(req.params.aid));
  });

  app.get('/service', isLoggedIn, async (req, res) => {
    let query_s = "SELECT S.*, A.name FROM Service S JOIN Account A ON S.aid = A.aid";
    let next_placeholder_id = 1;
    let where_clauses = ['S.acceptedBy IS NULL'];
    let objs = [];

    if (checkNotEmpty(req.query.name)) {
      where_clauses.push(`A.name = $${next_placeholder_id++}`);
      objs.push(req.query.name);
    }

    if (checkNotEmpty(req.query.serviceType)) {
      let x = Number.parseInt(req.query.serviceType);
      if (x != -1) {
        where_clauses.push(`S.serviceType = $${next_placeholder_id++}`);
        objs.push(x);
      }
    }

    if (checkNotEmpty(req.query.priceCompare) && checkNotEmpty(req.query.price)) {
      let x = Number.parseInt(req.query.price);
      let op = '=';
      switch (req.query.priceCompare) {
        case 'eq': op = '='; break;
        case 'lt': op = '<'; break;
        case 'gt': op = '>'; break;
      }
      where_clauses.push(`S.price ${op} $${next_placeholder_id++}`);
      objs.push(x);
    }

    if (checkNotEmpty(req.query.region)) {
      let x = Number.parseInt(req.query.region);
      if (x != -1) {
        where_clauses.push(`A.region = $${next_placeholder_id++}`);
        objs.push(x);
      }
    }

    if (checkNotEmpty(req.query.dateStart)) {
      where_clauses.push(`S.dateStart <= $${next_placeholder_id++}`);
      objs.push(req.query.dateStart);
    }
    if (checkNotEmpty(req.query.dateEnd)) {
      where_clauses.push(`S.dateEnd >= $${next_placeholder_id++}`);
      objs.push(req.query.dateEnd);
    }

    if (where_clauses.length > 0) {
      query_s += ' WHERE ';
      query_s += where_clauses.join(' AND ');
    }

    if (checkNotEmpty(req.query.sort)) {
      if (req.query.sort === 'highPrice') {
        query_s += ' ORDER BY S.price DESC';
      } else {
        query_s += ' ORDER BY S.price';
      }
    }

    query_s += ' GROUP BY S.sid, S.aid, A.name, S.serviceType';

    const client = await db.connect();
    try {
      const results = (await client.query(query_s, objs)).rows;
      const regions = await Cache.getRows(Cache.REGION);
      const serviceTypes = await Cache.getRows(Cache.SERVICE_TYPE);

      res.render('service', { results, regions, serviceTypes });
    } finally {
      client.release();
    }
  });

  app.get('/api/service/request', isLoggedIn, async (req, res) => {
    try {
      const petOwner = req.user;
      const sid = Number.parseInt(req.query.sid);
      if (!petOwner.isPetOwner) {
        throw Error('Current user is not a pet owner.');
      }
      const client = await db.connect();
      const data = await client.query('UPDATE Service SET acceptedBy = $1 WHERE sid = $2 RETURNING *', [petOwner.aid, sid]);
      if (data.rowCount == 0) {
        throw Error('Invalid sid');
      }
      await client.query(`INSERT INTO PetOwnerRecords(petOwnerID, careTakerID, sid)
      VALUES ($1, $2, $3)`, [petOwner.aid, data.rows[0].aid, sid]);
      res.status(200).send({ success: true });
    } catch (e) {
      res.status(200).send({ success: false, error: e.message });
    }
  });


  app.get('/requests', isLoggedIn, async (req, res) => {
    let query_s = "SELECT S.*, A.name FROM ServiceRequest S JOIN Account A ON S.aid = A.aid";
    let next_placeholder_id = 1;
    let where_clauses = ['S.acceptedBy IS NULL'];
    let objs = [];

    if (checkNotEmpty(req.query.name)) {
      where_clauses.push(`A.name = $${next_placeholder_id++}`);
      objs.push(req.query.name);
    }

    if (checkNotEmpty(req.query.serviceType)) {
      let x = Number.parseInt(req.query.serviceType);
      if (x != -1) {
        where_clauses.push(`S.serviceType = $${next_placeholder_id++}`);
        objs.push(x);
      }
    }

    if (checkNotEmpty(req.query.priceCompare) && checkNotEmpty(req.query.price)) {
      let x = Number.parseInt(req.query.price);
      let op = '=';
      switch (req.query.priceCompare) {
        case 'eq': op = '='; break;
        case 'lt': op = '<'; break;
        case 'gt': op = '>'; break;
      }
      where_clauses.push(`S.price ${op} $${next_placeholder_id++}`);
      objs.push(x);
    }

    if (checkNotEmpty(req.query.region)) {
      let x = Number.parseInt(req.query.region);
      if (x != -1) {
        where_clauses.push(`A.region = $${next_placeholder_id++}`);
        objs.push(x);
      }
    }

    if (checkNotEmpty(req.query.dateStart)) {
      where_clauses.push(`S.dateStart <= $${next_placeholder_id++}`);
      objs.push(req.query.dateStart);
    }
    if (checkNotEmpty(req.query.dateEnd)) {
      where_clauses.push(`S.dateEnd >= $${next_placeholder_id++}`);
      objs.push(req.query.dateEnd);
    }

    if (where_clauses.length > 0) {
      query_s += ' WHERE ';
      query_s += where_clauses.join(' AND ');
    }

    if (checkNotEmpty(req.query.sort)) {
      if (req.query.sort === 'highPrice') {
        query_s += ' ORDER BY S.price DESC';
      } else {
        query_s += ' ORDER BY S.price';
      }
    }

    query_s += ' GROUP BY S.srid, S.aid, A.name, S.serviceType';

    const client = await db.connect();
    try {
      const results = (await client.query(query_s, objs)).rows;
      const regions = await Cache.getRows(Cache.REGION);
      const serviceTypes = await Cache.getRows(Cache.SERVICE_TYPE);

      res.render('requests', { results, regions, serviceTypes });
    } finally {
      client.release();
    }
  });

  app.get('/api/requests/request', isLoggedIn, async (req, res) => {
    const client = await db.connect();
    try {
      const petOwner = req.user;
      const sid = Number.parseInt(req.query.sid);
      if (!petOwner.isPetOwner) {
        throw Error('Current user is not a pet owner.');
      }

      const data = await client.query('UPDATE Service SET acceptedBy = $1 WHERE srid = $2 RETURNING *', [petOwner.aid, sid]);
      if (data.rowCount == 0) {
        throw Error('Invalid srid');
      }
      await client.query(`INSERT INTO PetOwnerRecords(petOwnerID, careTakerID, srid)
      VALUES ($1, $2, $3)`, [petOwner.aid, data.rows[0].aid, sid]);
      res.status(200).send({ success: true });
    } catch (e) {
      res.status(200).send({ success: false, error: e.message });
    } finally {
      client.release();
    }
  });

  app.get('/advertisedrequestservice', isLoggedIn, async (req, res) => {

    let query_ad = `SELECT S.*, A.name FROM Service S JOIN Account A ON S.aid = A.aid WHERE ${req.user.aid} = A.aid`;

    console.log(query_ad);

    const client = await db.connect();
    try {
      const results = (await client.query(query_ad)).rows;
      res.render('advertisedrequestservice', { results });
    } finally {
      client.release();
    }
  });

  app.get('/caretakerRecords', isLoggedIn, async (req, res) => {

    let query_ad = "SELECT A.name,ST.name as serviceName,CTR.dateAccepted " +
      "FROM CareTakerRecords CTR " +
      "JOIN Account A ON A.aid = CTR.petOwnerID " +
      "JOIN ServiceRequest SR ON SR.srid = CTR.srid " +
      "JOIN ServiceType ST ON ST.serviceType = SR.serviceType " +
      `WHERE CTR.careTakerID = ${req.user.aid}`;

    console.log(query_ad);

    const client = await db.connect();
    try {
      const results = (await client.query(query_ad)).rows;
      res.render('caretakerRecords', { results });
    } finally {
      client.release();
    }
  });

  app.get('/petownerRecords', isLoggedIn, async (req, res) => {

    let query_ad = "SELECT A.name,ST.name as serviceName,POR.dateAccepted " +
      "FROM PetOwnerRecords POR " +
      "JOIN Account A ON A.aid=POR.careTakerID " +
      "JOIN Service S ON S.sid = POR.sid " +
      "JOIN ServiceType ST ON ST.serviceType = S.serviceType " +
      `WHERE POR.petOwnerID = ${req.user.aid}`;

    console.log(query_ad);

    const client = await db.connect();
    try {
      const results = (await client.query(query_ad)).rows;
      res.render('petownerRecords', { results });
    } finally {
      client.release();
    }
  });

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  // 404 handler, must be last!
  app.use((req, res, next) => {
    return res.status(404).render('404', { url: req.url });
  });
};
