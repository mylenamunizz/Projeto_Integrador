/**
 * Sanitizes user data from CSV import
 * Removes trailing delimiters and extra whitespace from field values
 */
function sanitizeUserData(userData) {
  const sanitized = {}
  
  for (const [key, value] of Object.entries(userData)) {
    if (typeof value === 'string') {
      // Remove trailing semicolons and commas, then trim
      let cleaned = value.replace(/[;,]+$/, '').trim()
      sanitized[key] = cleaned
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

/**
 * Sanitizes all users in an array
 */
function sanitizeUsers(users) {
  return users.map((user) => sanitizeUserData(user))
}

module.exports = {
  sanitizeUserData,
  sanitizeUsers,
}
