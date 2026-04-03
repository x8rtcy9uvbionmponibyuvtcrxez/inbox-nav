import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getStripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    // Auth is optional — guests can access their session after checkout
    let userId: string | null = null
    try {
      const authResult = await auth()
      userId = authResult.userId
    } catch {
      // Guest user — no Clerk session
    }

    // Get session_id from query params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    if (!stripe) {
      console.error('Stripe secret key missing for get-session')
      return NextResponse.json(
        { error: 'Payment processing is temporarily unavailable' },
        { status: 503 }
      )
    }

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if session has expired
    const now = Math.floor(Date.now() / 1000)
    if (session.expires_at && session.expires_at < now) {
      return NextResponse.json(
        { error: 'Session has expired. Please start a new checkout.' },
        { status: 410 } // Gone status for expired resources
      )
    }

    // Check if session is still valid (not completed or expired)
    if (session.status === 'expired') {
      return NextResponse.json(
        { error: 'Session has expired. Please start a new checkout.' },
        { status: 410 }
      )
    }

    // Verify session ownership: if user is signed in, check it matches.
    // For guest sessions (clerkUserId is empty), allow access by session_id
    // (Stripe session IDs are unguessable, so possession = authorization).
    const sessionOwner = session.metadata?.clerkUserId
    if (sessionOwner && userId && sessionOwner !== userId) {
      return NextResponse.json(
        { error: 'Session does not belong to current user' },
        { status: 403 }
      )
    }

    // Extract data from session metadata
    const productType = session.metadata?.productType
    const quantity = parseInt(session.metadata?.quantity || '0')

    if (!productType || !quantity) {
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      sessionId,
      productType,
      quantity,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email,
      metadata: session.metadata, // Include all metadata for onboarding
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60', // Cache for 1 minute
        'CDN-Cache-Control': 'private, max-age=0', // Don't cache on CDN
      }
    })
  } catch (error) {
    console.error('Get session error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    )
  }
}
