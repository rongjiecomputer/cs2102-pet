const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const path = require('path');

const app = express();

// Set ejs as template engine.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'secret', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

const configurePassport = require("./config/passport");
configurePassport(passport);

const mountRoutes = require("./routes");
mountRoutes(app, passport);

const port = Number.parseInt(process.env.SERVER_PORT);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
