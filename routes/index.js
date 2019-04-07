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

  app.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', { displayedUser: req.user });
  });


  app.get('/records', isLoggedIn, (req, res) => {
    console.log(req.user);
    res.render('records', { displayedUser: req.user });
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
    //res.status(200).send({ success: true , message: 'Phone edit success'});
    res.redirect('/profile');
  });
  // Edit Page (End)

  // Pets Page (Start)
  app.get('/profile/pets', isLoggedIn, async (req, res) => {
    const petsData = await pets.displayPets(req.user.aid);
    const breedData = await pets.getBreeds();
    const mcData = await pets.getMC();
    res.render('pets', { displayedUser: req.user, pets: petsData, breeds: breedData, mc: mcData});
  });

  app.post('/pets/add', async (req, res) => {
    await pets.addPet(req.user.aid, req.body.petName, req.body.petWeight,req.body.petBday, req.body.petBreed,
        req.body.petMC, req.body.petRemarks);
    res.redirect('/profile/pets');
  });
  // Pets Page (End)

  app.get('/profile/:aid(\\d+)', isLoggedIn, async (req, res) => {
    res.render('profile', await profile.getTplObjectForProfile(req.params.aid));
  });

  app.get('/service', isLoggedIn, async (req, res) => {
    function checkNotEmpty(x) {
      return typeof x === 'string' && x !== '';
    }

    let query_s = "SELECT S.*, A.name FROM Service S JOIN Account A ON S.aid = A.aid";
    let next_placeholder_id = 1;
    let where_clauses = [];
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

    query_s += ' GROUP BY S.aid, S.serviceType';

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
      console.log(req.query);
      res.status(200).send({
        success: true,
      });
    } catch(e) {

    }
  });

  app.get('/advertisedrequestservice', isLoggedIn, async (req, res) => {
    function checkNotEmpty(x) {
      return typeof x === 'string' && x !== '';
    }

    let query_ad = "SELECT S.*, A.name FROM Service S JOIN Account A ON S.aid = A.aid";

    console.log(query_ad);

    const client = await db.connect();
    try {
      const results = (await client.query(query_ad)).rows;
      res.render('advertisedrequestservice', { results });
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
