const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const session = require('express-session');
const router = require('./routes');
const auth = require('./auth/index');
const cors = require('cors');
// const authMiddleware = require('./auth/middleware');


const app = express();

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// parse application/x-www-form-urlencoded
app.use( bodyParser.urlencoded({ extended: false }) );
// parse application/json
app.use(bodyParser.json());

app.use( cookieParser('keyboard_cat') );

// initialise session middleware - flash-express depends on it
app.use(session({
   secret: "keyboard cat",
   resave: false,
   saveUninitialized: true
}));

// initialise the flash middleware
app.use(flash());

app.use(express.static('public'));

app.use(cors({
   credentials: true
}));
// console.log(authMiddleware.ensureLoggedIn)

app.use('/auth', auth);

app.use('/', router);
app.use('/days', router);
app.use('/day/:day_name', router);
app.use('/waiters', router);
app.use('/waiters/:username', router);
app.use('/day/:day_name/delete/:username', router);
app.use('/login', router);
app.use('/logout', router);
app.use('/signup', router);

app.use('/waiters/edit/:username', router);

//Define error-handling middleware functions
app.use(function (err, req, res, next) {
   res.status(500);
   res.render('error', { error: err });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
   console.log(`App started at http://localhost:${PORT}`);
});