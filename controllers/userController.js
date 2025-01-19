const fs = require('fs');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../Models/userModel');
const AppError = require('./../utils/appError');

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
);

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
//Route Handlers
exports.GetAllUser = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'sucess',
    data: {
      users: users,
    },
  });
});
exports.CreateNewUser = catchAsync(async (req, res, next) => {
  const NewUser = await User.create(req.body); // its a promise we can use .then
  res.status(201).json({
    status: 'success',
    data: {
      user: NewUser,
    },
  });
});
exports.UpdateMe = catchAsync(async (req, res, next) => {
  //1-Create Error if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('You can update password from /auth/updatePassword!', 400)
    );
  }
  //2-if not update the user data/document
  const filteredBody = filterObj(req.body, 'name', 'email');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
exports.DeleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.GetOneUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route not yet defined',
  });
};

//Update user
exports.UpdateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route not yet defined',
  });
};
//Delete
exports.DeleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route not yet defined',
  });
};
