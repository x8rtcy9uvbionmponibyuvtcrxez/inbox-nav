/**
 * Generates email variations for a persona with priority ordering:
 * Priority formats (always used first, repeat for each domain):
 * 1. firstname@domain
 * 2. firstname.lastname@domain
 * 3. firstnamelastname@domain
 * 
 * Extended variations (only used when creating 50+ inboxes on 1 domain for 1 person):
 * 4. firstname_lastname@domain
 * 5. firstname_firstletteroflastname@domain
 * 
 * All spaces are removed from names before generating emails.
 */
export function generateEmailVariations(
  firstName: string,
  lastName: string,
  domain: string,
  count: number = 50,
  isHighVolumeSingleDomain: boolean = false
): string[] {
  // Remove all spaces and convert to lowercase
  const fn = firstName.trim().toLowerCase().replace(/\s+/g, '');
  const ln = lastName.trim().toLowerCase().replace(/\s+/g, '');
  const li = ln.charAt(0);

  // Priority 3 formats (always used first)
  const priorityVariations = [
    `${fn}@${domain}`,                    // firstname@domain
    `${fn}.${ln}@${domain}`,             // firstname.lastname@domain
    `${fn}${ln}@${domain}`,              // firstnamelastname@domain (no dot, no underscore)
  ];

  // Extended variations (only used for 50+ inboxes on single domain)
  const extendedVariations = [
    `${fn}_${ln}@${domain}`,             // firstname_lastname@domain
    `${fn}_${li}@${domain}`,             // firstname_firstletteroflastname@domain
  ];

  // If we need 50+ inboxes on a single domain, include extended variations
  const allVariations = isHighVolumeSingleDomain && count >= 50
    ? [...priorityVariations, ...extendedVariations]
    : priorityVariations;

  // Generate the requested count, cycling through variations
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(allVariations[i % allVariations.length]);
  }

  return result;
}
