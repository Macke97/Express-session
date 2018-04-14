const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const fileUpload = require('express-fileupload');

//MongoDB connection
mongoose.connect('mongodb://localhost/bookworm');

const db = mongoose.connection;
//error handler
db.on('error', console.error.bind(console, 'connection error'));
//If MongoDB connection succeeds
db.once('open', ()=> console.log('DB connected!'));


app.use(morgan('dev'));

//Use session
app.use(session({
  secret: 'Hejsan svejsan',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db //Tell express to save session in mongo via mongoose
  })
}));


//make user ID available in templates
app.use(function(req, res, next){
  res.locals.currentUser = req.session.userId;
  next();
});

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');



// include routes
const routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', { //PUG view
    message: err.message, //Message to show in error.pug
    error: {}
  });
});

// listen on port 3000
app.listen(3000, function () {
  console.log('Express app listening on port 3000');
});
