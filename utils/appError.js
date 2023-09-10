class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // it means the erros we can predict not the bugs of the code
    Error.captureStackTrace(this, this.constructor); // just to do not make this appear as an error
  }
}

module.exports = AppError;
