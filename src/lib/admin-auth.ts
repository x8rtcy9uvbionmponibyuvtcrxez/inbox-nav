import { auth } from '@clerk/nextjs/server';
import { logger } from './logger';

/**
 * Parse and cache admin IDs from environment variable
 * Using a Set for O(1) lookup performance
 */
const getAdminIds = (() => {
  let cachedAdminIds: Set<string> | null = null;

  return (): Set<string> => {
    if (cachedAdminIds === null) {
      const adminIdsString = process.env.ADMIN_USER_IDS || '';

      if (!adminIdsString) {
        logger.warn('ADMIN_USER_IDS not set. No admin users configured.');
      }

      cachedAdminIds = new Set(
        adminIdsString
          .split(',')
          .map(id => id.trim())
          .filter(Boolean)
      );

      logger.debug(`Loaded ${cachedAdminIds.size} admin user IDs`);
    }

    return cachedAdminIds;
  };
})();

/**
 * Checks if the current user is an admin based on ADMIN_USER_IDS environment variable
 */
export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  const adminIds = getAdminIds();
  return adminIds.has(userId);
}

/**
 * Throws an error if the current user is not an admin
 */
export async function requireAdmin(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Authentication required');
  }

  const adminIds = getAdminIds();

  if (!adminIds.has(userId)) {
    throw new Error('Admin access required');
  }

  return userId;
}
