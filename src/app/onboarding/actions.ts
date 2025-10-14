"use server";

import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client';
import { stripe } from '@/lib/stripe';
import { distributeInboxes, validateDistribution } from '@/lib/inbox-distribution';
import crypto from "node:crypto";

export type SaveOnboardingInput = {
  inboxCount: number;
  businessName: string;
  domainStatus?: "buy" | "own"; // legacy, mapped from domainSource for compatibility
  domainSource?: 'OWN' | 'BUY_FOR_ME';
  inboxesPerDomain?: number;
  providedDomains?: string[];
  domainList?: string[];
  primaryForwardUrl: string;
  personas: Array<{ firstName: string; lastName: string; profileImage?: string | null }>;
  warmupTool: "Smartlead" | "Instantly" | "Plusvibe" | "EmailBison";
  accountId: string;
  password: string;
  apiKey: string;
  notes?: string;
  specialRequirements?: string;
  internalTags?: string[];
  espTags?: string[];
  productType?: string;
  sessionId?: string; // Stripe session ID for existing orders
};

// Helper function to create and manage Prisma client
async function withPrismaClient<T>(operation: (prisma: PrismaClient) => Promise<T>): Promise<T> {
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log("✅ Fresh Prisma client connected");
    
    // Add delay to ensure engine is ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = await operation(prisma);
    return result;
  } finally {
    try {
      await prisma.$disconnect();
      console.log("🔌 Fresh Prisma client disconnected");
    } catch (disconnectError) {
      console.error("⚠️ Error disconnecting fresh Prisma client:", disconnectError);
    }
  }
}

