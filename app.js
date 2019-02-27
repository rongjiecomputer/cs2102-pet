const express = require('express');
const app = express();
const path = require('path');
const passport = require('passport');

// Set ejs as template engine.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.cookieParser());
// app.use(bodyParser());
// app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

const mountRoutes = require("./routes");
mountRoutes(app);

const port = Number.parseInt(process.env.SERVER_PORT);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
