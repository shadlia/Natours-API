const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

/* function isValidEmail(email) {
    // Regular expression for a valid email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  } */

const UserSchema = new mongoose.Schema({
  name: {
    type: 'string',
    required: [true, 'A User must have a name'],
    maxlength: [20, 'A user name must be at less or equal to 20 characters'],
    minlength: [3, 'A user name must be at less or equal to 3 characters'],
  },

  email: {
    type: 'string',
    required: [true, 'A User must have an Email'],
    unique: [true, 'A user name must be unique Email'],
    lowercase: true,
    validate: [
      (value) => {
        return validator.isEmail(value);
      },
      'Must be a valid email',
    ],
  },
  photo: {
    type: 'string',
  },

  password: {
    type: 'string',
    required: [true, 'A User must have a Password'],
    maxlength: [
      20,
      'A user Password must be at less or equal to 20 characters',
    ],
    minlength: [8, 'A user Password must be at less or equal to 8 characters'],
  },
  passwordComfirm: {
    type: 'string',
    required: [true, 'A User must comfirm a password'],

    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords must match',
    },
  },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
