const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const db = require('../db');

function validatePassword(user, password) {
  return bcrypt.compareSync(password, user.hash);
}

function generateHash(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

module.exports = passport => {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser((user, done) => done(null, user.aid));

  // used to deserialize the user
  passport.deserializeUser(async (id, done) => {
    const data = await db.query('SELECT * FROM Account WHERE aid = $1', [id]);
    done(null, data.rows[0]);
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'
  passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  }, async (req, email, password, done) => {
    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    const client = await db.connect();
    try {
      const data = await client.query('SELECT * FROM Account WHERE email = $1', [email]);
      if (data.rowCount > 0) {
        return done(null, false, req.flash('signupMessage', 'The email has already taken.'));
      }

      const hash = generateHash(password);
      const newData = await client.query(`INSERT INTO Account (name, username, email, hash, phone)
        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.body.name, req.body.username, email, hash, req.body.phone]);

      return done(null, newData.rows[0]);
    } catch (e) {
      return done(e);
    } finally {
      client.release();
    }
  }));

  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, async (req, email, password, done) => {
    // find a user whose email is the same as the forms email
    // we are checking to see if the user trying to login already exists
    const client = await db.connect();
    try {
      const data = await client.query('SELECT * FROM Account WHERE email = $1', [email]);
      if (data.rowCount < 1) {
        return done(null, false, req.flash('loginMessage', 'No user found.'));
      }

      const user = data.rows[0];
      if (!validatePassword(user, password))
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

      return done(null, user);
    } catch (e) {
      return done(e);
    } finally {
      client.release();
    }
  }));
}
