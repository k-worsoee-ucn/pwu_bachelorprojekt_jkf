const bcrypt = require('bcrypt');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/;

const validatePasswordComplexity = (password) => {
  return PASSWORD_REGEX.test(password);
};

const getPasswordValidationError = () => {
  return 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character (@$!%*?&)';
};

const hashPassword = async (plainPassword) => {
  try {
    return await bcrypt.hash(plainPassword, 10);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
};

const verifyPassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error(`Password verification failed: ${error.message}`);
  }
};

module.exports = {
  validatePasswordComplexity,
  getPasswordValidationError,
  hashPassword,
  verifyPassword,
};
