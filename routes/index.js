const profile = require('./profile');

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/');
}

module.exports = (app, passport) => {
  app.get('/', (req, res) => {
    res.render('index');
  });

  app.get('/signup', (req, res) => {
    res.render('signup', { message: req.flash('signupMessage') });
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

  app.get('/profile/:aid(\\d+)', isLoggedIn, async (req, res) => {
    res.render('profile', await profile.getTplObjectForProfile(req.params.aid));
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
