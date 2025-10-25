import crypto from 'node:crypto';
import { logger } from './logger';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const PBKDF2_ITERATIONS = 100000;

// Get encryption salt from environment
function getEncryptionSalt(): string {
  const salt = process.env.ENCRYPTION_SALT;

  if (!salt) {
    logger.warn('ENCRYPTION_SALT not set, using default. Set ENCRYPTION_SALT for production!');
    return 'inbox-nav-default-salt-change-in-production';
  }

  return salt;
}

// Get encryption key from environment or generate one
function getEncryptionKey(): Buffer {
  const keyString = process.env.ENCRYPTION_KEY;

  if (!keyString) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }

  // If it's a hex string, decode it
  if (keyString.length === 64) {
    return Buffer.from(keyString, 'hex');
  }

  // Otherwise, derive key from string using PBKDF2
  const salt = getEncryptionSalt();
  return crypto.pbkdf2Sync(keyString, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypts a plaintext password using AES-256-GCM
 */
export function encryptPassword(plaintext: string): string {
  if (!plaintext) return '';
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(Buffer.from('inbox-nav', 'utf8'));
  
  const encryptedBuffer = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  // Combine IV + tag + encrypted data
  const combined = Buffer.concat([iv, tag, encryptedBuffer]);
  return combined.toString('base64');
}

/**
 * Decrypts an encrypted password using AES-256-GCM
 */
export function decryptPassword(encrypted: string): string {
  if (!encrypted) return '';
  
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encrypted, 'base64');
    
    // Extract IV, tag, and encrypted data
    const iv = combined.subarray(0, IV_LENGTH);
    const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encryptedData = combined.subarray(IV_LENGTH + TAG_LENGTH);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAAD(Buffer.from('inbox-nav', 'utf8'));
    decipher.setAuthTag(tag);
    
    const decryptedBuffer = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    
    return decryptedBuffer.toString('utf8');
  } catch (error) {
    logger.error('Password decryption failed:', error);
    throw new Error('Failed to decrypt password. Data may be corrupted or encrypted with a different key.');
  }
}

/**
 * Generates a random encryption key (for initial setup)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

export function shouldEncryptSecrets(): boolean {
  return process.env.ENCRYPT_ONBOARDING_SECRETS === 'true';
}

export function protectSecret(value: string | null | undefined): string | null {
  if (value == null || value === '') {
    return null;
  }
  if (!shouldEncryptSecrets()) {
    return value;
  }
  try {
    return encryptPassword(value);
  } catch (error) {
    logger.error('CRITICAL: Failed to encrypt secret:', error);
    throw new Error('Failed to encrypt sensitive data. Cannot proceed with storing unencrypted secrets.');
  }
}

export function revealSecret(value: string | null | undefined): string | null {
  if (value == null || value === '') {
    return null;
  }
  if (!shouldEncryptSecrets()) {
    return value;
  }
  try {
    return decryptPassword(value);
  } catch (error) {
    logger.error('Failed to decrypt secret:', error);
    throw new Error('Failed to decrypt sensitive data. Check ENCRYPTION_KEY and ENCRYPTION_SALT.');
  }
}
