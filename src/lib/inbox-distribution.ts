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
    const domainsNeeded = Math.ceil(totalInboxes / perDomain);
    
    return {
      allocations: [],
      domainsNeeded,
      domainsUsed: [],
      shouldCreateInboxes: false,
      message: `We'll purchase ${domainsNeeded} domains and set up ${totalInboxes} inboxes within 24-48 hours.`
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
    const variations = generateEmailVariations(
      persona.firstName,
      persona.lastName,
      domain,
      count
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
  const domainsNeeded = Math.ceil(totalInboxes / inboxesPerDomain);
  
  // Cycle through domains if needed
  const domainsToUse: string[] = [];
  for (let i = 0; i < domainsNeeded; i++) {
    domainsToUse.push(domains[i % domains.length]);
  }
  
  // Balanced distribution
  const basePerDomain = Math.floor(totalInboxes / domainsToUse.length);
  const remainder = totalInboxes % domainsToUse.length;
  
  let variationOffset = 0;
  
  domainsToUse.forEach((domain, domainIndex) => {
    const inboxesForThisDomain = basePerDomain + (domainIndex < remainder ? 1 : 0);
    const inboxesPerPersonaOnDomain = Math.floor(inboxesForThisDomain / personas.length);
    const personaRemainder = inboxesForThisDomain % personas.length;
    
    personas.forEach((persona, personaIndex) => {
      const count = inboxesPerPersonaOnDomain + (personaIndex < personaRemainder ? 1 : 0);
      
      if (count === 0) return;
      
      const variations = generateEmailVariations(
        persona.firstName,
        persona.lastName,
        domain,
        50
      );
      
      for (let i = 0; i < count; i++) {
        const email = variations[(variationOffset + i) % variations.length];
        allocations.push({
          email,
          firstName: persona.firstName,
        lastName: persona.lastName,
          domain
        });
      }
      variationOffset += count;
    });
  });
  
  return {
    allocations,
    domainsNeeded: domainsToUse.length,
    domainsUsed: domainsToUse,
    shouldCreateInboxes: true,
    message: `Created ${allocations.length} inboxes across ${domainsToUse.length} domains`
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
