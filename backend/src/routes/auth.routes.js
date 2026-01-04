const express = require('express');
const authController = require('../controllers/auth.controller');
const authValidator = require('../validators/auth.validator');

const router = express.Router();

router.post('/signup', authValidator.signupValidator, authController.signup);
router.post('/signin', authValidator.signinValidator, authController.signin);

module.exports = router;
