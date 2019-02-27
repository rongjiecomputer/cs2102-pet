const home = require('./home');
const register = require('./register');

module.exports = (app) => {
  app.use('/', home);
  app.use('/register', register);
};
