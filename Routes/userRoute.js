const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router
  .route('/')
  .get(userController.GetAllUser)
  .post(userController.CreateNewUser);

router
  .route('/:id')
  .get(userController.GetOneUser)
  .patch(userController.UpdateUser)
  .delete(userController.DeleteUser);

module.exports = router;
