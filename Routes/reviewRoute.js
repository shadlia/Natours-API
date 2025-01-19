const express = require('express');
const reviewController = require('./../controllers/reviewController');
const router = express.Router();
const authController = require('./../controllers/authController');

router
  .route('/')
  .get(authController.protect, reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.CreateReview
  );

module.exports = router;
