export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { validateEnv } = await import('./lib/validateEnv');
  const errors = validateEnv();

  if (errors.length > 0) {
    const message = '[env] configuration errors:\n  ' + errors.join('\n  ');

    if (process.env.NODE_ENV === 'production') {
      console.error(message);
      throw new Error('Environment validation failed. See logs above.');
    }

    console.warn(message);
  }
}
