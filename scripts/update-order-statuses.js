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

async function updateOrderStatuses() {
  console.log('🔄 Updating order statuses based on Stripe subscription data...\n');

  try {
    // Get all orders with subscription IDs
    const orders = await prisma.order.findMany({
      where: {
        stripeSubscriptionId: {
          not: null
        }
      },
      include: {
        onboardingData: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${orders.length} orders with subscription IDs\n`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const order of orders) {
      console.log(`\n🔍 Processing Order: ${order.id}`);
      console.log(`   Product: ${order.productType}`);
      console.log(`   Current Status: ${order.status}`);
      console.log(`   Current Subscription Status: ${order.subscriptionStatus}`);
      console.log(`   Stripe Subscription ID: ${order.stripeSubscriptionId}`);

      try {
        // Get subscription from Stripe
        const stripe = getStripe();
        if (!stripe) {
          console.log(`   ❌ Stripe not configured`);
          errorCount++;
          continue;
        }

        const subscription = await stripe.subscriptions.retrieve(order.stripeSubscriptionId);
        console.log(`   📊 Stripe Subscription Status: ${subscription.status}`);
        console.log(`   📊 Cancel At Period End: ${subscription.cancel_at_period_end}`);

        // Determine the correct status
        let newStatus = order.status;
        let newSubscriptionStatus = order.subscriptionStatus;
        let cancelledAt = order.cancelledAt;
        let cancellationReason = order.cancellationReason;

        // Update order status based on subscription status
        if (subscription.status === 'active' && !subscription.cancel_at_period_end) {
          newStatus = 'COMPLETED';
          newSubscriptionStatus = 'active';
        } else if (subscription.status === 'active' && subscription.cancel_at_period_end) {
          newStatus = 'COMPLETED';
          newSubscriptionStatus = 'cancel_at_period_end';
          if (subscription.canceled_at && !cancelledAt) {
            cancelledAt = new Date(subscription.canceled_at * 1000);
            cancellationReason = 'User cancelled via Stripe';
          }
        } else if (subscription.status === 'canceled') {
          newStatus = 'CANCELLED';
          newSubscriptionStatus = 'cancelled';
          if (subscription.canceled_at && !cancelledAt) {
            cancelledAt = new Date(subscription.canceled_at * 1000);
            cancellationReason = 'User cancelled via Stripe';
          }
        } else if (subscription.status === 'incomplete' || subscription.status === 'incomplete_expired') {
          newStatus = 'PENDING';
          newSubscriptionStatus = subscription.status;
        }

        // Check if we need to update anything
        const needsUpdate = 
          newStatus !== order.status ||
          newSubscriptionStatus !== order.subscriptionStatus ||
          (cancelledAt && !order.cancelledAt) ||
          (cancellationReason && !order.cancellationReason);

        if (needsUpdate) {
          const updateData = {
            status: newStatus,
            subscriptionStatus: newSubscriptionStatus
          };

          if (cancelledAt) {
            updateData.cancelledAt = cancelledAt;
          }
          if (cancellationReason) {
            updateData.cancellationReason = cancellationReason;
          }

          await prisma.order.update({
            where: { id: order.id },
            data: updateData
          });

          console.log(`   ✅ Updated order:`);
          console.log(`      Status: ${order.status} → ${newStatus}`);
          console.log(`      Subscription Status: ${order.subscriptionStatus} → ${newSubscriptionStatus}`);
          if (cancelledAt) {
            console.log(`      Cancelled At: ${cancelledAt.toISOString()}`);
          }
          if (cancellationReason) {
            console.log(`      Cancellation Reason: ${cancellationReason}`);
          }
          updatedCount++;
        } else {
          console.log(`   ✅ Order status is already up to date`);
        }

      } catch (error) {
        console.log(`   ❌ Error processing order: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Orders updated: ${updatedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total processed: ${orders.length}`);

  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateOrderStatuses()
  .then(() => {
    console.log('\n🎉 Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
