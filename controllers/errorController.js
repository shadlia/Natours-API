const AppError = require('./../utils/appError');
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorPro = (err, res) => {
  // operational , trusted error : send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
    //programming error or unknown
  } else {
    //1)log error
    console.error('non operational error : ', err);
    //2)send generic error message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

const handleCasteErrorDB = (err) => {
  const message = `invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateField = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value ${value} Please use another value`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data : ${errors.join(', ')}`;
  return new AppError(message, 400);
};
const handleJsonWebTokenError = () => {
  const message = 'invalid token. please login again';
  return new AppError(message, 401);
};
const handleTokenExpiredError = () =>
  new AppError('Your token has expired! Please login again', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV.trim() === 'development') {
    //Dev
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV.trim() === 'production') {
    //PROD
    let error = { ...err };
    if (err.name === 'CastError') {
      //create an error to be handlded when its a mongo error that need to be operational
      error = handleCasteErrorDB(err);
    }
    if (err.code === 11000) {
      error = handleDuplicateField(err);
    }
    if (err.name === 'ValidationError') {
      error = handleValidationError(err);
    }
    if (err.name === 'JsonWebTokenError') {
      error = handleJsonWebTokenError(err);
    }
    if (err.name === 'TokenExpiredError') {
      error = handleTokenExpiredError(err);
    }
    sendErrorPro(error, res);
  }
};
