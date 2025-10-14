import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { handleUserSignup } from '@/lib/clerk-invites';

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

    if (eventType === 'user.created') {
      const data = evt.data as { id: string; email_addresses?: Array<{ email_address: string }> };
      const emails = data.email_addresses?.map((addr) => addr.email_address).filter(Boolean) ?? [];

      console.log(`[WEBHOOK] User created: ${data.id}, emails:`, emails);

      await handleUserSignup(data.id, emails);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[WEBHOOK] Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
