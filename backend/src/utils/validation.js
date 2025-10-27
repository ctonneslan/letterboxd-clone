export function isValidEmail(email) {
  if (!email || typeof email !== "string") {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUsername(username) {
  if (!username || typeof username !== "string") {
    return {
      valid: false,
      message: "Username is required",
    };
  }

  username = username.trim();

  if (username.length < 3) {
    return {
      valid: false,
      message: "Username must be at least 3 characters",
    };
  }

  if (username.length > 20) {
    return {
      valid: false,
      message: "Username cannot be more than 20 characters",
    };
  }

  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;

  if (!usernameRegex.test(username)) {
    return {
      valid: false,
      message:
        "Username must start with a letter and contain only letters, numbers, and underscores",
    };
  }

  return { valid: true, message: "Username is valid" };
}

export function sanitizeString(input) {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, "");

  // Remove control characters (except newline and tab)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return sanitized;
}

export function validateDisplayName(displayName) {
  // Optional field
  if (!displayName) {
    return {
      valid: true,
      message: "Display name is optional",
    };
  }

  if (typeof displayName !== "string") {
    return {
      valid: false,
      message: "Display name must be a string",
    };
  }

  // Trim and check length
  const trimmed = displayName.trim();

  if (trimmed.length === 0) {
    return {
      valid: true,
      message: "Display name is optional",
    };
  }

  if (trimmed.length > 50) {
    return {
      valid: false,
      message: "Display name must be less than 50 characters",
    };
  }

  return {
    valid: true,
    message: "Display name is valid",
  };
}
