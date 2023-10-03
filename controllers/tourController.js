const { query } = require('express');
const Tour = require('./../Models/tourModel');
const AppError = require('./../utils/appError');

const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.reqTime = (req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
};

//Route Handlers
exports.GetAllTours = catchAsync(async (req, res, next) => {
  console.log('request time: ' + req.requestTime);
  const feautures = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitField()
    .paginate();

  const tours = await feautures.query;
  /*if (tours.length == 0) {
    return next(new AppError(`No tours found `, 404));
  }*/
  //Send response
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});
exports.GetOneTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const tour = await Tour.findById(req.params.id);
  //const tour=Tour.findOne({ _id: req.params.id})
  if (!tour) {
    return next(new AppError(`No tour found with that ID`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.CreateNewTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body); // its a promise we can use .then
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

//Update tour
exports.UpdateTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const updatedtour = await Tour.findByIdAndUpdate(id, req.body, {
    new: true, //to retun the new tour
  }); // query objects
  if (!updatedtour) {
    return next(new AppError(`No tour found with that ID`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tours: updatedtour,
    },
  });
});
//Delete
exports.DeleteTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  const deletedTour = await Tour.findByIdAndDelete(req.params.id);

  if (!deletedTour) {
    return next(new AppError(`No tour found with that ID`, 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1, //1 for ascending
      },
    },
    /* {
        $match: {
          _id: { $ne: 'EASY' }, //id is the difficulty here 
        },
      }, */
  ]);
  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});
//get the busiest month in a given year
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2021
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, // we give the id to group by is the month of the startDates
        numToursStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0, // we used it to remove the id from output
      },
    },
    {
      $sort: {
        numToursStarts: -1,
      },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: { plan },
  });
});
