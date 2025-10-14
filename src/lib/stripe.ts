import Stripe from 'stripe'

// Only initialize Stripe if we have the required environment variable
// This prevents build-time errors when env vars are missing
const secretKey = process.env.STRIPE_SECRET_KEY

export const stripe = secretKey 
  ? new Stripe(secretKey, {
      apiVersion: '2025-09-30.clover',
    })
  : ({} as Stripe)
