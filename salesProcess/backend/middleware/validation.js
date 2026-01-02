const { body, param, validationResult } = require('express-validator');

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
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number')
  .matches(/[@$!%*?&]/)
  .withMessage('Password must contain at least one special character (@$!%*?&)');

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