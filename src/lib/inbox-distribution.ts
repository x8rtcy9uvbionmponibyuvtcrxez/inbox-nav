import { generateEmailVariations } from './email-variations';

interface Persona {
  firstName: string;
  lastName: string;
}

import { ProductType } from '@prisma/client';

interface DistributionInput {
  productType: ProductType;
  domainSource: 'OWN' | 'BUY_FOR_ME';
  totalInboxes: number;
  personas: Persona[];
  providedDomains?: string[];
  inboxesPerDomain?: number;
  businessName: string;
}

interface InboxAllocation {
  email: string;
  firstName: string;
  lastName: string;
  domain: string;
}

interface DistributionResult {
  allocations: InboxAllocation[];
  domainsNeeded: number;
  domainsUsed: string[];
  shouldCreateInboxes: boolean;
  message: string;
}

/**
 * Distributes inboxes across domains and personas based on product type and configuration.
 * 
 * @param input - Distribution configuration including product type, domain source, and personas
 * @returns Distribution result with inbox allocations and domain usage
 * @throws Error if validation fails or distribution cannot be completed
 */
export function distributeInboxes(input: DistributionInput): DistributionResult {
  const {
    productType,
    domainSource,
    totalInboxes,
    personas,
    providedDomains = [],
    inboxesPerDomain,
  } = input;
  
  // VALIDATION
  if (personas.length === 0) {
    throw new Error('At least 1 persona required');
  }
  
  if (totalInboxes < 10 || totalInboxes > 2000) {
    throw new Error('Inbox count must be 10-2000');
  }
  
  if (domainSource === 'OWN' && providedDomains.length === 0) {
    throw new Error('At least 1 domain required when using own domains');
  }
  
  // SCENARIO 1: BUY_FOR_ME - Don't create inboxes yet
  if (domainSource === 'BUY_FOR_ME') {
    const perDomain = getInboxesPerDomain(productType, inboxesPerDomain);
    const domainsNeeded = Math.floor(totalInboxes / perDomain) || 1; // Ensure at least 1 domain
    
    return {
      allocations: [],
      domainsNeeded,
      domainsUsed: [],
      shouldCreateInboxes: false,
      message: `We'll purchase ${domainsNeeded} domains and distribute ${totalInboxes} inboxes across them within 24-48 hours.`
    };
  }
  
  // SCENARIO 2: OWN_DOMAINS
  const perDomain = getInboxesPerDomain(productType, inboxesPerDomain);
  
  // Microsoft = 1 domain only, all inboxes on it
  if (productType === ProductType.MICROSOFT) {
    return distributeMicrosoft(totalInboxes, personas, providedDomains[0]);
  }
  
  // Reseller, Edu, Legacy, AWS & Prewarmed = multiple domains
  return distributeMultipleDomains(totalInboxes, personas, providedDomains, perDomain);
}

/**
 * Determines the optimal number of inboxes per domain based on product type.
 * 
 * @param productType - The type of product (EDU, LEGACY, RESELLER, etc.)
 * @param userPreference - Optional user-specified preference
 * @returns Number of inboxes per domain
 */
function getInboxesPerDomain(productType: ProductType, userPreference?: number): number {
  if (productType === ProductType.RESELLER || productType === ProductType.EDU || productType === ProductType.LEGACY || productType === ProductType.AWS) {
    return userPreference || 3;
  }
  if (productType === ProductType.PREWARMED) {
    return 5;
  }
  if (productType === ProductType.MICROSOFT) {
    return 50; // Microsoft uses 50 inboxes per domain
  }
  return 3;
}

function distributeMicrosoft(
  totalInboxes: number,
  personas: Persona[],
  domain: string
): DistributionResult {
  const allocations: InboxAllocation[] = [];
  const inboxesPerPersona = Math.floor(totalInboxes / personas.length);
  const remainder = totalInboxes % personas.length;
  
  personas.forEach((persona, pIndex) => {
    const count = inboxesPerPersona + (pIndex < remainder ? 1 : 0);
    // Microsoft creates 50 inboxes per domain per persona - use high volume flag
    const variations = generateEmailVariations(
      persona.firstName,
      persona.lastName,
      domain,
      count,
      true // isHighVolumeSingleDomain = true for Microsoft (50 per domain)
    );
    
    variations.forEach(email => {
      allocations.push({
        email,
        firstName: persona.firstName,
        lastName: persona.lastName,
        domain
      });
    });
  });
  
  return {
    allocations,
    domainsNeeded: 1,
    domainsUsed: [domain],
    shouldCreateInboxes: true,
    message: `Created ${allocations.length} inboxes on ${domain}`
  };
}

function distributeMultipleDomains(
  totalInboxes: number,
  personas: Persona[],
  domains: string[],
  inboxesPerDomain: number
): DistributionResult {
  const allocations: InboxAllocation[] = [];
  const domainsNeeded = Math.floor(totalInboxes / inboxesPerDomain) || 1; // Ensure at least 1 domain
  
  // Cycle through domains if needed
  const domainsToUse: string[] = [];
  for (let i = 0; i < domainsNeeded; i++) {
    domainsToUse.push(domains[i % domains.length]);
  }
  
  // Balanced distribution - distribute extra inboxes among existing domains
  const basePerDomain = Math.floor(totalInboxes / domainsToUse.length);
  const remainder = totalInboxes % domainsToUse.length;
  
  domainsToUse.forEach((domain, domainIndex) => {
    const inboxesForThisDomain = basePerDomain + (domainIndex < remainder ? 1 : 0);
    const inboxesPerPersonaOnDomain = Math.floor(inboxesForThisDomain / personas.length);
    const personaRemainder = inboxesForThisDomain % personas.length;
    
    personas.forEach((persona, personaIndex) => {
      const count = inboxesPerPersonaOnDomain + (personaIndex < personaRemainder ? 1 : 0);
      
      if (count === 0) return;
      
      // Generate priority 3 variations for this persona on this domain
      // Variations restart from 0 for each domain+persona combination
      // Only use extended variations if 50+ inboxes on single domain (not typical for multiple domains)
      const isHighVolume = count >= 50;
      const variations = generateEmailVariations(
        persona.firstName,
        persona.lastName,
        domain,
        count,
        isHighVolume
      );
      
      variations.forEach(email => {
        allocations.push({
          email,
          firstName: persona.firstName,
          lastName: persona.lastName,
          domain
        });
      });
    });
  });
  
  return {
    allocations,
    domainsNeeded: domainsToUse.length,
    domainsUsed: domainsToUse,
    shouldCreateInboxes: true,
    message: `Created ${allocations.length} inboxes distributed across ${domainsToUse.length} domains`
  };
}

export function validateDistribution(result: DistributionResult) {
  if (!result.shouldCreateInboxes) return;
  
  const emails = result.allocations.map(a => a.email);
  const uniqueEmails = new Set(emails);
  
  if (emails.length !== uniqueEmails.size) {
    const duplicates = emails.filter((e, i) => emails.indexOf(e) !== i);
    throw new Error(`Duplicate emails found: ${duplicates.join(', ')}`);
  }
  
  console.log('[DISTRIBUTION] ✅ All emails unique');
}
