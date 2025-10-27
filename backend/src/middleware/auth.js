import { extractTokenFromHeader, verifyToken } from '../utils/jwt.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches userId to request
 */
export function authenticate(req, res, next) {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. No token provided.'
      });
    }

    // Verify token
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }

    // Attach user ID to request for use in controllers
    req.userId = decoded.userId;

    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Authentication token has expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }

    // Pass other errors to error handler
    next(error);
  }
}

/**
 * Optional authentication middleware
 * Attaches userId if valid token is present, but doesn't require it
 */
export function optionalAuthenticate(req, res, next) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      // No token provided, continue without authentication
      return next();
    }

    const decoded = verifyToken(token, process.env.JWT_SECRET);

    if (decoded && decoded.userId) {
      req.userId = decoded.userId;
    }

    next();
  } catch (error) {
    // Token present but invalid - just continue without auth
    next();
  }
}
