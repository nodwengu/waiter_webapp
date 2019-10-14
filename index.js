const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session');
const router = require('./routes');

const app = express();

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// initialise session middleware - flash-express depends on it
app.use(session({
   secret: "<add a secret string here>",
   resave: false,
   saveUninitialized: true
}));

// initialise the flash middleware
app.use(flash());

app.use(express.static('public'));

app.use('/', router);
app.use('/day/:day_name', router);
app.use('/waiters', router);
app.use('/waiters/:username', router);
app.use('/day/:day_name/delete/:username', router);

//Define error-handling middleware functions
app.use(function (err, req, res, next) {
   res.status(500);
   res.render('error', { error: err });
})

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
   console.log(`App started at http://localhost:${PORT}`);
})