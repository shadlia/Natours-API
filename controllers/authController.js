const { promisify } = require('util');
const User = require('./../Models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const errorController = require('./errorController');
const { formatUser } = require('../utils/userFormatter');
const AppError = require('./../utils/appError');
const { request } = require('http');

const signToken = (id) => {
  const payload = { id: id };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordComfirm: req.body.passwordComfirm,
  }); //user.save

  //PAYLOAD : ID

  const token = signToken(newUser._id);

  res.status(201).json({
    success: true,
    token,
    data: {
      user: formatUser(newUser),
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1- check if the fileds are filled
  if (!email || !password) {
    return next(new AppError('please provide email and password', 400));
  }
  //2- check if the user exist and the password and email match
  const user = await User.findOne({ email: email }).select('+password'); // we have password select false

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //3- send sucess response

  const token = signToken(user._id);
  res.status(201).json({
    success: true,
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1- Get the token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in ! Please login to get access', 401)
    );
  }
  //2- validate the token (verification)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3- check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('The user no longer exists', 401));
  }
  //4- check if the user changed password after the jwt was issued
  //decoded.iat is the date when the token was issued
  console.log(freshUser.changedPasswordAfter(decoded.iat));
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'Password has been recently changed! Please log in again',
        401
      )
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  request.user = freshUser;

  next();
});
