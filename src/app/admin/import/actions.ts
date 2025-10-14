"use server";

import { requireAdmin } from '@/lib/admin-auth';
import { PrismaClient, Prisma } from '@prisma/client';
import { encryptPassword } from '@/lib/encryption';
import { sendClerkInvitation } from '@/lib/clerk-invites';

export type CSVRow = Record<string, string>;

export type ImportResult = {
  success: boolean;
  message: string;
  stats?: {
    totalRows: number;
    processedRows: number;
    skippedRows: number;
    errors: string[];
  };
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  preview: CSVRow[];
};

/**
 * Validates CSV data before import
 */
export async function validateCSVAction(csvData: CSVRow[]): Promise<ValidationResult> {
  try {
    await requireAdmin();
    
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!csvData || csvData.length === 0) {
      return {
        isValid: false,
        errors: ['CSV file is empty'],
        warnings: [],
        preview: []
      };
    }
    
    // Check required columns
    const requiredColumns = ['external_id', 'client_email', 'product_type', 'quantity', 'business_name'];
    const firstRow = csvData[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }
    
    // Validate each row
    const validRows: CSVRow[] = [];
    
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const rowNum = i + 1;
      const rowErrors: string[] = [];
      
      // Validate external_id
      if (!row.external_id?.trim()) {
        rowErrors.push(`Row ${rowNum}: external_id is required`);
      }
      
      // Validate client_email
      if (!row.client_email?.trim()) {
        rowErrors.push(`Row ${rowNum}: client_email is required`);
      } else if (!isValidEmail(row.client_email)) {
        rowErrors.push(`Row ${rowNum}: invalid email format`);
      }
      
      // Validate product_type
      const validProductTypes = ['GOOGLE', 'PREWARMED', 'MICROSOFT'];
      if (!row.product_type || !validProductTypes.includes(row.product_type.toUpperCase())) {
        rowErrors.push(`Row ${rowNum}: product_type must be one of: ${validProductTypes.join(', ')}`);
      }
      
      // Validate quantity
      const quantity = parseInt(row.quantity);
      if (isNaN(quantity) || quantity < 10 || quantity > 2000) {
        rowErrors.push(`Row ${rowNum}: quantity must be between 10 and 2000`);
      }
      
      // Validate business_name
      if (!row.business_name?.trim()) {
        rowErrors.push(`Row ${rowNum}: business_name is required`);
      }
      
      // Validate optional fields
      if (row.stripe_subscription_id && !isValidStripeId(row.stripe_subscription_id)) {
        warnings.push(`Row ${rowNum}: stripe_subscription_id format may be invalid`);
      }
      
      if (rowErrors.length === 0) {
        validRows.push(row);
      } else {
        errors.push(...rowErrors);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      preview: validRows.slice(0, 10) // Show first 10 rows as preview
    };
    
  } catch (error) {
    console.error('CSV validation error:', error);
    return {
      isValid: false,
      errors: ['Validation failed: ' + (error instanceof Error ? error.message : 'Unknown error')],
      warnings: [],
      preview: []
    };
  }
}

/**
 * Imports CSV data into the database
 */
