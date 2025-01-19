const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./Routes/tourRoute');
const userRouter = require('./Routes/userRoute');
const reviewRouter = require('./Routes/reviewRoute');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

//1)Global Middlwares (optional)
if (process.env.NODE_ENV.trim() == 'development') {
  // there is space after development	 we can use process.env.NODE_ENV.trim()
  app.use(morgan('dev')); //logger ! middleware to give us infors about the HTTP request/response
}

app.use(helmet()); //secrity http headers
const limiter = rateLimit({
  max: 100, // number of requests per hour for one ip
  windowMs: 60 * 60 * 1000, // one hour ==> number of requests per hour
  message: 'too many requests from this IP , please try again in an hour',
});

app.use('/api', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//Data santization against noSQL query injection
app.use(mongoSanitize());

//Data santization againt XSS
app.use(xss()); // clean html injection
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
); // prevent paramtere pullution
// middleware to read the req body
//html file : static files
app.use(express.static(`${__dirname}/public`));

// 2) Mounting Routes : connect the Routers to the main app

app.use('/api/v1/tours', tourRouter); // middleware
app.use('/api/v1/users', userRouter); // middleware
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 404));
});

//global error handling middleware : 4 arguments so express knows its the error handling middelware
//(Last middleware to use)
app.use(globalErrorHandler);
module.exports = app;
