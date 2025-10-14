# Stripe Webhook Setup

## Environment Variables Required

Add to your `.env.local` file:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

## Webhook Endpoint

The webhook endpoint is available at:
```
POST /api/webhooks/stripe-subscription
```

## Events Handled

### 1. `customer.subscription.deleted`
- Updates order status to `CANCELLED`
- Sets `subscriptionStatus` to `cancelled`
- Sets `cancelledAt` timestamp
- Marks all related inboxes as `DELETED`
- Marks all related domains as `DELETED`

### 2. `customer.subscription.updated`
- Updates `subscriptionStatus` to match Stripe's status
- Handles cancellation by setting `cancelledAt` and marking items as `DELETED`
- Preserves existing order status unless subscription is cancelled

### 3. `invoice.payment_failed`
- Updates `subscriptionStatus` to `past_due`
- Logs payment failure for monitoring

## Security

- Verifies webhook signature using `stripe.webhooks.constructEvent()`
- Uses `STRIPE_WEBHOOK_SECRET` from environment
- Returns 400 for invalid signatures
- Returns 500 for processing errors
- Returns 200 for successful processing

## Logging

All webhook events are logged with:
- Event type received
- Order ID being updated
- Success/failure status
- Error details if any

## Stripe Dashboard Configuration

1. Go to Stripe Dashboard > Webhooks
2. Create new endpoint: `https://yourdomain.com/api/webhooks/stripe-subscription`
3. Select events:
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
   - `invoice.payment_failed`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

## Testing

Use Stripe CLI to test webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe-subscription
```
