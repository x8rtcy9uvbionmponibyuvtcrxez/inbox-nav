const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyOrders() {
  console.log('📋 Current order status verification...\n');

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

    console.log(`📊 Found ${orders.length} orders\n`);

    for (const order of orders) {
      console.log(`\n📦 Order: ${order.id}`);
      console.log(`   Product: ${order.productType}`);
      console.log(`   Quantity: ${order.quantity}`);
      console.log(`   Amount: $${(order.totalAmount / 100).toFixed(2)}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Subscription Status: ${order.subscriptionStatus}`);
      console.log(`   Stripe Session ID: ${order.stripeSessionId || 'None'}`);
      console.log(`   Stripe Subscription ID: ${order.stripeSubscriptionId || 'None'}`);
      console.log(`   Business Name: ${order.businessName || 'None'}`);
      console.log(`   Created: ${order.createdAt.toISOString()}`);
      console.log(`   Updated: ${order.updatedAt.toISOString()}`);
      
      if (order.cancelledAt) {
        console.log(`   Cancelled At: ${order.cancelledAt.toISOString()}`);
      }
      if (order.cancellationReason) {
        console.log(`   Cancellation Reason: ${order.cancellationReason}`);
      }

      // Check if order has proper subscription data
      const hasSubscription = Boolean(order.stripeSubscriptionId);
      const hasCorrectStatus = order.status === 'FULFILLED' || order.status === 'CANCELLED';
      const hasCorrectSubStatus = order.subscriptionStatus === 'active' || 
                                 order.subscriptionStatus === 'cancelled' || 
                                 order.subscriptionStatus === 'cancel_at_period_end';

      console.log(`   ✅ Has Subscription: ${hasSubscription ? 'Yes' : 'No'}`);
      console.log(`   ✅ Correct Status: ${hasCorrectStatus ? 'Yes' : 'No'}`);
      console.log(`   ✅ Correct Sub Status: ${hasCorrectSubStatus ? 'Yes' : 'No'}`);
    }

    // Summary
    const ordersWithSubscriptions = orders.filter(o => o.stripeSubscriptionId).length;
    const ordersFulfilled = orders.filter(o => o.status === 'FULFILLED').length;
    const ordersCancelled = orders.filter(o => o.status === 'CANCELLED').length;

    console.log(`\n📈 Summary:`);
    console.log(`   📊 Total Orders: ${orders.length}`);
    console.log(`   🎯 Orders with Subscriptions: ${ordersWithSubscriptions}`);
    console.log(`   ✅ Fulfilled Orders: ${ordersFulfilled}`);
    console.log(`   ❌ Cancelled Orders: ${ordersCancelled}`);
    console.log(`   ⏳ Pending Orders: ${orders.length - ordersFulfilled - ordersCancelled}`);

  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
verifyOrders()
  .then(() => {
    console.log('\n🎉 Verification completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
