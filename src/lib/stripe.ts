import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Pin to a literal that matches Stripe's supported types for this SDK version
  apiVersion: '2025-09-30.clover',
})
