"use server";

import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export type CSVRow = Record<string, string>;

export async function markOrderAsFulfilledAction(
  orderId: string,
  csvData?: CSVRow[]
) {
  try {
    console.log("[FULFILLMENT] Starting fulfillment process for order:", orderId);
    
    // Step 1: Verify admin access
    const { userId } = await auth();
    const adminIds = (process.env.ADMIN_USER_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
    
    if (!userId || !adminIds.includes(userId)) {
      console.error("[FULFILLMENT] Unauthorized access attempt");
      return { success: false, error: "Unauthorized" };
    }

    const prisma = new PrismaClient();
    await prisma.$connect();

    // Step 2: Get order with related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        onboardingData: true,
        domains: true,
        inboxes: true,
      }
    });

    if (!order) {
      await prisma.$disconnect();
      return { success: false, error: "Order not found" };
    }

    const onboarding = order.onboardingData?.[0] || order.onboardingData;
    const isOwn = (onboarding?.domainSource ?? 'BUY_FOR_ME') === 'OWN';

    console.log("[FULFILLMENT] Order details:", {
      orderId: order.id,
      status: order.status,
      productType: order.productType,
      isOwn,
      hasCsvData: Boolean(csvData && csvData.length > 0)
    });

    // Step 3: Process CSV data if provided
    if (csvData && csvData.length > 0) {
      console.log("[FULFILLMENT] Processing CSV data:", csvData.length, "rows");
      
      if (isOwn) {
        // OWN domains: Update existing inboxes with passwords
        await processOwnDomainsCsv(prisma, orderId, csvData);
      } else {
        // BUY_FOR_ME: Create domains and inboxes from CSV
        await processBuyForMeCsv(prisma, orderId, csvData);
      }
    }

    // Step 4: Update order status and fulfillment timestamps
    const fulfillmentTime = new Date();
    
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { 
          status: 'FULFILLED',
          updatedAt: fulfillmentTime
        }
      });

      // Update all inboxes with fulfillment timestamp
      await tx.inbox.updateMany({
        where: { orderId },
        data: { 
          status: 'LIVE',
          fulfilledAt: fulfillmentTime,
          updatedAt: fulfillmentTime
        }
      });

      // Update all domains with fulfillment timestamp
      await tx.domain.updateMany({
        where: { orderId },
        data: { 
          status: 'LIVE',
          fulfilledAt: fulfillmentTime,
          updatedAt: fulfillmentTime
        }
      });
    });

    console.log("[FULFILLMENT] ✅ Order fulfilled successfully");
    
    await prisma.$disconnect();
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
    
    return { 
      success: true, 
      message: `Order fulfilled successfully. ${isOwn ? 'Passwords updated' : 'Domains and inboxes created'}.` 
    };

  } catch (error) {
    console.error("[FULFILLMENT] Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
}

async function processOwnDomainsCsv(prisma: PrismaClient, orderId: string, csvData: CSVRow[]) {
  console.log("[FULFILLMENT] Processing OWN domains CSV");
  
  const updates = [];
  
  for (const row of csvData) {
    const { email, password } = row;
    
    if (!email || !password) {
      console.warn("[FULFILLMENT] Skipping row with missing email or password:", row);
      continue;
    }

    updates.push(
      prisma.inbox.updateMany({
        where: { 
          orderId,
          email: email.trim()
        },
        data: { 
          password: password.trim(),
          updatedAt: new Date()
        }
      })
    );
  }

  await Promise.all(updates);
  console.log(`[FULFILLMENT] ✅ Updated ${updates.length} inbox passwords`);
}

async function processBuyForMeCsv(prisma: PrismaClient, orderId: string, csvData: CSVRow[]) {
  console.log("[FULFILLMENT] Processing BUY_FOR_ME CSV");
  
  // Group by domain to create domain records
  const domainMap = new Map<string, string[]>();
  const inboxData = [];
  
  for (const row of csvData) {
    const { domain, email, personaName, password } = row;
    
    if (!domain || !email || !personaName || !password) {
      console.warn("[FULFILLMENT] Skipping row with missing data:", row);
      continue;
    }

    const domainName = domain.trim();
    if (!domainMap.has(domainName)) {
      domainMap.set(domainName, []);
    }
    domainMap.get(domainName)!.push(email.trim());

    inboxData.push({
      orderId,
      email: email.trim(),
      personaName: personaName.trim(),
      domain: domainName,
      password: password.trim(),
      espPlatform: 'Smartlead', // Default, could be from onboarding data
      status: 'PENDING',
      tags: [],
      businessName: '', // Will be set from order data
      forwardingDomain: null,
    });
  }

  // Create domains
  const domainRecords = Array.from(domainMap.entries()).map(([domain, emails]) => ({
    orderId,
    domain,
    status: 'PENDING',
    inboxCount: emails.length,
    forwardingUrl: '',
    businessName: '',
    tags: []
  }));

  if (domainRecords.length > 0) {
    await prisma.domain.createMany({
      data: domainRecords,
      skipDuplicates: true
    });
    console.log(`[FULFILLMENT] ✅ Created ${domainRecords.length} domains`);
  }

  // Create inboxes
  if (inboxData.length > 0) {
    await prisma.inbox.createMany({
      data: inboxData,
      skipDuplicates: true
    });
    console.log(`[FULFILLMENT] ✅ Created ${inboxData.length} inboxes`);
  }
}