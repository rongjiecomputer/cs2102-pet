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

  app.get('/profile', isLoggedIn, function (req, res) {
    res.send('Logged in!');
    // res.render('profile', {
    //   user: req.user // get the user out of session and pass to template
    // });
  });

  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });
};
