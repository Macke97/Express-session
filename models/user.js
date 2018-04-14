const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const fileUpload = require('express-fileupload');


let userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true //Trim removes whitespaces
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  image: String
});
//Authenticate input against database document
userSchema.statics.authenticate = function(email, password, callback) {
  User.findOne({
    email: email
  }).exec(function(error, user){
    if(error){
      return callback(error);
    } else if(!user){
      let err = new Error('No user found!');
      err.status = 401;
      return callback(err);
    } else {
      bcrypt.compare(password, user.password, function(error, result){
        if(result) {
          return callback(null, user)
        } else {
          return callback();
        }
      });
    }
  })
}


//Pre-save hook, hash the password
userSchema.pre('save', function(next){
  let user = this; // this = user object that will be saved
  bcrypt.hash(user.password, 10, function(err, hash){
    if(err){
      return next(err)
    }

    user.password = hash;
    next();

  });
});

//Create mongoose model
let User = mongoose.model('User', userSchema);

module.exports = User;
