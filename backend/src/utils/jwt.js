import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error(
    "JWT secrets not configured. Set JWT_SECRET and JWT_REFRESH_SECRET in .env"
  );
}

export function generateAccessToken(payload) {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      algorithm: "HS256",
    });

    return token;
  } catch (error) {
    console.error("Error generating access token:", error);
    throw new Error("Token generation failed");
  }
}

export function generateRefreshToken(payload) {
  try {
    const token = jwt.sign({ userId: payload.userId }, JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRED_IN || "30d",
      algorithm: "HS256",
    });

    return token;
  } catch (error) {
    console.error("Error generating refresh token:", error);
    throw new Error("Token generation failed");
  }
}

export function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Token expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    throw new Error("Token verification failed");
  }
}

/**
 * Generic token verification function
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key to use for verification (optional, defaults to JWT_SECRET)
 */
export function verifyToken(token, secret = JWT_SECRET) {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    // Re-throw the original error for better error handling
    throw error;
  }
}

export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Refresh token expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid refresh token");
    }
    throw new Error("Token verification failed");
  }
}

export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

export function extractTokenFromHeader(authHeader) {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}
