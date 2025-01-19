const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/Confirmemail/:token', authController.confirmEmail);
router.patch('/updateMe', authController.protect, userController.UpdateMe);
router.delete('/deleteMe', authController.protect, userController.DeleteMe);

router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);

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
