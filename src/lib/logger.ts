/**
 * Production-safe logger utility
 *
 * In production, only errors and warnings are logged.
 * In development, all log levels are enabled.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  debug(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  }

  info(...args: unknown[]): void {
    if (this.isDevelopment) {
      console.info('[INFO]', ...args);
    }
  }

  warn(...args: unknown[]): void {
    console.warn('[WARN]', ...args);
  }

  error(...args: unknown[]): void {
    console.error('[ERROR]', ...args);
  }

  /**
   * Logs with a custom prefix for better organization
   */
  prefixed(prefix: string) {
    return {
      debug: (...args: unknown[]) => this.debug(`[${prefix}]`, ...args),
      info: (...args: unknown[]) => this.info(`[${prefix}]`, ...args),
      warn: (...args: unknown[]) => this.warn(`[${prefix}]`, ...args),
      error: (...args: unknown[]) => this.error(`[${prefix}]`, ...args),
    };
  }
}

export const logger = new Logger();
