const { check, validationResult } = require('express-validator');

exports.validateSignUp = [
  check('email').normalizeEmail().isEmail().withMessage('Invalid email'),
  
  
  check('firstName').trim()
  .notEmpty()
  .isLength({min: 3, max: 20}) 
  .withMessage('First name is required'),
  
  
  check('lastName')
  .trim()
  .notEmpty()
  .isLength({min: 3, max: 20}) 
  .withMessage('Last name is required'),
  
  
  check('password')
  .trim()
  .notEmpty()
  .isLength({min: 8}) 
  .withMessage('Password should be minimum 8 Characters'),
  
];

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};