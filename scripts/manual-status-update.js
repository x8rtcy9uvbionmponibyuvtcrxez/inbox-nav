const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function manualStatusUpdate() {
  console.log('🔄 Manually updating order statuses...\n');

  try {
    // Get all orders
    const orders = await prisma.order.findMany({
      include: {
        onboardingData: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Found ${orders.length} orders\n`);

    let updatedCount = 0;

    for (const order of orders) {
      console.log(`\n🔍 Processing Order: ${order.id}`);
      console.log(`   Product: ${order.productType}`);
      console.log(`   Current Status: ${order.status}`);
      console.log(`   Current Subscription Status: ${order.subscriptionStatus}`);
      console.log(`   Stripe Subscription ID: ${order.stripeSubscriptionId || 'None'}`);
      console.log(`   Created At: ${order.createdAt.toISOString()}`);

      // If order has a subscription ID and is still PENDING, mark as COMPLETED
      if (order.stripeSubscriptionId && order.status === 'PENDING') {
        console.log(`   🔄 Updating PENDING order with subscription to COMPLETED`);
        
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'FULFILLED',
            subscriptionStatus: 'active'
          }
        });

        console.log(`   ✅ Updated order status: PENDING → FULFILLED`);
        updatedCount++;
      } else if (order.stripeSubscriptionId) {
        console.log(`   ✅ Order already has correct status`);
      } else {
        console.log(`   ⚠️  Order has no subscription ID - keeping as is`);
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   ✅ Orders updated: ${updatedCount}`);
    console.log(`   📊 Total processed: ${orders.length}`);

  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
manualStatusUpdate()
  .then(() => {
    console.log('\n🎉 Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
