"use server";

import { auth } from "@clerk/nextjs/server";
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type CSVRow = Record<string, string>;

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    onboardingData: true;
    domains: true;
    inboxes: true;
  };
}>;

const normalizeStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }
  if (typeof value === 'string') {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

export async function markOrderAsFulfilledAction(
  orderId: string,
  csvData?: CSVRow[],
  uniformPassword?: string
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

    // Using shared Prisma instance

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
        await processBuyForMeCsv(prisma, order, csvData);
      }
    }

    // For OWN domains, create inboxes if they don't exist
    if (isOwn) {
      console.log("[FULFILLMENT] Creating inboxes for OWN domains order", orderId);
      
      // Get the onboarding data to extract domain info
      const onboardingData = await prisma.onboardingData.findFirst({
        where: { orderId }
      });
      
      if (onboardingData) {
        // Safely extract arrays from JSON fields
        const providedDomains = Array.isArray(onboardingData.providedDomains) 
          ? onboardingData.providedDomains as string[]
          : [];
        const personas = Array.isArray(onboardingData.personas) 
          ? onboardingData.personas as any[]
          : [];
        const inboxesPerDomain = typeof onboardingData.inboxesPerDomain === 'number' 
          ? onboardingData.inboxesPerDomain 
          : 3;
        const businessName = typeof onboardingData.businessType === 'string' 
          ? onboardingData.businessType 
          : '';
        
        if (providedDomains.length > 0 && personas.length > 0) {
          // Import the distribution logic
          const { distributeInboxes } = await import('@/lib/inbox-distribution');
          
          const distribution = distributeInboxes({
            productType: order.productType as 'GOOGLE' | 'PREWARMED' | 'MICROSOFT',
            domainSource: 'OWN',
            totalInboxes: order.quantity,
            personas: personas.map((p: any) => ({
              firstName: p.firstName || p.first_name || '',
              lastName: p.lastName || p.last_name || ''
            })),
            providedDomains,
            inboxesPerDomain,
            businessName
          });
          
          if (distribution.shouldCreateInboxes && distribution.allocations.length > 0) {
            console.log(`[FULFILLMENT] Creating ${distribution.allocations.length} inboxes for OWN domains`);
            
            // Create domains first
            const domainInserts = distribution.domainsUsed.map(domain => ({
              orderId,
              domain,
              status: 'LIVE' as const,
              inboxCount: 0, // Will be updated after inbox creation
              forwardingUrl: onboardingData.website || '',
              tags: [],
              businessName,
              createdAt: new Date(),
              updatedAt: new Date()
            }));
            
            await prisma.domain.createMany({
              data: domainInserts,
              skipDuplicates: true
            });
            
            // Create inboxes
            const inboxInserts = distribution.allocations.map(allocation => ({
              orderId,
              email: allocation.email,
              personaName: allocation.personaName,
              password: uniformPassword?.trim() || 'temp_password_123',
              espPlatform: onboardingData.espProvider || 'Smartlead',
              status: 'LIVE' as const,
              tags: [],
              businessName,
              forwardingDomain: allocation.domain,
              createdAt: new Date(),
              updatedAt: new Date()
            }));
            
            await prisma.inbox.createMany({
              data: inboxInserts,
              skipDuplicates: true
            });
            
            // Update domain inbox counts
            for (const domain of distribution.domainsUsed) {
              const count = distribution.allocations.filter(a => a.domain === domain).length;
              await prisma.domain.updateMany({
                where: { orderId, domain },
                data: { inboxCount: count }
              });
            }
            
            console.log(`[FULFILLMENT] ✅ Created ${inboxInserts.length} inboxes across ${distribution.domainsUsed.length} domains`);
          }
        } else {
          console.warn("[FULFILLMENT] Missing domain or persona data for OWN order", orderId);
        }
      } else {
        console.warn("[FULFILLMENT] No onboarding data found for OWN order", orderId);
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
    
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/orders');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/inboxes');
    revalidatePath('/dashboard/domains');
    
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

async function processOwnDomainsCsv(db: typeof prisma, orderId: string, csvData: CSVRow[]) {
  console.log("[FULFILLMENT] Processing OWN domains CSV");
  
  // Get order and onboarding data for business name
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { onboardingData: true }
  });
  
  const businessName = order?.onboardingData?.[0]?.businessType || order?.businessName || '';
  
  const updates = [];
  const creates = [];
  const domainsToCreate = new Set<string>();
  
  for (const row of csvData) {
    const { email, password, domain, personaName } = row;
    
    if (!email || !password) {
      console.warn("[FULFILLMENT] Skipping row with missing email or password:", row);
      continue;
    }

    // Track domains that need to be created
    if (domain) {
      domainsToCreate.add(domain.trim());
    }

    // Check if inbox already exists
    const existingInbox = await db.inbox.findFirst({
      where: { 
        orderId,
        email: email.trim()
      }
    });

    if (existingInbox) {
      // Update existing inbox
      updates.push(
        db.inbox.updateMany({
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
    } else {
      // Create new inbox if it doesn't exist
      creates.push({
        orderId,
        email: email.trim(),
        personaName: personaName || 'Unknown',
        password: password.trim(),
        espPlatform: 'Smartlead',
        status: 'LIVE' as const,
        tags: [],
        businessName,
        forwardingDomain: domain || null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  // Create domains first
  if (domainsToCreate.size > 0) {
    const domainInserts = Array.from(domainsToCreate).map(domain => ({
      orderId,
      domain,
      status: 'LIVE' as const,
      inboxCount: 0, // Will be updated after inbox creation
      forwardingUrl: order?.onboardingData?.[0]?.website || '',
      tags: [],
      businessName,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    await db.domain.createMany({
      data: domainInserts,
      skipDuplicates: true
    });
    
    console.log(`[FULFILLMENT] ✅ Created ${domainInserts.length} domains`);
  }

  // Execute updates and creates
  if (updates.length > 0) {
    await Promise.all(updates);
    console.log(`[FULFILLMENT] ✅ Updated ${updates.length} inbox passwords`);
  }
  
  if (creates.length > 0) {
    await db.inbox.createMany({
      data: creates,
      skipDuplicates: true
    });
    console.log(`[FULFILLMENT] ✅ Created ${creates.length} new inboxes`);
    
    // Update domain inbox counts
    for (const domain of domainsToCreate) {
      const count = creates.filter(c => c.forwardingDomain === domain).length;
      await db.domain.updateMany({
        where: { orderId, domain },
        data: { inboxCount: count }
      });
    }
    
    console.log(`[FULFILLMENT] ✅ Updated domain inbox counts`);
  }
}

async function processBuyForMeCsv(db: typeof prisma, order: OrderWithRelations, csvData: CSVRow[]) {
  console.log("[FULFILLMENT] Processing BUY_FOR_ME CSV");

  const onboarding = Array.isArray(order.onboardingData)
    ? order.onboardingData[0]
    : order.onboardingData;
  const onboardingRecord =
    onboarding && typeof onboarding === 'object'
      ? (onboarding as Record<string, unknown>)
      : {};

  const getField = (field: string): string | undefined => {
    const value = onboardingRecord[field];
    if (value == null) return undefined;
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === 'string' ? item : String(item ?? '')))
        .join(',');
    }
    return String(value);
  };

  // Prefer Order businessName; fallback to onboarding data
  const defaultBusinessName = getField('businessType') || getField('website') || '';
  const defaultForwarding = getField('website') ?? '';
  const tags = normalizeStringArray(onboardingRecord['internalTags']);
  const espProvider = getField('espProvider') ?? 'Smartlead';

  type DomainEntry = {
    emails: string[];
    forwardingUrl?: string;
  };

  const domainMap = new Map<string, DomainEntry>();
  const inboxData: Array<{
    orderId: string;
    email: string;
    personaName: string;
    password: string;
    espPlatform: string;
    status: string;
    tags: string[];
    businessName: string;
    forwardingDomain: string | null;
  }> = [];

  for (const row of csvData) {
    const rawDomain =
      row.domain ??
      row.Domain ??
      row.DOMAIN ??
      (row.forwardingDomain ?? row.forwarding_url ?? row.forwardingUrl ?? '');
    const { email, personaName, password } = row;

    if (!rawDomain || !email || !personaName || !password) {
      console.warn("[FULFILLMENT] Skipping row with missing data:", row);
      continue;
    }

    const domainName = rawDomain.trim();
    const forwardingValue =
      (row.forwardingUrl ??
        row.forwarding_url ??
        row.forwardingDomain ??
        row.forwardTo ??
        row.forward ??
        domainName)?.trim() || defaultForwarding;

    const entry = domainMap.get(domainName) ?? { emails: [], forwardingUrl: undefined };
    entry.emails.push(email.trim());
    if (!entry.forwardingUrl && forwardingValue) {
      entry.forwardingUrl = forwardingValue;
    }
    domainMap.set(domainName, entry);

    // Row-level business name: CSV value overrides defaults; Order wins already applied above
    const rowBusinessName = (row.business_name ?? row.businessName)?.trim() || defaultBusinessName;

    inboxData.push({
      orderId: order.id,
      email: email.trim(),
      personaName: personaName.trim(),
      password: password.trim(),
      espPlatform: espProvider,
      status: 'PENDING',
      tags,
      businessName: rowBusinessName,
      forwardingDomain: forwardingValue || null,
    });
  }

  const now = new Date();

  const domainRecords = Array.from(domainMap.entries()).map(([domain, info]) => ({
    orderId: order.id,
    domain,
    status: 'LIVE',
    inboxCount: info.emails.length,
    forwardingUrl: info.forwardingUrl ?? defaultForwarding,
    businessName: defaultBusinessName,
    tags,
    fulfilledAt: now,
    updatedAt: now,
  }));

  if (domainRecords.length > 0) {
    await db.domain.createMany({
      data: domainRecords,
      skipDuplicates: true,
    });
    for (const record of domainRecords) {
      await db.domain.updateMany({
        where: { orderId: order.id, domain: record.domain },
        data: {
          inboxCount: record.inboxCount,
          forwardingUrl: record.forwardingUrl,
          businessName: record.businessName,
          tags: record.tags,
          status: 'LIVE',
          fulfilledAt: now,
          updatedAt: now,
        },
      });
    }
    console.log(`[FULFILLMENT] ✅ Created/updated ${domainRecords.length} domains`);
  }

  if (inboxData.length > 0) {
    const inboxCreatePayload = inboxData.map((inbox) => ({
      ...inbox,
      status: 'LIVE' as const,
      fulfilledAt: now,
      updatedAt: now,
    }));

    await db.inbox.createMany({
      data: inboxCreatePayload,
      skipDuplicates: true,
    });
    for (const inbox of inboxCreatePayload) {
      await db.inbox.updateMany({
        where: { orderId: order.id, email: inbox.email },
        data: {
          password: inbox.password,
          espPlatform: inbox.espPlatform,
          tags: inbox.tags,
          businessName: inbox.businessName,
          forwardingDomain: inbox.forwardingDomain,
          status: 'LIVE',
          fulfilledAt: now,
          updatedAt: now,
        },
      });
    }
    console.log(`[FULFILLMENT] ✅ Created/updated ${inboxData.length} inboxes`);
  }
}
