const speakeasy = require('speakeasy');
const crypto = require('crypto');

/**
 * Generate a random 6-digit OTP code
 * @returns {string} 6-digit code
 */
const generateOTPCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generate a secret for TOTP (Time-based OTP)
 * @returns {string} Base32 encoded secret
 */
const generateSecret = () => {
  const secret = speakeasy.generateSecret({
    name: 'Control Disciplina',
    length: 32
  });
  return secret.base32;
};

/**
 * Verify TOTP code
 * @param {string} secret - User's TOTP secret
 * @param {string} token - Code to verify
 * @returns {boolean} True if valid
 */
const verifyTOTP = (secret, token) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time steps before/after for clock skew
  });
};

/**
 * Store for email OTP codes (in production, use Redis)
 * Format: { userId: { code: '123456', expiresAt: timestamp } }
 */
const otpStore = new Map();

/**
 * Generate and store email OTP
 * @param {string} userId - User ID
 * @returns {string} 6-digit code
 */
const generateEmailOTP = (userId) => {
  const code = generateOTPCode();
  const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes
  
  otpStore.set(userId, { code, expiresAt });
  
  // Clean up expired codes periodically
  setTimeout(() => {
    const stored = otpStore.get(userId);
    if (stored && stored.expiresAt <= Date.now()) {
      otpStore.delete(userId);
    }
  }, 5 * 60 * 1000);
  
  return code;
};

/**
 * Verify email OTP
 * @param {string} userId - User ID
 * @param {string} code - Code to verify
 * @returns {boolean} True if valid and not expired
 */
const verifyEmailOTP = (userId, code) => {
  const stored = otpStore.get(userId);
  
  if (!stored) {
    return false;
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(userId);
    return false;
  }
  
  if (stored.code !== code) {
    return false;
  }
  
  // Valid code - delete it to prevent reuse
  otpStore.delete(userId);
  return true;
};

/**
 * Clear OTP for user
 * @param {string} userId - User ID
 */
const clearOTP = (userId) => {
  otpStore.delete(userId);
};

module.exports = {
  generateSecret,
  verifyTOTP,
  generateEmailOTP,
  verifyEmailOTP,
  clearOTP
};
