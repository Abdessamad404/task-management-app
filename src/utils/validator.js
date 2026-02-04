class Validator {
  // Email validation
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Password validation (min 6 chars, has letter and number)
  static isValidPassword(password) {
    if (password.length < 6) return false;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
  }

  // Task status validation
  static isValidStatus(status) {
    const validStatuses = ["todo", "in-progress", "done"];
    return validStatuses.includes(status);
  }

  // Task priority validation
  static isValidPriority(priority) {
    const validPriorities = ["low", "medium", "high"];
    return validPriorities.includes(priority);
  }

  // Generic required field checker
  static hasRequiredFields(data, requiredFields) {
    const missing = [];
    requiredFields.forEach(field => {
      if (!data[field] || data[field].toString().trim() === "") {
        missing.push(field);
      }
    });
    return missing.length === 0 ? null : missing;
  }

  // Sanitize string (basic XSS prevention)
  static sanitizeString(str) {
    if (typeof str !== "string") return str;
    return str.trim().replace(/[<>]/g, ""); // Remove < and >
  }
}

module.exports = Validator;
