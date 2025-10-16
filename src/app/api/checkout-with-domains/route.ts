import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getStripe } from '@/lib/stripe'
import type Stripe from 'stripe'

type ProductType = 'RESELLER' | 'EDU' | 'LEGACY' | 'PREWARMED' | 'AWS' | 'MICROSOFT'
type DomainSource = 'OWN' | 'BUY_FOR_ME'

const INBOX_PRICING_USD: Record<ProductType, number> = {
  RESELLER: 3,
  EDU: 1.5,
  LEGACY: 2.5,
  PREWARMED: 7,
  AWS: 1.25,
  MICROSOFT: 60, // Per domain, not per inbox
}

const INBOX_PRICE_IDS: Record<ProductType, string | undefined> = {
  RESELLER: process.env.STRIPE_PRICE_RESELLER_INBOX,
  EDU: process.env.STRIPE_PRICE_EDU_INBOX,
  LEGACY: process.env.STRIPE_PRICE_LEGACY_INBOX,
  PREWARMED: process.env.STRIPE_PRICE_PREWARMED_INBOX,
  AWS: process.env.STRIPE_PRICE_AWS_INBOX,
  MICROSOFT: process.env.STRIPE_PRICE_MICROSOFT_INBOX,
}

const DOMAIN_PRICING_USD = {
  '.com': 12,
  '.info': 4,
} as const

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as {
      productType: ProductType
      quantity: number
      inboxesPerDomain: number
      domainSource: DomainSource
      ownDomains?: string[]
      domainTLD?: '.com' | '.info'
      domainsNeeded: number
      forwardingUrl: string
      domainPriceId?: string
    }

    const { productType, quantity } = body
    if (!productType || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    // Validate MOQ based on product type
    const getMoq = (productType: ProductType) => {
      if (productType === 'AWS') return 20;
      if (productType === 'MICROSOFT') return 1;
      return 10;
    };
    
    const moq = getMoq(productType);
    if (quantity < moq || quantity > 2000) {
      return NextResponse.json({ error: `Quantity must be between ${moq} and 2000 for ${productType}` }, { status: 400 })
    }

    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 3000}`

    const inboxPriceId = INBOX_PRICE_IDS[productType]
    const inboxUnitAmount = INBOX_PRICING_USD[productType] * 100
    
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = []
    
    if (inboxPriceId) {
      // Use Stripe price ID if available
      lineItems.push({
        price: inboxPriceId,
        quantity,
      })
    } else {
      // Fallback to dynamic pricing
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: `${quantity} ${productType} Inboxes` },
          recurring: { interval: 'month' },
          unit_amount: inboxUnitAmount,
        },
        quantity,
      })
    }

    if (body.domainSource === 'BUY_FOR_ME') {
      // Prefer explicit price ID when provided (for testing or preconfigured prices)
      const envPriceId = body.domainTLD === '.com'
        ? process.env.STRIPE_PRICE_DOMAIN_COM
        : body.domainTLD === '.info'
          ? process.env.STRIPE_PRICE_DOMAIN_INFO
          : undefined;

      const priceToUse = body.domainPriceId || envPriceId;

      if (priceToUse) {
        lineItems.push({
          price: priceToUse,
          quantity: body.domainsNeeded,
        })
      } else if (body.domainTLD) {
        // Fallback to dynamic price if no price ID configured
        const domainUnitAmount = DOMAIN_PRICING_USD[body.domainTLD] * 100
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: { name: `${body.domainsNeeded} ${body.domainTLD} Domains` },
            recurring: { interval: 'month' },
            unit_amount: domainUnitAmount,
          },
          quantity: body.domainsNeeded,
        })
      }
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: lineItems,
      metadata: {
        clerkUserId: userId,
        productType,
        quantity: String(quantity),
        inboxesPerDomain: String(body.inboxesPerDomain ?? ''),
        domainSource: body.domainSource ?? '',
        ownDomains: body.ownDomains ? JSON.stringify(body.ownDomains) : '',
        domainTLD: body.domainTLD ?? '',
        domainsNeeded: String(body.domainsNeeded ?? ''),
        forwardingUrl: body.forwardingUrl ?? '',
      },
      success_url: `${baseUrl}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/configure?product=${productType}&qty=${quantity}`,
    };

    const stripe = getStripe()
    if (!stripe) {
      console.error('Stripe secret key missing for checkout-with-domains')
      return NextResponse.json({ error: 'Payment processing is temporarily unavailable' }, { status: 503 })
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('checkout-with-domains error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
