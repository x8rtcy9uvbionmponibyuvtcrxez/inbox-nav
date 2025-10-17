import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // Get user's orders with Stripe subscription IDs
    const orders = await prisma.order.findMany({
      where: { 
        clerkUserId: userId,
        stripeSubscriptionId: { not: null },
      },
      select: { stripeSubscriptionId: true },
    });

    if (orders.length === 0) {
      return NextResponse.json({ invoices: [] });
    }

    const subscriptionIds = orders
      .map(order => order.stripeSubscriptionId)
      .filter(Boolean) as string[];

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      subscription: subscriptionIds[0], // Stripe API limitation - one subscription at a time
      limit: 100,
    });

    // Format invoices for response
    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amount: invoice.amount_paid || invoice.amount_due,
      currency: invoice.currency,
      created: invoice.created,
      dueDate: invoice.due_date,
      paidAt: invoice.status_transitions?.paid_at,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
      description: invoice.description || `Invoice for subscription`,
    }));

    return NextResponse.json({ invoices: formattedInvoices });
  } catch (error) {
    console.error('[Billing] GET invoices error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
