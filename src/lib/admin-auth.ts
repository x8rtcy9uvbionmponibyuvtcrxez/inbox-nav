import { auth } from '@clerk/nextjs/server';

/**
 * Checks if the current user is an admin based on ADMIN_USER_IDS environment variable
 */
export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth();
  
  if (!userId) {
    return false;
  }
  
  const adminIds = (process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);
  
  return adminIds.includes(userId);
}

/**
 * Throws an error if the current user is not an admin
 */
export async function requireAdmin(): Promise<string> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Authentication required');
  }
  
  const adminIds = (process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);
  
  if (!adminIds.includes(userId)) {
    throw new Error('Admin access required');
  }
  
  return userId;
}
