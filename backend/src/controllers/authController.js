import { createUser, verifyUserCredentials, findUserById } from '../services/userService.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.js';

/**
 * Register a new user
 * POST /api/v1/auth/signup
 */
export async function signup(req, res, next) {
  try {
    const { username, email, password, displayName } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and password are required'
      });
    }

    // Create user (validation happens in service)
    const user = await createUser(req.db, {
      username,
      email,
      password,
      displayName
    });

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Return user data and tokens
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
          bio: user.bio,
          isPublic: user.is_public,
          createdAt: user.created_at
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    // Pass to error handler middleware
    next(error);
  }
}

/**
 * Login user
 * POST /api/v1/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Verify credentials (validation and auth check in service)
    const user = await verifyUserCredentials(req.db, email, password);

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Return user data and tokens
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
          bio: user.bio,
          isPublic: user.is_public,
          emailVerified: user.email_verified,
          lastLoginAt: user.last_login_at
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Verify user still exists and is active
    const user = await findUserById(req.db, decoded.userId);

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive'
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken({ userId: user.id });

    res.status(200).json({
      success: true,
      data: {
        accessToken
      }
    });
  } catch (error) {
    // Token verification errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token'
      });
    }
    next(error);
  }
}

/**
 * Get current user profile
 * GET /api/v1/auth/profile
 */
export async function getProfile(req, res, next) {
  try {
    // User ID comes from auth middleware
    const user = await findUserById(req.db, req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
          bio: user.bio,
          isPublic: user.is_public,
          emailVerified: user.email_verified,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          lastLoginAt: user.last_login_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update current user profile
 * PUT /api/v1/auth/profile
 */
export async function updateProfile(req, res, next) {
  try {
    const { displayName, bio, avatarUrl, isPublic } = req.body;

    // Import here to avoid circular dependency
    const { updateUserProfile } = await import('../services/userService.js');

    const updatedUser = await updateUserProfile(req.db, req.userId, {
      displayName,
      bio,
      avatarUrl,
      isPublic
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          displayName: updatedUser.display_name,
          avatarUrl: updatedUser.avatar_url,
          bio: updatedUser.bio,
          isPublic: updatedUser.is_public,
          emailVerified: updatedUser.email_verified,
          updatedAt: updatedUser.updated_at
        }
      }
    });
  } catch (error) {
    next(error);
  }
}
