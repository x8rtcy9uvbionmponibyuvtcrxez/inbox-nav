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
  if (!stripeClient) {
    throw new Error('Stripe secret key is not configured')
  }
  return stripeClient
}
