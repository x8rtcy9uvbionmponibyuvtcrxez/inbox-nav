type EnvSpec = {
  key: string;
  optional?: boolean;
};

const REQUIRED_ENVS: EnvSpec[] = [
  { key: 'NEXT_PUBLIC_APP_URL' },
  { key: 'CLERK_PUBLISHABLE_KEY' },
  { key: 'CLERK_SECRET_KEY' },
  { key: 'STRIPE_SECRET_KEY' },
  { key: 'STRIPE_WEBHOOK_SECRET', optional: true },
  { key: 'DATABASE_URL' },
];

export function validateEnv(failFast = false): string[] {
  const missing: string[] = [];
  for (const spec of REQUIRED_ENVS) {
    const value = process.env[spec.key];
    if (!value && !spec.optional) missing.push(spec.key);
  }
  if (missing.length && failFast) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  return missing;
}


