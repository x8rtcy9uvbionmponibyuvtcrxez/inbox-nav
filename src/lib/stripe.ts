import Stripe from 'stripe';
import { logger } from './logger';

const secretKey = process.env.STRIPE_SECRET_KEY;
// Use the SDK's latest compatible API version type
const apiVersion: Stripe.LatestApiVersion = '2025-09-30.clover';

let stripeClient: Stripe | null = null;

if (secretKey) {
  stripeClient = new Stripe(secretKey, { apiVersion });
  logger.debug('Stripe client initialized successfully');
} else {
  logger.warn('STRIPE_SECRET_KEY not set. Stripe functionality will not be available.');
}

export const stripe = stripeClient;

export function getStripe(): Stripe | null {
  return stripeClient;
}

export function assertStripe(): Stripe {
  logger.debug('assertStripe called', {
    keyExists: !!process.env.STRIPE_SECRET_KEY,
    keyLength: process.env.STRIPE_SECRET_KEY?.length,
    clientExists: !!stripeClient,
  });

  if (!stripeClient) {
    logger.error('Stripe client is null/undefined. Check STRIPE_SECRET_KEY configuration.');
    throw new Error('Stripe secret key is not configured');
  }
  return stripeClient;
}
