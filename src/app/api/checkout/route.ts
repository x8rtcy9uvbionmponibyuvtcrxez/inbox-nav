import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse the request body
    const { priceId, quantity, productType } = await request.json()

    if (!priceId || !quantity || !productType) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId, quantity, productType' },
        { status: 400 }
      )
    }

    // Validate quantity
    if (quantity < 10 || quantity > 2000) {
      return NextResponse.json(
        { error: 'Quantity must be between 10 and 2000' },
        { status: 400 }
      )
    }

    // Resolve base URL dynamically (env first, then fallback to current PORT or 3000)
    const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 3000}`

    const stripe = getStripe()
    if (!stripe) {
      console.error('Stripe secret key missing for checkout')
      return NextResponse.json(
        { error: 'Payment processing is temporarily unavailable' },
        { status: 503 }
      )
    }

    const existingStripeCustomer = await prisma.order.findFirst({
      where: {
        clerkUserId: userId,
        stripeCustomerId: { not: null },
      },
      orderBy: { createdAt: 'asc' },
      select: { stripeCustomerId: true },
    })

    let fallbackCustomerEmail: string | undefined

    if (!existingStripeCustomer?.stripeCustomerId) {
      try {
        const client = await clerkClient()
        const user = await client.users.getUser(userId)
        const primaryEmailId = user.primaryEmailAddressId
        const primaryEmail = user.emailAddresses?.find((addr) => addr.id === primaryEmailId)
        fallbackCustomerEmail =
          primaryEmail?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress ?? undefined
      } catch (clerkError) {
        console.warn('Failed to load Clerk user for Stripe customer reuse:', clerkError)
      }
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      allow_promotion_codes: true,
      metadata: {
        clerkUserId: userId,
        productType: productType,
        quantity: quantity.toString(),
      },
      success_url: `${baseUrl}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/products`,
    }

    if (existingStripeCustomer?.stripeCustomerId) {
      sessionParams.customer = existingStripeCustomer.stripeCustomerId
    } else if (fallbackCustomerEmail) {
      sessionParams.customer_email = fallbackCustomerEmail
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