export async function importCSVAction(csvData: CSVRow[]): Promise<ImportResult> {
  const actorUserId = await requireAdmin();
  
  const prisma = new PrismaClient();
  await prisma.$connect();
  
  try {
    console.log(`[IMPORT] Starting CSV import for ${csvData.length} rows`);
    
    const stats = {
      totalRows: csvData.length,
      processedRows: 0,
      skippedRows: 0,
      errors: [] as string[]
    };
    
    // Group rows by external_id to create orders
    const orderGroups = new Map<string, CSVRow[]>();
    
    for (const row of csvData) {
      const externalId = row.external_id.trim();
      if (!orderGroups.has(externalId)) {
        orderGroups.set(externalId, []);
      }
      orderGroups.get(externalId)!.push(row);
    }
    
    console.log(`[IMPORT] Found ${orderGroups.size} unique orders`);
    
    // Process each order group
    for (const [externalId, rows] of orderGroups) {
      try {
        const firstRow = rows[0];
        
        // Check if order already exists
        const existingOrder = await prisma.order.findUnique({
          where: { externalId }
        });
        
        if (existingOrder) {
          console.log(`[IMPORT] Skipping existing order: ${externalId}`);
          stats.skippedRows += rows.length;
          continue;
        }
        
        // Calculate pricing
        const productType = firstRow.product_type.toUpperCase();
        const quantity = parseInt(firstRow.quantity);
        const pricePerInbox = productType === 'GOOGLE' ? 3 : productType === 'PREWARMED' ? 7 : 50;
        const totalAmountCents = quantity * pricePerInbox * 100;
        
        // Create order
        const order = await prisma.order.create({
          data: {
            externalId,
            productType,
            quantity,
            totalAmount: totalAmountCents,
            status: 'FULFILLED', // Imported orders are considered fulfilled
            businessName: firstRow.business_name.trim(),
            stripeSubscriptionId: firstRow.stripe_subscription_id?.trim() || null,
            clerkUserId: null, // Will be linked when user signs up
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        console.log(`[IMPORT] Created order: ${order.id} for external_id: ${externalId}`);
        
        // Create domains and inboxes
        const domainMap = new Map<string, { emails: string[]; forwardingUrl?: string }>();
        const inboxData: Prisma.InboxCreateManyInput[] = [];
        
        for (const row of rows) {
          const domain = row.domain?.trim();
          if (!domain) continue;
          
          // Add to domain map
          if (!domainMap.has(domain)) {
            domainMap.set(domain, { 
              emails: [], 
              forwardingUrl: row.forwarding_url?.trim() || domain 
            });
          }
          domainMap.get(domain)!.emails.push(row.email.trim());
          
          // Prepare inbox data
          inboxData.push({
            orderId: order.id,
            email: row.email.trim(),
            personaName: row.persona_name?.trim() || 'Imported User',
            espPlatform: row.esp_platform?.trim() || 'Smartlead',
            status: 'LIVE',
            tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
            businessName: order.businessName,
            forwardingDomain: row.forwarding_domain?.trim() || null,
            password: row.password ? encryptPassword(row.password) : null,
            fulfilledAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        
        // Create domains
        const domainData = Array.from(domainMap.entries()).map(([domain, info]) => ({
          orderId: order.id,
          domain,
          status: 'LIVE',
          inboxCount: info.emails.length,
          forwardingUrl: info.forwardingUrl || domain,
          businessName: order.businessName,
          tags: [],
          fulfilledAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        
        if (domainData.length > 0) {
          await prisma.domain.createMany({
            data: domainData,
            skipDuplicates: true
          });
          console.log(`[IMPORT] Created ${domainData.length} domains for order ${order.id}`);
        }
        
        // Create inboxes
        if (inboxData.length > 0) {
          await prisma.inbox.createMany({
            data: inboxData,
            skipDuplicates: true
          });
          console.log(`[IMPORT] Created ${inboxData.length} inboxes for order ${order.id}`);
        }
        
        // Send Clerk invitation to client
        const clientEmail = firstRow.client_email.trim();
        const inviteResult = await sendClerkInvitation(clientEmail);
        
        if (!inviteResult.success) {
          console.warn(`[IMPORT] Failed to send invitation to ${clientEmail}:`, inviteResult.error);
        }

        // Create audit log
        await prisma.auditLog.create({
          data: {
            actorUserId,
            action: 'CSV_IMPORT',
            details: {
              externalId,
              orderId: order.id,
              rowsProcessed: rows.length,
              domainsCreated: domainData.length,
              inboxesCreated: inboxData.length,
              clientEmail,
              invitationSent: inviteResult.success
            }
          }
        });
        
        stats.processedRows += rows.length;
        
      } catch (orderError) {
        console.error(`[IMPORT] Error processing order ${externalId}:`, orderError);
        stats.errors.push(`Order ${externalId}: ${orderError instanceof Error ? orderError.message : 'Unknown error'}`);
        stats.skippedRows += rows.length;
      }
    }
    
    console.log(`[IMPORT] Import completed:`, stats);
    
    return {
      success: stats.errors.length === 0,
      message: `Import completed. Processed ${stats.processedRows} rows, skipped ${stats.skippedRows} rows.`,
      stats
    };
    
  } catch (error) {
    console.error('[IMPORT] Import failed:', error);
    return {
      success: false,
      message: 'Import failed: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Links existing orders to users when they sign up
 */
export async function linkOrdersToUserAction(userEmail: string, clerkUserId: string): Promise<void> {
  const prisma = new PrismaClient();
  await prisma.$connect();
  
  try {
    // Find orders with matching email but no clerkUserId
    const orders = await prisma.order.findMany({
      where: {
        clerkUserId: null,
        inboxes: {
          some: {
            email: userEmail
          }
        }
      }
    });
    
    if (orders.length > 0) {
      // Update orders with clerkUserId
      await prisma.order.updateMany({
        where: {
          id: {
            in: orders.map(o => o.id)
          }
        },
        data: {
          clerkUserId,
          updatedAt: new Date()
        }
      });
      
      console.log(`[LINK] Linked ${orders.length} orders to user ${clerkUserId}`);
    }
    
  } catch (error) {
    console.error('[LINK] Error linking orders to user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidStripeId(id: string): boolean {
  // Basic Stripe ID validation (starts with sub_ for subscriptions)
  return id.startsWith('sub_') && id.length > 10;
}
