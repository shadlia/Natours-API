const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const Review = require('./../Models/reviewModel');
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const allreviews = await Review.find();
  res.status(200).json({
    status: 'success',
    results: allreviews.length,
    data: {
      allreviews: allreviews,
    },
  });
});

exports.CreateReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});
