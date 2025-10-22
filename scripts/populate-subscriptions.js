const { PrismaClient } = require('@prisma/client');

// Simple Stripe initialization
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  const Stripe = require('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

const prisma = new PrismaClient();

async function populateSubscriptions() {
  console.log('🔍 Checking existing orders for subscription data...\n');

  try {
    // Get all orders with their onboarding data
    const orders = await prisma.order.findMany({
      include: {
        onboardingData: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${orders.length} orders to check\n`);

    let updatedCount = 0;
    let stripeCount = 0;
    let errorCount = 0;

    for (const order of orders) {
      console.log(`\n🔍 Processing Order: ${order.id}`);
      console.log(`   Product: ${order.productType}`);
      console.log(`   Quantity: ${order.quantity}`);
      console.log(`   Amount: $${(order.totalAmount / 100).toFixed(2)}`);
      console.log(`   Current Status: ${order.status}`);
      console.log(`   Current Subscription Status: ${order.subscriptionStatus}`);
      console.log(`   Stripe Session ID: ${order.stripeSessionId || 'None'}`);
      console.log(`   Stripe Subscription ID: ${order.stripeSubscriptionId || 'None'}`);

      // Skip if already has subscription ID
      if (order.stripeSubscriptionId) {
        console.log(`   ✅ Already has subscription ID: ${order.stripeSubscriptionId}`);
        stripeCount++;
        continue;
      }

      // Skip if no Stripe session ID
      if (!order.stripeSessionId) {
        console.log(`   ⚠️  No Stripe session ID - skipping`);
        continue;
      }

      try {
        // Try to get subscription from Stripe
        const stripe = getStripe();
        if (!stripe) {
          console.log(`   ❌ Stripe not configured`);
          errorCount++;
          continue;
        }

        // Get session from Stripe
        const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId, {
          expand: ['subscription']
        });

        console.log(`   📋 Session Status: ${session.payment_status}`);
        console.log(`   📋 Session Mode: ${session.mode}`);

        if (session.subscription) {
          const subscriptionId = typeof session.subscription === 'string' 
            ? session.subscription 
            : session.subscription.id;

          console.log(`   🎯 Found subscription ID: ${subscriptionId}`);

          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          console.log(`   📊 Subscription Status: ${subscription.status}`);
          console.log(`   📊 Subscription Cancel At Period End: ${subscription.cancel_at_period_end}`);

          // Update order with subscription data
          const updateData = {
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: subscription.cancel_at_period_end ? 'cancel_at_period_end' : subscription.status,
            status: session.payment_status === 'paid' ? 'COMPLETED' : order.status
          };

          if (subscription.cancel_at_period_end && subscription.canceled_at) {
            updateData.cancelledAt = new Date(subscription.canceled_at * 1000);
            updateData.cancellationReason = 'User cancelled via Stripe';
          }

          await prisma.order.update({
            where: { id: order.id },
            data: updateData
          });

          console.log(`   ✅ Updated order with subscription data`);
          updatedCount++;
        } else {
          console.log(`   ⚠️  No subscription found in session`);
        }

      } catch (error) {
        console.log(`   ❌ Error processing order: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Orders updated: ${updatedCount}`);
    console.log(`   🎯 Orders with existing subscriptions: ${stripeCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total processed: ${orders.length}`);

  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
populateSubscriptions()
  .then(() => {
    console.log('\n🎉 Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
