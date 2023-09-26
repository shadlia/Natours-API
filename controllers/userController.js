const fs = require('fs');
const catchAsync = require('./../utils/catchAsync');
const User = require('./../Models/userModel');

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
);
//Route Handlers
exports.GetAllUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route not yet defined',
  });
};
exports.CreateNewUser = catchAsync(async (req, res, next) => {
  const NewUser = await User.create(req.body); // its a promise we can use .then
  res.status(201).json({
    status: 'success',
    data: {
      user: NewUser,
    },
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
