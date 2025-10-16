import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY
// Use the SDK's latest compatible API version type
const apiVersion: Stripe.LatestApiVersion = '2025-09-30.clover'

let stripeClient: Stripe | null = null

if (secretKey) {
  stripeClient = new Stripe(secretKey, { apiVersion })
}

export const stripe = stripeClient

export function getStripe(): Stripe | null {
  return stripeClient
}

export function assertStripe(): Stripe {
  console.log('[STRIPE DEBUG] assertStripe called');
  console.log('[STRIPE DEBUG] process.env.STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
  console.log('[STRIPE DEBUG] process.env.STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY?.length);
  console.log('[STRIPE DEBUG] stripeClient exists:', !!stripeClient);
  
  if (!stripeClient) {
    console.error('[STRIPE DEBUG] stripeClient is null/undefined');
    throw new Error('Stripe secret key is not configured')
  }
  return stripeClient
}
