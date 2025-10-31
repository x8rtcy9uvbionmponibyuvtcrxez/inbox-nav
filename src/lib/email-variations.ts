/**
 * Generates the 4 standard email variations for a persona:
 * 1. firstname@domain
 * 2. firstname.lastname@domain
 * 3. firstname_lastname@domain
 * 4. firstname_firstletteroflastname@domain
 * 
 * These variations cycle when more inboxes are needed per domain.
 */
export function generateEmailVariations(
  firstName: string,
  lastName: string,
  domain: string,
  count: number = 50
): string[] {
  const fn = firstName.trim().toLowerCase();
  const ln = lastName.trim().toLowerCase();
  const li = ln.charAt(0);

  // Core 4 variations
  const coreVariations = [
    `${fn}@${domain}`,                    // firstname@domain
    `${fn}.${ln}@${domain}`,             // firstname.lastname@domain
    `${fn}_${ln}@${domain}`,             // firstname_lastname@domain
    `${fn}_${li}@${domain}`,             // firstname_firstletteroflastname@domain
  ];

  // If we need more than 4, cycle through them
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(coreVariations[i % coreVariations.length]);
  }

  return result;
}
