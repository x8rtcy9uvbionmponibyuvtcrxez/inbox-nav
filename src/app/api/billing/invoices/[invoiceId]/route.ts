import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getStripe } from '@/lib/stripe';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invoiceId } = await params;
    const stripe = getStripe();
    
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // Fetch specific invoice from Stripe
    const invoice = await stripe.invoices.retrieve(invoiceId);

    // Format invoice for response
    const formattedInvoice = {
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
      lines: invoice.lines?.data.map(line => ({
        id: line.id,
        description: line.description,
        amount: line.amount,
        quantity: line.quantity,
        period: line.period,
      })),
    };

    return NextResponse.json({ invoice: formattedInvoice });
  } catch (error) {
    console.error('[Billing] GET invoice error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}
