import { hashPassword, verifyPassword } from "../utils/password.js";
import {
  validateUsername,
  validateDisplayName,
  isValidEmail,
  sanitizeString,
} from "../utils/validation.js";

export async function createUser(db, userData) {
  const { username, email, password, displayName } = userData;

  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    const error = new Error(usernameValidation.message);
    error.statusCode = 400;
    throw error;
  }

  if (!isValidEmail(email)) {
    const error = new Error("Invalid email format");
    error.statusCode = 400;
    throw error;
  }

  if (!password || password.length < 8) {
    const error = new Error("Password must be at least 8 characters");
    error.statusCode = 400;
    throw error;
  }

  if (displayName) {
    const displayNameValidation = validateDisplayName(displayName);
    if (!displayNameValidation.valid) {
      const error = new Error(displayNameValidation.message);
      error.statusCode = 400;
      throw error;
    }
  }

  const sanitizedUsername = sanitizeString(username);
  const sanitizedEmail = sanitizeString(email).toLowerCase();
  const sanitizedDisplayName = displayName ? sanitizeString(displayName) : null;

  const existingUser = await db.query(
    `SELECT id, username, email FROM USERS
     WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2)`,
    [sanitizedUsername, sanitizedEmail]
  );

  if (existingUser.rows.length > 0) {
    const existing = existingUser.rows[0];

    if (
      existingUser.username.toLowerCase() ===
      sanitizedUsername.toLocaleLowerCase()
    ) {
      const error = new Error("Username already taken");
      error.statusCode = 409;
      throw error;
    }

    if (existingUser.email.toLowerCase() === sanitizedEmail.toLowerCase()) {
      const error = new Error("Email already registered");
      error.statusCode = 409;
      throw error;
    }
  }

  const passwordHash = await hashPassword(password);

  const result = await db.query(
    `INSERT INTO users (username, email, password_hash, display_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, display_name, avatar_url, bio, email_verified, is_active, is_public, created_at, updated_at`,
    [sanitizedUsername, sanitizedEmail, passwordHash, sanitizedDisplayName]
  );

  return result.rows[0];
}

export async function findUserByEmail(db, email) {
  const sanitizedEmail = sanitizeString(email).toLowerCase();

  const result = await db.query(
    `SELECT id, username, email, password_hash, display_name, avatar_url, bio, 
            email_verified, is_active, is_public, created_at, updated_at, last_login_at
     FROM users
     WHERE LOWER(email) = LOWER($1)`,
    [sanitizedEmail]
  );

  return result.rows[0] || null;
}

export async function findUserById(db, userId) {
  const result = await db.query(
    `SELECT id, username, email, display_name, avatar_url, bio,
            email_verified, is_active, is_public, created_at, updated_at, last_login_at
     FROM users
     WHERE id = $1`,
    [userId]
  );

  return result.rows[0] || null;
}

export async function findUserByUsername(db, username) {
  const sanitizedUsername = sanitizeString(username);

  const result = await db.query(
    `SELECT id, username, email, display_name, avatar_url, bio,
            email_verified, is_active, is_public, created_at, updated_at, last_login_at
     FROM users
     WHERE LOWER(username) = LOWER($1)`,
    [sanitizedUsername]
  );

  return result.rows[0] || null;
}

export async function updateLastLogin(db, userId) {
  await db.query(
    `UPDATE users
     SET last_login_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [userId]
  );
}

export async function verifyUserCredentials(db, email, password) {
  const user = await findUserByEmail(db, email);

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.is_active) {
    const error = new Error("Account is inactive. Please contact support");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await verifyPassword(password, user.password_hash);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  updateLastLogin(db, user.id).catch((err) => {
    console.error("Failed to update last login:", err);
  });

  const { password_hash, ...userWithoutPassword } = user;

  return userWithoutPassword;
}

export async function updateUserProfile(db, userId, updates) {
  const { displayName, bio, avatarUrl, isPublic } = updates;

  // Validate display name if provided
  if (displayName !== undefined) {
    const validation = validateDisplayName(displayName);
    if (!validation.valid) {
      const error = new Error(validation.message);
      error.statusCode = 400;
      throw error;
    }
  }

  // Build dynamic query
  // Only update fields that are provided
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (displayName !== undefined) {
    fields.push(`display_name = $${paramCount}`);
    values.push(sanitizeString(displayName));
    paramCount++;
  }

  if (bio !== undefined) {
    fields.push(`bio = $${paramCount}`);
    values.push(sanitizeString(bio));
    paramCount++;
  }

  if (avatarUrl !== undefined) {
    fields.push(`avatar_url = $${paramCount}`);
    values.push(sanitizeString(avatarUrl));
    paramCount++;
  }

  if (isPublic !== undefined) {
    fields.push(`is_public = $${paramCount}`);
    values.push(isPublic);
    paramCount++;
  }

  // Nothing to update
  if (fields.length === 0) {
    return await findUserById(db, userId);
  }

  // Add userId as last parameter
  values.push(userId);

  // Build and execute query
  const query = `
    UPDATE users 
    SET ${fields.join(", ")}
    WHERE id = $${paramCount}
    RETURNING id, username, email, display_name, avatar_url, bio,
              email_verified, is_active, is_public, created_at, updated_at
  `;

  const result = await db.query(query, values);

  return result.rows[0];
}
