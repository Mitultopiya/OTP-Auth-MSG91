import { body, validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

/** Indian mobile: 10 digits starting with 6-9 */
const MOBILE_REGEX = /^[6-9]\d{9}$/;

export const mobileValidator = body('mobileNumber')
  .trim()
  .matches(MOBILE_REGEX)
  .withMessage('Valid 10-digit Indian mobile number is required');

export const passwordValidator = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number');

export const otpValidator = body('otp')
  .trim()
  .isLength({ min: 6, max: 6 })
  .isNumeric()
  .withMessage('OTP must be a 6-digit number');

export const fullNameValidator = body('fullName')
  .trim()
  .isLength({ min: 2, max: 150 })
  .withMessage('Full name must be between 2 and 150 characters');

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new AppError('Validation failed', 422, messages));
  }
  next();
};

export const sendOtpRules = [mobileValidator, validate];
export const verifyOtpRules = [mobileValidator, otpValidator, validate];

export const registerRules = [
  fullNameValidator,
  mobileValidator,
  passwordValidator,
  otpValidator,
  validate,
];

export const loginPasswordRules = [mobileValidator, body('password').notEmpty(), validate];

export const newPasswordValidator = body('newPassword')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number');

export const resetPasswordRules = [
  mobileValidator,
  otpValidator,
  newPasswordValidator,
  validate,
];
