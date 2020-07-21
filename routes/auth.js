const express = require('express');

const authController = require('../controllers/auth');
const validator = require('../util/validation');
const midWare = require('../util/middleware');

const router = express.Router();

router.post('/login', validator.logInVal, authController.postLogIn);

router.get('/login', midWare.checkDataCookie, authController.getLogIn);

router.get('/signup', midWare.checkDataCookie, authController.getSignUp);

router.post('/signup', validator.signUpVal, authController.postSignUp);

router.post('/logout', authController.postLogOut);

router.get('/forgotPassword', authController.getForgotPass);

router.get('/passwordReset/:token', authController.getResetPass);

router.post('/resetPassword', authController.postResetPass);

router.post('/changePassword', authController.postChangePass);

router.post('/newAdmin', midWare.auth, validator.newAdminVal, authController.postNewAdmin);

router.post('/newRemoveAdmin', midWare.auth, validator.newAdminVal, authController.postRemoveAdmin);

module.exports = router;