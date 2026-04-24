import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { handleUserSignup } from '@/lib/clerk-invites';
import { notifyUserSignup } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    // Get the webhook secret from environment
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error('[WEBHOOK] CLERK_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Get the headers
    const headerPayload = req.headers;
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('[WEBHOOK] Missing required headers');
      return NextResponse.json({ error: 'Missing required headers' }, { status: 400 });
    }

    // Get the body
    const payload = await req.text();

    // Create a new Svix instance with your secret.
    const wh = new Webhook(webhookSecret);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(payload, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('[WEBHOOK] Error verifying webhook:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the webhook
    const eventType = evt.type;
    console.log(`[WEBHOOK] Received event: ${eventType}`);

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const data = evt.data as {
        id: string;
        email_addresses?: Array<{
          email_address: string;
          verification?: { status?: string } | null;
        }>;
        first_name?: string;
        last_name?: string;
      };
      // Only link orders for verified emails — prevents a malicious user from
      // attaching an unverified email to someone else's order history.
      const emails = data.email_addresses
        ?.filter((addr) => addr.verification?.status === 'verified')
        .map((addr) => addr.email_address)
        .filter(Boolean) ?? [];

      console.log(`[WEBHOOK] ${eventType}: ${data.id}, verified emails:`, emails);

      if (emails.length > 0) {
        await handleUserSignup(data.id, emails);
      }

      if (eventType === 'user.created') {
        try {
          await notifyUserSignup({
            id: data.id,
            email: emails[0] || 'Unknown',
            firstName: data.first_name || undefined,
            lastName: data.last_name || undefined,
          });
        } catch (notificationError) {
          console.error('[NOTIFICATION] Failed to send user signup notification:', notificationError);
        }
      }
    } else if (eventType === 'user.deleted') {
      const data = evt.data as { id?: string };
      console.log(`[WEBHOOK] user.deleted: ${data.id ?? 'unknown'}`);
      // Intentional no-op: we keep the Order history intact so cancellations
      // and billing records aren't lost. Orphaned clerkUserId is acceptable.
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[WEBHOOK] Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
