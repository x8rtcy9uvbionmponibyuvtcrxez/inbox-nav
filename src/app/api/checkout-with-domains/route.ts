import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'

type ProductType = 'GOOGLE' | 'PREWARMED' | 'MICROSOFT'
type DomainSource = 'OWN' | 'BUY_FOR_ME'

const INBOX_PRICING_USD: Record<ProductType, number> = {
  GOOGLE: 3,
  PREWARMED: 7,
  MICROSOFT: 50,
}

const INBOX_PRICE_IDS: Record<ProductType, string | undefined> = {
  GOOGLE: process.env.STRIPE_PRICE_GOOGLE_INBOX,
  PREWARMED: process.env.STRIPE_PRICE_PREWARMED_INBOX,
  MICROSOFT: process.env.STRIPE_PRICE_MICROSOFT_INBOX,
}

const DOMAIN_PRICING_USD = {
  '.com': 12,
  '.info': 4,
} as const

export async function POST(request: NextRequest) {
  try {
    // TEMPORARY: Allow testing without authentication
    const { userId } = await auth().catch(() => ({ userId: 'test-user-id' }))
    // if (!userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

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
    if (quantity < 10 || quantity > 2000) {
      return NextResponse.json({ error: 'Quantity must be between 10 and 2000' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 3000}`

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

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('checkout-with-domains error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
