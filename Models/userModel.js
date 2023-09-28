const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    select: false,
  },
  passwordComfirm: {
    type: 'string',
    required: [true, 'A User must comfirm a password'],

    validate: {
      //This only works on Save and Create
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords must match',
    },
  },
  passwordChangedAt: Date,
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12); //12 is the salt
  this.passwordComfirm = undefined; // we only need it for validation so we delete this field
  next();
});
UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
