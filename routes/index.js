var express = require('express');
const fs = require('fs');
const app = express();
var router = express.Router();
let User = require('../models/user');
let mid = require('../middleware');
const fileUpload = require('express-fileupload');



//GET logout route
router.get('/logout', (req, res, next) => {
  if(req.session.userId){
    req.session.destroy((err) => next(err));
    return res.redirect('/');
  } else {
    res.redirect('/login');
  }

});


//GET profile
router.get('/profile', mid.requiresLogin, (req, res, next) => {

  //Get user's info to show on profile page
  User.findOne({
    _id: req.session.userId
  }).exec(async function(error, user){
    if(error){
      return next(error);
    } else {
      let userImage = '';
      if(fs.existsSync(`./public/images/${user._id}.png`)){
        userImage = `/images/${user._id}.png`;
      } else {
        userImage = '/images/avatar.png';
      }
      console.log('User image is', userImage);
      return res.render('profile', {
        title: 'Profile',
        name: user.name.split(' ')[0],
        userImage: userImage,
        fullName: user.name,
        user: user
      });
    }
  });
});


//GET login form
router.get('/login', mid.loggedOut, (req, res, next) => {
  return res.render('login', {title: 'Login'});
});

//POST Login
router.post('/login', (req, res, next) => {
  if(req.body.email && req.body.password){
    //Authenticate function defined in user model
    User.authenticate(req.body.email, req.body.password, function(error, user){
      if(error || !user){
        let err = new Error('Wrong email or password');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else{
    let err = new Error('Email and password required');
    err.status = 401;
    next(err);
  }
});

//GET /register
router.get('/register', mid.loggedOut, function(req, res, next){
  return res.render('register', {title: 'Register'});
});

//POST /register
router.post('/register', (req, res, next) =>{
  if(req.body.email && req.body.name && req.body.password){

    //Matching passwords
    if(req.body.password !== req.body.confirmPassword){
      let err = new Error('Passwords do not match.');
      err.status = 400;
      return next(err);
    }

    //Crete object with form input
    const userData = {
      email: req.body.email,
      name: req.body.name,
      password: req.body.password
    }

    let pic = req.files.file;
    console.log(req.files.file)

    //Insert object to mongodb
    //This is connected to the model's hashing method. The next() will continue this.
    User.create(userData, async (error, user) => {
      if(error){
        return next(error);
      } else {
        req.session.userId = user._id;

        //Move profile pic to correct folder if exists
        pic.mv(`./public/images/${user._id}.png`, function(error) {
          if(error) {
            console.log(error);
          } else {
            console.log('File saved!');
          }
        });
        
        return res.redirect('/profile');
      }
    });

  } else {
    let err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

// GET /
router.get('/', function(req, res, next) {
  console.log('Session ID', req.session.id);
  return res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', function(req, res, next) {
  return res.render('contact', { title: 'Contact' });
});

module.exports = router;
