// Environment variable validation
export function validateEnv(): string[] {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const required = [
    'DATABASE_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'CLERK_WEBHOOK_SECRET',
    'ENCRYPTION_KEY',
    'NEXT_PUBLIC_APP_URL',
  ];

  required.forEach(envVar => {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  });

  // Recommended (app still boots, but features silently noop)
  const recommended = [
    'REDIS_URL',
    'RESEND_API_KEY',
    'ADMIN_USER_IDS',
    'STRIPE_PRICE_PREWARMED_INBOX',
    'STRIPE_PRICE_MICROSOFT_INBOX',
    'STRIPE_PRICE_DOMAIN_COM',
    'STRIPE_PRICE_DOMAIN_INFO',
    'STRIPE_PRICE_EDU',
    'STRIPE_PRICE_LEGACY',
    'STRIPE_PRICE_AWS',
    'STRIPE_PRICE_RESELLER',
  ];

  recommended.forEach(envVar => {
    if (!process.env[envVar]) {
      warnings.push(`Missing recommended environment variable: ${envVar}`);
    }
  });

  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn('[env] warnings:\n  ' + warnings.join('\n  '));
  }
  
  // Validate DATABASE_URL format
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
  }
  
  // Validate Clerk keys format
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith('pk_')) {
    errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with pk_');
  }
  
  if (process.env.CLERK_SECRET_KEY && !process.env.CLERK_SECRET_KEY.startsWith('sk_')) {
    errors.push('CLERK_SECRET_KEY must start with sk_');
  }
  
  // Validate Stripe keys format
  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
    errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with pk_');
  }
  
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    errors.push('STRIPE_SECRET_KEY must start with sk_');
  }

  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length < 32) {
    errors.push('ENCRYPTION_KEY must be at least 32 characters');
  }

  if (process.env.NEXT_PUBLIC_APP_URL && !/^https?:\/\//.test(process.env.NEXT_PUBLIC_APP_URL)) {
    errors.push('NEXT_PUBLIC_APP_URL must start with http:// or https://');
  }

  return errors;
}


