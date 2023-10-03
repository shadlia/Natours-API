const { promisify } = require('util');
const User = require('./../Models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const errorController = require('./errorController');
const { formatUser } = require('../utils/userFormatter');
const AppError = require('./../utils/appError');
const { request } = require('http');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  const payload = { id: id };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordComfirm: req.body.passwordComfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
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
  createSendToken(user, 200, res);
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
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user no longer exists', 401));
  }
  //4- check if the user changed password after the jwt was issued

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    //decoded.iat is the date when the token was issued
    return next(
      new AppError(
        'Password has been recently changed! Please log in again',
        401
      )
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE

  req.user = currentUser;

  next();
});
exports.restrictTo = (...roles) => {
  return (res, req, next) => {
    const currentUser = res.user;

    if (!roles.includes(currentUser.role)) {
      return next(
        new AppError('you do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1- Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('User doesnt exist', 404));
  }

  //2- Generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // so we dont need to put all information as save new user
  //3- Send it to the user
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with the new password and passwordwordConfirm to:${resetURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password Reset Token (valid for 10 mins)',
      message,
    });
    res.status(201).json({
      success: true,
      message: 'Token sent to email!Secret ;) ;)',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExipres = undefined;
    await user.save({ validateBeforeSave: false });
    console.error(err);
    return next(
      new AppError('There was an error sending the email,try again Later', 500)
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1- get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExipres: { $gt: Date.now() },
  });
  //2- if token is not expired and there is user then set new  password

  if (!user) {
    return next(new AppError('User doesnt exist', 404));
  }
  user.password = req.body.password;
  user.passwordComfirm = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExipres = undefined;
  await user.save();
  //-3 update changePassowrd at property for the user
  //4- Log the user in send JWT

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { CurrentPassword, NewPassword, NewPasswordConfirm } = req.body;
  //1- Get user from collection
  const userID = req.user._id;
  const user = await User.findOne({ _id: userID }).select('+password'); // we have password select false

  //2-Check if the POSTED current password is correct

  const isCorrect = await user.correctPassword(CurrentPassword, user.password);
  if (!isCorrect) {
    return next(new AppError('Your Current password is wrong!', 401));
  }
  if (!NewPassword) {
    return next(new AppError('fill your new password', 400));
  }
  //3- update password

  user.password = NewPassword;
  user.passwordComfirm = NewPasswordConfirm;
  await user.save();
  //4-login user in , send Jwt
  createSendToken(user, 200, res);
});