export async function saveOnboardingAction(input: SaveOnboardingInput) {
  try {
    console.log("=== ONBOARDING ACTION STARTED ===");
    console.log("Received parameters:", {
      businessName: input.businessName,
      inboxCount: input.inboxCount,
      domainStatus: input.domainStatus,
      forwardingUrl: input.primaryForwardUrl,
      personaCount: input.personas.length,
      warmupTool: input.warmupTool,
      productType: input.productType,
      quantity: input.inboxCount,
      accountId: input.accountId,
      password: input.password,
      apiKey: input.apiKey,
      hasInternalTags: input.internalTags?.length || 0,
      hasEspTags: input.espTags?.length || 0,
      specialRequirements: input.specialRequirements,
    });
    console.log('[ACTION] Flags:', { hasSessionId: Boolean(input.sessionId) });

    // Step 1: Verify Clerk authentication
    const { userId } = await auth();
    console.log("[ACTION] 🔐 Clerk auth result - userId:", userId);

    if (!userId) {
      console.error("❌ No userId from Clerk auth");
      return { success: false, error: "Authentication failed - no user ID" };
    }

    // Step 2: Validate required fields
    const validationErrors = [] as string[];
    if (!input.businessName?.trim()) validationErrors.push("Business name is required");
    if (!input.primaryForwardUrl?.trim()) validationErrors.push("Primary forwarding URL is required");
    if (!input.accountId?.trim()) validationErrors.push("Account ID is required");
    if (!input.password?.trim()) validationErrors.push("Password is required");
    if (!input.apiKey?.trim()) validationErrors.push("API Key is required");
    if (!input.personas || input.personas.length === 0) validationErrors.push("At least one persona is required");
    if (input.inboxCount < 10 || input.inboxCount > 2000) validationErrors.push("Inbox count must be between 10 and 2000");

    if (validationErrors.length > 0) {
      console.error("❌ Validation errors:", validationErrors);
      return { success: false, error: `Validation failed: ${validationErrors.join(", ")}` };
    }

    // Step 3: Calculate pricing (in cents)
    const pricePerInbox = input.productType === 'GOOGLE' ? 3 : input.productType === 'PREWARMED' ? 7 : 50;
    const totalAmountCents = input.inboxCount * pricePerInbox * 100; // Convert to cents
    console.log("[ACTION] 💰 Pricing calculation:", {
      productType: input.productType,
      pricePerInbox: pricePerInbox,
      quantity: input.inboxCount,
      totalAmountDollars: input.inboxCount * pricePerInbox,
      totalAmountCents: totalAmountCents,
    });

    // Step 4: Handle Order creation or retrieval
    let order;
    try {
      if (input.sessionId) {
        console.log("[ACTION] Step 1: Processing Stripe session:", input.sessionId);
        
        order = await withPrismaClient(async (prisma) => {
          // First, check if order already exists for this Stripe session
          console.log('[ACTION] Checking for existing order by stripeSessionId');
          const existingOrder = await prisma.order.findFirst({
            where: {
              stripeSessionId: input.sessionId,
              clerkUserId: userId,
            },
          });
          
          if (existingOrder) {
            console.log("[ACTION] ✅ Found existing order:", existingOrder.id);
            return existingOrder;
          }
          
          // Order doesn't exist yet, fetch from Stripe and create
          console.log("[ACTION] Order not found, fetching from Stripe...");
          
          try {
            const session = await stripe.checkout.sessions.retrieve(input.sessionId!);
            console.log("[ACTION] ✅ Stripe session retrieved:", {
              id: session.id,
              paymentStatus: session.payment_status,
              customer: session.customer,
              metadata: session.metadata,
            });
            
            // Validate session belongs to this user
            if (session.metadata?.clerkUserId !== userId) {
              throw new Error("Session does not belong to current user");
            }
            
            // Extract data from session metadata
            const sessionProductType = session.metadata?.productType;
            const sessionQuantity = parseInt(session.metadata?.quantity || '0');
            
            if (!sessionProductType || !sessionQuantity) {
              throw new Error("Invalid session metadata");
            }
            
            // Calculate pricing from session data
            const getProductPrice = (productType: string) => {
              switch (productType) {
                case 'GOOGLE': return 3;
                case 'PREWARMED': return 7;
                case 'MICROSOFT': return 50;
                default: return 3;
              }
            };
            
            const productPrice = getProductPrice(sessionProductType);
            const sessionTotalAmountCents = sessionQuantity * productPrice * 100;
            
            console.log("[ACTION] Creating order from Stripe session data:", {
              productType: sessionProductType,
              quantity: sessionQuantity,
              totalAmountCents: sessionTotalAmountCents,
              customer: session.customer,
            });
            
            // Create new order with Stripe session data
                return await prisma.order.create({
              data: {
                id: crypto.randomUUID(),
                clerkUserId: userId,
                productType: sessionProductType,
                quantity: sessionQuantity,
                totalAmount: sessionTotalAmountCents,
                status: "PAID",
                stripeSessionId: input.sessionId,
                    stripeCustomerId: typeof session.customer === 'string' 
                      ? session.customer 
                      : (session.customer && 'id' in session.customer ? (session.customer as { id?: string | null }).id ?? null : null),
              },
            });
          } catch (stripeError) {
            console.error("[ACTION] ❌ Stripe session fetch failed:", stripeError);
            if (stripeError instanceof Error) console.error('[ACTION] Stripe error stack:', stripeError.stack);
            throw new Error(`Failed to fetch Stripe session: ${stripeError instanceof Error ? stripeError.message : 'Unknown error'}`);
          }
        });
      } else {
        // Create temporary order for non-Stripe flow
        const tempOrderId = crypto.randomUUID();
        console.log("[ACTION] 🆔 Generated temp order ID:", tempOrderId);
        console.log("[ACTION] Step 1: Creating temporary Order...");
        
        order = await withPrismaClient(async (prisma) => {
          return await prisma.order.create({
            data: {
              id: tempOrderId,
              clerkUserId: userId,
              productType: input.productType || 'GOOGLE',
              quantity: input.inboxCount,
              totalAmount: totalAmountCents,
              status: "PENDING",
              stripeSessionId: `temp_${tempOrderId}`,
            },
          });
        });
      }
      
      console.log("[ACTION] ✅ Order processed:", order.id);
    } catch (orderError) {
      console.error("❌ Failed to process order - Full error:", orderError);
      console.error("❌ Order error details:", {
        name: orderError instanceof Error ? orderError.name : 'Unknown',
        message: orderError instanceof Error ? orderError.message : 'Unknown error',
        stack: orderError instanceof Error ? orderError.stack : undefined,
      });
      return { success: false, error: `Failed to process order: ${orderError instanceof Error ? orderError.message : 'Unknown error'}` };
    }

    // Step 5: Create OnboardingData record with fresh Prisma client
    let onboarding;
    try {
      console.log("[ACTION] Step 2: Creating OnboardingData...");
      
      const onboardingData = {
        orderId: order.id, // Use the actual order ID (from existing or newly created)
        clerkUserId: userId,
        productType: order.productType, // Use productType from order (Stripe session data)
        businessType: input.businessName,
        website: input.primaryForwardUrl,
        domainPreferences: (input.domainSource === 'OWN' || input.domainStatus === 'own') ? (input.providedDomains ?? input.domainList ?? []) : [],
        personas: input.personas,
        espProvider: input.warmupTool,
        specialRequirements: input.specialRequirements ?? null,
        stepCompleted: 4,
        isCompleted: true,
        domainSource: input.domainSource ?? (input.domainStatus === 'own' ? 'OWN' : 'BUY_FOR_ME'),
        inboxesPerDomain: input.inboxesPerDomain ?? (order.productType === 'GOOGLE' ? 3 : order.productType === 'PREWARMED' ? 5 : 0),
        providedDomains: (input.domainSource === 'OWN' || input.domainStatus === 'own') ? (input.providedDomains ?? input.domainList ?? []) : [],
        calculatedDomainCount: null,
      };

      console.log("[ACTION] 📝 OnboardingData payload:", {
        orderId: onboardingData.orderId,
        clerkUserId: onboardingData.clerkUserId,
        businessType: onboardingData.businessType,
        website: onboardingData.website,
        personasCount: onboardingData.personas.length,
        espProvider: onboardingData.espProvider,
        productType: onboardingData.productType,
        stepCompleted: onboardingData.stepCompleted,
        isCompleted: onboardingData.isCompleted,
      });

      onboarding = await withPrismaClient(async (prisma) => {
        return await prisma.onboardingData.create({
          data: onboardingData,
        });
      });

      console.log("[ACTION] ✅ OnboardingData created:", onboarding.id);
    } catch (onboardingError) {
      console.error("❌ Failed to create onboarding data - Full error:", onboardingError);
      console.error("❌ OnboardingData error details:", {
        name: onboardingError instanceof Error ? onboardingError.name : 'Unknown',
        message: onboardingError instanceof Error ? onboardingError.message : 'Unknown error',
        stack: onboardingError instanceof Error ? onboardingError.stack : undefined,
      });
      return { success: false, error: `Failed to save onboarding data: ${onboardingError instanceof Error ? onboardingError.message : 'Unknown error'}` };
    }

    // Step 6: Generate inboxes and domains or mark for domain purchase
    try {
      console.log("[ACTION] Step 3: Determining inbox generation strategy...");

      const domainSource = input.domainSource ?? (input.domainStatus === 'own' ? 'OWN' : 'BUY_FOR_ME');
      const productType = (order.productType as 'GOOGLE' | 'PREWARMED' | 'MICROSOFT');
      const personasLite = (input.personas || []).map(p => ({ firstName: p.firstName, lastName: p.lastName }));

      const distribution = distributeInboxes({
        productType,
        domainSource,
        totalInboxes: input.inboxCount,
        personas: personasLite,
        providedDomains: domainSource === 'OWN' ? (input.providedDomains ?? input.domainList ?? []) : [],
        inboxesPerDomain: input.inboxesPerDomain,
        businessName: input.businessName,
      });

      console.log('[ACTION] Distribution result:', {
        allocations: distribution.allocations.length,
        domains: distribution.domainsUsed.length,
        shouldCreate: distribution.shouldCreateInboxes,
        message: distribution.message,
      });

      if (!distribution.shouldCreateInboxes) {
        // BUY_FOR_ME branch - set order status and return
        const prisma = new PrismaClient();
        await prisma.$connect();
        try {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'PENDING_DOMAIN_PURCHASE' }
          });
          // Optionally store calculatedDomainCount on onboarding
          await prisma.onboardingData.update({
            where: { id: onboarding.id },
            data: { calculatedDomainCount: distribution.domainsNeeded }
          });
        } finally {
          await prisma.$disconnect();
        }
        return {
          success: true,
          orderId: order.id,
          onboardingId: onboarding.id,
          message: distribution.message,
        };
      }

      // OWN domains - validate uniqueness
      validateDistribution(distribution);
      console.log('[ACTION] ✅ Distribution validated (unique emails)');
      
      // Create domains and inboxes in a transaction
      // Use a dedicated Prisma client and a single long-running transaction for domain + inbox generation
      const prisma = new PrismaClient();
      await prisma.$connect();
      try {
        console.log('[ACTION] Creating domains (batch)...');
        const domainInboxCounts = new Map<string, number>();
        for (const alloc of distribution.allocations) {
          domainInboxCounts.set(alloc.domain, (domainInboxCounts.get(alloc.domain) || 0) + 1);
        }
        const domainData = distribution.domainsUsed.map(domain => ({
          orderId: order.id,
          domain,
          status: 'PENDING' as const,
          tags: input.internalTags || [],
          inboxCount: domainInboxCounts.get(domain) || 0,
          forwardingUrl: input.primaryForwardUrl,
          businessName: input.businessName,
        }));

        await prisma.$transaction(async (tx) => {
          // Batch create domains
          if (domainData.length > 0) {
            const domainResult = await tx.domain.createMany({
              data: domainData,
              skipDuplicates: true,
            });
            console.log(`[ACTION] ✅ Created domains: ${domainResult.count}`);
          } else {
            console.log('[ACTION] ✅ No domains to create');
          }

          console.log('[ACTION] Creating inboxes...');
          const inboxData = distribution.allocations.map(allocation => ({
            orderId: order.id,
            email: allocation.email,
            personaName: allocation.personaName,
            espPlatform: input.warmupTool,
            status: 'PENDING' as const,
            tags: input.internalTags || [],
            businessName: input.businessName,
            forwardingDomain: input.primaryForwardUrl,
            password: null,
          }));

          if (inboxData.length > 0) {
            const inboxResult = await tx.inbox.createMany({
              data: inboxData,
              skipDuplicates: true,
            });
            console.log(`[ACTION] ✅ Created inboxes: ${inboxResult.count}`);
          } else {
            console.log('[ACTION] ✅ No inboxes to create');
          }
        }, { timeout: 60000, maxWait: 10000 });
      } finally {
        await prisma.$disconnect();
      }
      
      console.log("[ACTION] ✅ Inboxes and domains generated successfully!");
      
    } catch (generationError) {
      console.error("❌ Failed to generate inboxes and domains - Full error:", generationError);
      console.error("❌ Generation error details:", {
        name: generationError instanceof Error ? generationError.name : 'Unknown',
        message: generationError instanceof Error ? generationError.message : 'Unknown error',
        stack: generationError instanceof Error ? generationError.stack : undefined,
      });
      // Don't fail the entire onboarding if inbox generation fails
      console.warn("⚠️ Continuing without inbox generation due to error");
    }

    console.log("[ACTION] 🎉 Onboarding submission completed successfully!");
    console.log("[ACTION] 🎉 Final result:", { success: true, orderId: order.id, onboardingId: onboarding.id });
    return { success: true, orderId: order.id, onboardingId: onboarding.id };
  } catch (error: unknown) {
    console.error("[ACTION] === ACTION CRASHED ===");
    const errName = error instanceof Error ? error.name : 'Unknown';
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : undefined;
    console.error("[ACTION] Error name:", errName);
    console.error("[ACTION] Error message:", errMsg);
    try { console.error("[ACTION] Full error:", JSON.stringify(error, null, 2)); } catch {}
    console.error("[ACTION] Stack trace:", errStack);
    return { 
      success: false, 
      error: errMsg
    };
  }
}


