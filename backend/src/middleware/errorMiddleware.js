import { AppError } from '../utils/AppError.js';

/**
 * Global error handler — returns consistent JSON error responses.
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  if (process.env.NODE_ENV !== 'production' && !err.isOperational) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
    ...(process.env.NODE_ENV === 'development' && !err.isOperational && { stack: err.stack }),
  });
}

/**
 * 404 handler for undefined routes.
 */
export function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}
