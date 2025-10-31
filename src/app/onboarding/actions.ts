"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { assertStripe } from '@/lib/stripe';
import { distributeInboxes, validateDistribution } from '@/lib/inbox-distribution';
import { prisma } from '@/lib/prisma';
import { invalidateCache } from '@/lib/redis';
import { ProductType, OrderStatus, InboxStatus, DomainStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { protectSecret } from '@/lib/encryption';
import * as crypto from "node:crypto";
// Notifications are optional; dynamically import when needed to avoid bundling
import { notifyOrderCreated } from '@/lib/notifications';

export type SaveOnboardingInput = {
  inboxCount: number;
  businessName: string;
  domainStatus?: "buy" | "own"; // legacy, mapped from domainSource for compatibility
  domainSource?: 'OWN' | 'BUY_FOR_ME';
  inboxesPerDomain?: number;
  providedDomains?: string[];
  domainList?: string[];
  ownDomains?: string[]; // For OWN domains from onboarding form
  primaryForwardUrl: string;
  // Registrar credentials for OWN domains
  domainRegistrar?: string;
  registrarUsername?: string;
  registrarPassword?: string;
  personas: Array<{ firstName: string; lastName: string; profileImage?: string | null }>;
  warmupTool: "Smartlead" | "Instantly" | "Plusvibe" | "EmailBison" | string; // Allow any string for "Other" tools
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

const PRODUCT_ORDER: ProductType[] = [
  ProductType.EDU,
  ProductType.LEGACY,
  ProductType.RESELLER,
  ProductType.PREWARMED,
  ProductType.AWS,
  ProductType.MICROSOFT,
];

const PRODUCT_PRICE: Record<ProductType, number> = {
  [ProductType.EDU]: 1.5,
  [ProductType.LEGACY]: 2.5,
  [ProductType.RESELLER]: 3,
  [ProductType.PREWARMED]: 7,
  [ProductType.AWS]: 1.25,
  [ProductType.MICROSOFT]: 60,
};

const PRODUCT_MOQ: Record<ProductType, number> = {
  [ProductType.AWS]: 20,
  [ProductType.MICROSOFT]: 1,
  [ProductType.EDU]: 10,
  [ProductType.LEGACY]: 10,
  [ProductType.RESELLER]: 10,
  [ProductType.PREWARMED]: 10,
};

const DEFAULT_INBOXES_PER_DOMAIN: Record<ProductType, number> = {
  [ProductType.MICROSOFT]: 50,
  [ProductType.PREWARMED]: 3,
  [ProductType.EDU]: 3,
  [ProductType.LEGACY]: 3,
  [ProductType.RESELLER]: 3,
  [ProductType.AWS]: 3,
};

// Validation constants
const MAX_INBOX_COUNT = 2000;
const CENTS_PER_DOLLAR = 100;

const isProductType = (value: string): value is ProductType =>
  PRODUCT_ORDER.includes(value as ProductType);

function coerceProductType(value?: string | null): ProductType {
  if (!value) return ProductType.EDU;
  const normalized = value.toUpperCase() === 'GOOGLE' ? ProductType.RESELLER : value.toUpperCase();
  return isProductType(normalized) ? normalized : ProductType.EDU;
}

export async function saveOnboardingAction(input: SaveOnboardingInput) {
  try {

    // Step 1: Verify Clerk authentication
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Authentication failed - no user ID" };
    }

    // Step 2: Validate required fields
    const validationErrors = [] as string[];
    if (!input.businessName?.trim()) validationErrors.push("Business name is required");
    // Primary forwarding URL is optional; may come from Stripe metadata or be omitted
    if (!input.accountId?.trim()) validationErrors.push("Account ID is required");
    if (!input.password?.trim()) validationErrors.push("Password is required");
    if (!input.personas || input.personas.length === 0) validationErrors.push("At least one persona is required");
    // MOQ validation will be done after product type is determined

    if (validationErrors.length > 0) {
      return { success: false, error: `Validation failed: ${validationErrors.join(", ")}` };
    }

    const normalizedProductType = coerceProductType(input.productType);

    const moq = PRODUCT_MOQ[normalizedProductType] ?? 10;
    if (input.inboxCount < moq || input.inboxCount > MAX_INBOX_COUNT) {
      return { success: false, error: `Inbox count must be between ${moq} and ${MAX_INBOX_COUNT} for ${normalizedProductType}` };
    }

    const pricePerInbox = PRODUCT_PRICE[normalizedProductType] ?? 3;
    const totalAmountCents = input.inboxCount * pricePerInbox * CENTS_PER_DOLLAR;

    // Stripe metadata-derived domain configuration (if available)
    let sessionDomainSource: 'OWN' | 'BUY_FOR_ME' | undefined;
    let sessionOwnDomains: string[] | undefined;
    let sessionInboxesPerDomain: number | undefined;
    let sessionForwardingUrl: string | undefined;
    let sessionDomainsNeeded: number | undefined;
    let sessionDomainTLD: '.com' | '.info' | undefined;

    // Step 4: Handle Order creation or retrieval
    let order;
    try {
      if (input.sessionId) {
        const existingOrder = await prisma.order.findFirst({
          where: {
            stripeSessionId: input.sessionId,
            clerkUserId: userId,
          },
        });

        if (existingOrder) {
          order = existingOrder;
        } else {

          try {
            const stripe = assertStripe();
            if (!stripe) {
              throw new Error("Stripe is not configured. Please contact support.");
            }
            const session = await stripe.checkout.sessions.retrieve(input.sessionId, { expand: ['subscription'] });

            if (session.metadata?.clerkUserId !== userId) {
              throw new Error("Session does not belong to current user");
            }

            const sessionProductType = session.metadata?.productType;
            const sessionQuantity = parseInt(session.metadata?.quantity || "0", 10);

            if (!sessionProductType || !sessionQuantity) {
              throw new Error("Invalid session metadata");
            }

            const sessionProductTypeCanonical = coerceProductType(sessionProductType);
            const productPrice = PRODUCT_PRICE[sessionProductTypeCanonical] ?? 3;
            const sessionTotalAmountCents = sessionQuantity * productPrice * 100;

            const subscriptionId = typeof session.subscription === 'string'
              ? session.subscription
              : (session.subscription && 'id' in session.subscription ? (session.subscription as { id?: string | null }).id ?? null : null);

            console.log("[ACTION] Creating order from Stripe session data:", {
              productType: sessionProductTypeCanonical,
              quantity: sessionQuantity,
              totalAmountCents: sessionTotalAmountCents,
              customer: session.customer,
              subscriptionId,
            });

            order = await prisma.order.create({
              data: {
                id: crypto.randomUUID(),
                clerkUserId: userId,
                productType: sessionProductTypeCanonical,
                quantity: sessionQuantity,
                totalAmount: sessionTotalAmountCents,
                status: OrderStatus.PENDING,
                stripeSessionId: input.sessionId,
                stripeCustomerId:
                  typeof session.customer === "string"
                    ? session.customer
                    : session.customer && "id" in session.customer
                      ? ((session.customer as { id?: string | null }).id ?? null)
                      : null,
                stripeSubscriptionId: subscriptionId ?? null,
              },
            });

            // Send order creation notification
            try {
              // Get user's actual email from Clerk
              let userEmail = 'user@example.com'; // fallback
              let userFirstName: string | undefined;
              let userLastName: string | undefined;
              
              if (userId) {
                try {
                  const client = await clerkClient();
                  const user = await client.users.getUser(userId);
                  const primaryEmailId = user.primaryEmailAddressId;
                  const primaryEmail = user.emailAddresses?.find((addr) => addr.id === primaryEmailId);
                  userEmail = primaryEmail?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress ?? 'user@example.com';
                  userFirstName = user.firstName || undefined;
                  userLastName = user.lastName || undefined;
                } catch (clerkError) {
                  console.warn('[ONBOARDING] Failed to fetch user email from Clerk:', clerkError);
                }
              }

              const userData = {
                id: userId,
                email: userEmail,
                firstName: userFirstName,
                lastName: userLastName,
              };

              const orderData = {
                id: order.id,
                productType: sessionProductTypeCanonical,
                quantity: sessionQuantity,
                totalAmount: sessionTotalAmountCents,
                clerkUserId: userId,
                createdAt: order.createdAt,
                businessName: input.businessName || null,
              };

              await notifyOrderCreated(orderData, userData);
              console.log('[ACTION] Order creation notification sent');
            } catch (notificationError) {
              console.error('[ACTION] Failed to send order creation notification:', notificationError);
              // Don't fail the main flow if notification fails
            }

            // Extract domain configuration from session metadata
            try {
              const md = (session.metadata || {}) as Record<string, string | undefined>;
              sessionDomainSource = md.domainSource === 'OWN' || md.domainSource === 'BUY_FOR_ME' ? md.domainSource : undefined;
              sessionInboxesPerDomain = md.inboxesPerDomain ? parseInt(md.inboxesPerDomain, 10) : undefined;
              sessionForwardingUrl = md.forwardingUrl;
              sessionDomainsNeeded = md.domainsNeeded ? parseInt(md.domainsNeeded, 10) : undefined;
              sessionDomainTLD = (md.domainTLD === '.com' || md.domainTLD === '.info') ? (md.domainTLD as '.com' | '.info') : undefined;
              if (md.ownDomains) {
                try { sessionOwnDomains = JSON.parse(md.ownDomains) as string[]; } catch { sessionOwnDomains = []; }
              }
              console.log('[ACTION] Stripe session domain metadata:', {
                domainSource: sessionDomainSource,
                inboxesPerDomain: sessionInboxesPerDomain,
                forwardingUrl: sessionForwardingUrl,
                domainsNeeded: sessionDomainsNeeded,
                domainTLD: sessionDomainTLD,
                ownDomains: sessionOwnDomains,
              });
            } catch (metaErr) {
              console.warn('[ACTION] Failed parsing session metadata for domain config:', metaErr);
            }
          } catch (stripeError) {
            console.error("[ACTION] ❌ Stripe session fetch failed:", stripeError);
            console.error("[ACTION] Stripe error type:", typeof stripeError);
            console.error("[ACTION] Stripe error message:", stripeError instanceof Error ? stripeError.message : 'Not an Error object');
            if (stripeError instanceof Error) console.error("[ACTION] Stripe error stack:", stripeError.stack);
            
            const code =
              typeof stripeError === 'object' && stripeError !== null && 'code' in stripeError
                ? String((stripeError as { code?: string }).code ?? '')
                : '';
            console.error("[ACTION] Stripe error code:", code);
            
            const friendlyMessage =
              code === 'resource_missing'
                ? 'Your checkout session has expired or was already completed. Please start a new checkout.'
                : 'We could not retrieve your checkout session. Please retry or start a new checkout.';
            return { success: false, error: friendlyMessage };
          }
        }
      } else {
        const tempOrderId = crypto.randomUUID();
        console.log("[ACTION] 🆔 Generated temp order ID:", tempOrderId);
        console.log("[ACTION] Step 1: Creating temporary Order...");

        order = await prisma.order.create({
          data: {
            id: tempOrderId,
            clerkUserId: userId,
            productType: normalizedProductType,
            quantity: input.inboxCount,
            totalAmount: totalAmountCents,
            status: OrderStatus.PENDING,
            stripeSessionId: null,
            subscriptionStatus: 'manual',
          },
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

    const orderProductType = coerceProductType(order.productType);
    let derivedInboxesPerDomain =
      sessionInboxesPerDomain ??
      (typeof input.inboxesPerDomain === 'number' ? input.inboxesPerDomain : undefined) ??
      DEFAULT_INBOXES_PER_DOMAIN[orderProductType];

    // Step 5: Create OnboardingData record
    let onboarding;
    try {
      console.log("[ACTION] Step 2: Creating OnboardingData...");
      
      const domainPreferenceList =
        (input.domainSource === 'OWN' || input.domainStatus === 'own')
          ? input.ownDomains ?? input.providedDomains ?? input.domainList ?? []
          : sessionDomainSource === 'OWN'
            ? sessionOwnDomains ?? []
            : [];
      
      derivedInboxesPerDomain =
        sessionInboxesPerDomain ??
        (typeof input.inboxesPerDomain === 'number' ? input.inboxesPerDomain : undefined) ??
        DEFAULT_INBOXES_PER_DOMAIN[orderProductType];

      const onboardingData: Prisma.OnboardingDataUncheckedCreateInput = {
        orderId: order.id, // Use the actual order ID (from existing or newly created)
        clerkUserId: userId,
        productType: orderProductType,
        businessType: input.businessName,
        website: sessionForwardingUrl ?? input.primaryForwardUrl,
        domainPreferences: {
          domains: domainPreferenceList,
          espCredentials: {
            accountId: input.accountId.trim(),
            password: protectSecret(input.password.trim()),
            apiKey: input.apiKey?.trim() ? protectSecret(input.apiKey.trim()) : null,
          },
          internalTags: input.internalTags ?? [],
          espTags: input.espTags ?? [],
        },
        personas: input.personas,
        espProvider: input.warmupTool,
        specialRequirements: input.specialRequirements ?? null,
        stepCompleted: 4,
        isCompleted: true,
        domainSource: sessionDomainSource ?? (input.domainSource ?? (input.domainStatus === 'own' ? 'OWN' : 'BUY_FOR_ME')),
        inboxesPerDomain: derivedInboxesPerDomain,
        providedDomains: (input.domainSource === 'OWN' || input.domainStatus === 'own')
          ? input.ownDomains ?? input.providedDomains ?? input.domainList ?? []
          : sessionDomainSource === 'OWN'
            ? sessionOwnDomains ?? []
            : [],
        calculatedDomainCount: sessionDomainsNeeded ?? null,
        // Registrar credentials for OWN domains (password is encrypted)
        domainRegistrar: input.domainRegistrar ?? null,
        registrarAdminEmail: input.domainRegistrar ? 'team@inboxnavigator.com' : null,
        registrarUsername: input.registrarUsername ?? null,
        registrarPassword: protectSecret(input.registrarPassword?.trim() || null),
      };

      console.log("[ACTION] 📝 OnboardingData payload:", {
        orderId: order.id,
        clerkUserId: userId,
        businessType: onboardingData.businessType,
        website: onboardingData.website,
        personasCount: input.personas.length,
        espProvider: onboardingData.espProvider,
        productType: onboardingData.productType,
        stepCompleted: onboardingData.stepCompleted,
        isCompleted: onboardingData.isCompleted,
      });

      onboarding = await prisma.onboardingData.create({
        data: onboardingData,
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

      const domainSource = sessionDomainSource ?? (input.domainSource ?? (input.domainStatus === 'own' ? 'OWN' : 'BUY_FOR_ME'));
      const productType = coerceProductType(order.productType);
      const personasLite = (input.personas || []).map(p => ({ firstName: p.firstName, lastName: p.lastName }));

      const providedDomains =
        domainSource === 'OWN'
          ? sessionOwnDomains ?? (input.ownDomains ?? input.providedDomains ?? input.domainList ?? [])
          : [];

      const distribution = distributeInboxes({
        productType,
        domainSource,
        totalInboxes: input.inboxCount,
        personas: personasLite,
        providedDomains,
        inboxesPerDomain: derivedInboxesPerDomain,
        businessName: input.businessName,
      });

      console.log('[ACTION] Distribution result:', {
        allocations: distribution.allocations.length,
        domains: distribution.domainsUsed.length,
        shouldCreate: distribution.shouldCreateInboxes,
        message: distribution.message,
      });
      
      console.log('[ACTION] Domain source check:', {
        domainSource,
        sessionDomainSource,
        inputDomainSource: input.domainSource,
        inputDomainStatus: input.domainStatus,
        providedDomains,
        sessionOwnDomains,
        inputOwnDomains: input.ownDomains,
        inputProvidedDomains: input.providedDomains,
        inputDomainList: input.domainList,
      });

      if (!distribution.shouldCreateInboxes) {
        // BUY_FOR_ME branch - set order status and return
        await prisma.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.PENDING },
        });
        // Optionally store calculatedDomainCount on onboarding
        await prisma.onboardingData.update({
          where: { id: onboarding.id },
          data: { calculatedDomainCount: distribution.domainsNeeded },
        });
        // Invalidate dashboard cache for this user before returning
        await invalidateCache(`dashboard:${userId}`);
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
      console.log('[ACTION] Creating domains (batch)...');
      const domainInboxCounts = new Map<string, number>();
      for (const alloc of distribution.allocations) {
        domainInboxCounts.set(alloc.domain, (domainInboxCounts.get(alloc.domain) || 0) + 1);
      }
      const domainData = distribution.domainsUsed.map(domain => ({
        orderId: order.id,
        domain,
        status: DomainStatus.PENDING,
        tags: input.internalTags || [],
        inboxCount: domainInboxCounts.get(domain) || 0,
        forwardingUrl: (sessionForwardingUrl ?? input.primaryForwardUrl) || domain,
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
          firstName: allocation.firstName,
          lastName: allocation.lastName,
          personaName: `${allocation.firstName} ${allocation.lastName}`.trim(),
          espPlatform: input.warmupTool,
          status: InboxStatus.PENDING,
          tags: input.internalTags || [],
          businessName: input.businessName,
          forwardingDomain: (sessionForwardingUrl ?? input.primaryForwardUrl) || allocation.domain,
          password: null,
        }));

        if (inboxData.length > 0) {
          console.log('[ACTION] Creating inboxes with data:', {
            count: inboxData.length,
            firstInbox: inboxData[0],
            orderId: order.id,
          });
          const inboxResult = await tx.inbox.createMany({
            data: inboxData,
            skipDuplicates: true,
          });
          console.log(`[ACTION] ✅ Created inboxes: ${inboxResult.count}`);
          
          // Verify inboxes were created
          const createdInboxes = await tx.inbox.findMany({
            where: { orderId: order.id },
            select: { id: true, email: true, status: true }
          });
          console.log('[ACTION] Verification - inboxes in DB:', createdInboxes);
        } else {
          console.log('[ACTION] ✅ No inboxes to create');
        }
      }, { timeout: 60000, maxWait: 10000 });
      
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
    // Invalidate dashboard cache for this user after successful onboarding
    await invalidateCache(`dashboard:${userId}`);
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
