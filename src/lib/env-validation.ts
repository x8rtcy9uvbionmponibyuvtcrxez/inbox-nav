import { logger } from './logger';

/**
 * Required environment variables for the application
 */
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'ENCRYPTION_KEY',
] as const;

/**
 * Optional but recommended environment variables
 */
const RECOMMENDED_ENV_VARS = [
  'STRIPE_WEBHOOK_SECRET',
  'ENCRYPTION_SALT',
  'ADMIN_USER_IDS',
  'REDIS_URL',
  'RESEND_API_KEY',
  'SLACK_WEBHOOK_URL',
] as const;

/**
 * Validates that all required environment variables are set
 * Throws an error if any required variables are missing
 */
export function validateEnvironment(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // Check recommended variables
  for (const envVar of RECOMMENDED_ENV_VARS) {
    if (!process.env[envVar]) {
      warnings.push(envVar);
    }
  }

  // Log warnings for missing recommended variables
  if (warnings.length > 0) {
    logger.warn('Missing recommended environment variables:', warnings.join(', '));
    logger.warn('Some features may not work correctly without these variables.');
  }

  // Throw error for missing required variables
  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error(errorMessage);
    logger.error('Please check your .env file and ensure all required variables are set.');
    throw new Error(errorMessage);
  }

  logger.info('Environment validation passed');
}

/**
 * Validates environment variables for production deployments
 * More strict validation for production
 */
export function validateProductionEnvironment(): void {
  validateEnvironment();

  const productionRequired = [
    'STRIPE_WEBHOOK_SECRET',
    'ADMIN_USER_IDS',
    'ENCRYPTION_SALT',
  ];

  const missing: string[] = [];

  for (const envVar of productionRequired) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    const errorMessage = `Missing production-required environment variables: ${missing.join(', ')}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Validate encryption key format
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (encryptionKey && encryptionKey.length < 32) {
    logger.warn('ENCRYPTION_KEY should be at least 32 characters for security');
  }

  logger.info('Production environment validation passed');
}
