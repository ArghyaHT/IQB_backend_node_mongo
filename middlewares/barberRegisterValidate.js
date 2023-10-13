const { check, validationResult } = require('express-validator');

exports.barberValidateSignUp = [
  check('email').normalizeEmail().isEmail().withMessage('Invalid email'),
    

  check('name')
  .trim()
  .notEmpty()
  .isLength({min: 3, max: 20}) 
  .withMessage('Name is required'),
  
];

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};