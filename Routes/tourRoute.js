const express = require('express');

const tourController = require('./../controllers/tourController');

const router = express.Router();

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

//in case we need the request time
router.use(tourController.reqTime)

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.GetAllTours);

router
  .route('/')
  .get(tourController.GetAllTours)
  .post(tourController.CreateNewTour);

router
  .route('/:id')
  .get(tourController.GetOneTour)
  .patch(tourController.UpdateTour)
  .delete(tourController.DeleteTour);

module.exports = router;
