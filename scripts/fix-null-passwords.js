const { PrismaClient, InboxStatus } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixNullPasswords() {
  try {
    console.log('[FIX] Finding inboxes with null passwords on fulfilled orders...');
    
    // Find all inboxes with null passwords where the order is fulfilled
    const inboxesWithNullPasswords = await prisma.inbox.findMany({
      where: {
        password: null,
        status: InboxStatus.LIVE,
        order: {
          status: 'FULFILLED'
        }
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            productType: true
          }
        }
      }
    });

    console.log(`[FIX] Found ${inboxesWithNullPasswords.length} inboxes with null passwords`);

    if (inboxesWithNullPasswords.length === 0) {
      console.log('[FIX] ✅ No inboxes need fixing!');
      return;
    }

    // Group by order ID
    const inboxesByOrder = inboxesWithNullPasswords.reduce((acc, inbox) => {
      const orderId = inbox.order.id;
      if (!acc[orderId]) {
        acc[orderId] = [];
      }
      acc[orderId].push(inbox);
      return acc;
    }, {});

    console.log(`[FIX] Affected orders: ${Object.keys(inboxesByOrder).length}`);
    
    // Default password for fulfilled orders without passwords
    const defaultPassword = 'TempPass2024!';
    
    // Update each order's inboxes
    for (const [orderId, inboxes] of Object.entries(inboxesByOrder)) {
      console.log(`\n[FIX] Processing order ${orderId} (${inboxes.length} inboxes)`);
      console.log(`[FIX] Sample emails: ${inboxes.slice(0, 3).map(i => i.email).join(', ')}`);
      
      const result = await prisma.inbox.updateMany({
        where: {
          orderId: orderId,
          password: null
        },
        data: {
          password: defaultPassword,
          updatedAt: new Date()
        }
      });
      
      console.log(`[FIX] ✅ Updated ${result.count} inboxes with password: ${defaultPassword}`);
    }

    console.log('\n[FIX] ✅ All inboxes updated successfully!');
    console.log(`[FIX] Password set to: ${defaultPassword}`);
    
  } catch (error) {
    console.error('[FIX] ❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixNullPasswords();

