import { verifyAccessToken } from '../utils/tokenUtils.js';
import { AppError } from '../utils/AppError.js';
import UserModel from '../models/UserModel.js';

/**
 * Protects routes — requires valid Bearer access token.
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Access token required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await UserModel.findById(decoded.userId);
    if (!user || !user.is_active) {
      throw new AppError('User not found or inactive', 401);
    }

    req.user = {
      id: user.id,
      fullName: user.full_name,
      mobileNumber: user.mobile_number,
    };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired access token', 401));
    }
    next(err);
  }
}
