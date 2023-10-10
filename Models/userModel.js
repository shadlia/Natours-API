const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/* function isValidEmail(email) {
    // Regular expression for a valid email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  } */

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordComfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExipres: String,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  loginAttempts: { type: Number, select: false },
  lastLoginAttempt: { type: Number, select: false },
  isEmailConfirmed: {
    type: Boolean,
    default: false,
    select: false,
  },
  ConfirmEmailToken: String,
  ConfirmEmailExipres: String,
});
//Query middlewares

UserSchema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
  next();
});
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12); //12 is the salt
  this.passwordComfirm = undefined; // we only need it for validation so we delete this field
  next();
});
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; // just to avoid of the token created before changing the database
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
UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  // we need to crypt the token before saving it in the database
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  /*   console.log({ resetToken }, this.passwordResetToken);
   */ this.passwordResetExipres = Date.now() + 10 * 60 * 1000; //10 mins
  return resetToken;
};

UserSchema.methods.createConfirmEmailToken = function () {
  const ConfirmToken = crypto.randomBytes(32).toString('hex');
  // we need to crypt the token before saving it in the database
  this.ConfirmEmailToken = crypto
    .createHash('sha256')
    .update(ConfirmToken)
    .digest('hex');
  this.ConfirmEmailExipres = Date.now() + 10 * 60 * 1000; //10 mins
  return ConfirmToken;
};
UserSchema.methods.ReachedMaxLoginAttempts = function () {
  const MAX_LOGIN_ATTEMPTS = 10;
  const WAIT_TIME_HOURS = 1;

  if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
    const lastLoginAttempt = this.lastLoginAttempt;
    const currentTime = new Date().getTime();
    const timeSinceLastAttempt = currentTime - lastLoginAttempt;

    if (timeSinceLastAttempt < WAIT_TIME_HOURS * 3600000) {
      return true;
    }
    // other tries
    this.loginAttempts = 0;
    return false;
  }
  return false;
};
const User = mongoose.model('User', UserSchema);

module.exports = User;
