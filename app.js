const express = require('express');

const app = express();
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./Routes/tourRoute');
const userRouter = require('./Routes/userRoute');

//1)Middlwares (optional)
if (process.env.NODE_ENV.trim() == 'development') {
  // there is space after development	 we can use process.env.NODE_ENV.trim()
  app.use(morgan('dev')); //logger ! middleware to give us infors about the HTTP request/response
}

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// middleware to read the req body
//html file : static files
app.use(express.static(`${__dirname}/public`));

// 2) Mounting Routes : connect the Routers to the main app
app.use('/api/v1/tours', tourRouter); // middleware
app.use('/api/v1/users', userRouter); // middleware

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

//global error handling middleware : 4 arguments so express knows its the error handling middelware
//(Last middleware to use)
app.use(globalErrorHandler);
module.exports = app;
