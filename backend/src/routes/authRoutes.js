import { Router } from 'express';
import AuthController from '../controllers/authController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { otpRateLimiter } from '../middleware/rateLimitMiddleware.js';
import {
  sendOtpRules,
  verifyOtpRules,
  registerRules,
  loginPasswordRules,
  resetPasswordRules,
} from '../validators/authValidators.js';
import { body } from 'express-validator';
import { validate } from '../validators/authValidators.js';

const router = Router();

// Registration
router.post(
  '/register/send-otp',
  otpRateLimiter,
  sendOtpRules,
  asyncHandler(AuthController.sendRegisterOtp)
);
router.post('/register', registerRules, asyncHandler(AuthController.register));

// Login — password
router.post('/login/password', loginPasswordRules, asyncHandler(AuthController.loginPassword));

// Login — OTP
router.post(
  '/login/otp/send',
  otpRateLimiter,
  sendOtpRules,
  asyncHandler(AuthController.sendLoginOtp)
);
router.post('/login/otp/verify', verifyOtpRules, asyncHandler(AuthController.loginOtp));

// Forgot password
router.post(
  '/forgot-password/send-otp',
  otpRateLimiter,
  sendOtpRules,
  asyncHandler(AuthController.sendForgotPasswordOtp)
);
router.post('/forgot-password/reset', resetPasswordRules, asyncHandler(AuthController.resetPassword));

// Token management
router.post(
  '/refresh',
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  validate,
  asyncHandler(AuthController.refreshToken)
);
router.post(
  '/logout',
  body('refreshToken').optional(),
  validate,
  asyncHandler(AuthController.logout)
);

// Protected
router.get('/profile', authenticate, asyncHandler(AuthController.getProfile));

export default router;
