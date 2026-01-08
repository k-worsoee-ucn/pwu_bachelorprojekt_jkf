const { body, param, validationResult } = require('express-validator');
const { validatePasswordComplexity, getPasswordValidationError } = require('../utils/password');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Invalid input',
      details: errors.array()[0].msg
    });
  }
  next();
};

const passwordComplexityValidator = body('password')
  .custom((value) => {
    if (!validatePasswordComplexity(value)) {
      throw new Error(getPasswordValidationError());
    }
    return true;
  });

const validateUserLogin = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const validateUserRegistration = [
  body('accessCode').trim().notEmpty().escape().withMessage('Access code is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  passwordComplexityValidator,
  body('name').trim().notEmpty().escape().withMessage('Name is required'),
  handleValidationErrors
];

const validateId = [
  param('id').isInt({ min: 1 }).withMessage('Invalid ID'),
  handleValidationErrors
];

module.exports = {
  validateUserLogin,
  validateUserRegistration,
  validateId,
  passwordComplexityValidator
};