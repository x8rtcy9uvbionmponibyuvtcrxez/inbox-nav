import { clerkClient } from '@clerk/nextjs/server';
import { linkOrdersToUserAction } from '@/app/admin/import/actions';

/**
 * Sends Clerk invitation to a user email
 */
export async function sendClerkInvitation(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user already exists
    const client = await clerkClient();
    const targetEmail = email.trim().toLowerCase();
    const existingUsers = await client.users.getUserList({
      emailAddress: [targetEmail],
      limit: 1
    });

    if (existingUsers.data.length > 0) {
      // User already exists, link their orders
      const user = existingUsers.data[0];
      await linkOrdersToUserAction(targetEmail, user.id);
      return { success: true };
    }

    // Create invitation
    const invitation = await client.invitations.createInvitation({
      emailAddress: targetEmail,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      publicMetadata: {
        source: 'csv_import',
        imported: true
      }
    });

    console.log(`[CLERK_INVITE] Sent invitation to ${targetEmail}:`, invitation.id);
    return { success: true };

  } catch (error) {
    console.error(`[CLERK_INVITE] Failed to invite ${email}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Handles user signup completion - links imported orders to the new user
 */
export async function handleUserSignup(userId: string, emailAddresses: string[]): Promise<void> {
  try {
    // Link orders for each email address
    for (const rawEmail of emailAddresses) {
      const email = rawEmail.trim().toLowerCase();
      if (!email) continue;
      await linkOrdersToUserAction(email, userId);
    }
    
    console.log(`[CLERK_LINK] Linked orders for user ${userId} with emails:`, emailAddresses);
  } catch (error) {
    console.error(`[CLERK_LINK] Failed to link orders for user ${userId}:`, error);
  }
}

/**
 * Gets pending invitations (users who haven't signed up yet)
 */
export async function getPendingInvitations(): Promise<Array<{
  id: string;
  emailAddress: string;
  createdAt: Date;
  status: string;
}>> {
  try {
    const client = await clerkClient();
    const invitations = await client.invitations.getInvitationList({
      status: 'pending'
    });

    return invitations.data.map((inv) => ({
      id: inv.id,
      emailAddress: inv.emailAddress,
      createdAt: new Date(inv.createdAt),
      status: String(inv.status)
    }));
  } catch (error) {
    console.error('[CLERK_INVITE] Failed to get pending invitations:', error);
    return [];
  }
}
