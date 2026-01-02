const crypto = require('crypto');

// AES-256-GCM encryption for sensitive data
// Uses environment variable ENCRYPTION_KEY for key derivation

class EncryptionUtil {
  constructor() {
    // Derive a 256-bit key from JWT_SECRET using PBKDF2
    // In production, use a dedicated ENCRYPTION_KEY environment variable
    const keyMaterial = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;
    this.key = crypto.pbkdf2Sync(keyMaterial, 'salesprocess-salt', 100000, 32, 'sha256');
  }

  /**
   * Encrypt sensitive data using AES-256-GCM
   * @param {string} plaintext - Data to encrypt
   * @returns {string} Base64 encoded IV:authTag:ciphertext
   */
  encrypt(plaintext) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      // Return as: IV:authTag:ciphertext (all hex encoded)
      const result = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
      return result;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt AES-256-GCM encrypted data
   * @param {string} encryptedData - Base64 encoded IV:authTag:ciphertext
   * @returns {string} Decrypted plaintext
   */
  decrypt(encryptedData) {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
}

module.exports = new EncryptionUtil();
