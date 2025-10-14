export function generateEmailVariations(
  firstName: string,
  lastName: string,
  domain: string,
  count: number = 50
): string[] {
  const fn = firstName.toLowerCase();
  const ln = lastName.toLowerCase();
  const fi = fn.charAt(0);
  const li = ln.charAt(0);
  
  const variations: string[] = [];
  
  // Basic formats (10)
  variations.push(`${fn}@${domain}`);
  variations.push(`${fn}.${ln}@${domain}`);
  variations.push(`${fn}.${li}@${domain}`);
  variations.push(`${fi}.${ln}@${domain}`);
  variations.push(`${fn}${ln}@${domain}`);
  variations.push(`${fi}${ln}@${domain}`);
  variations.push(`${fn}_${ln}@${domain}`);
  variations.push(`${fn}-${ln}@${domain}`);
  variations.push(`${ln}.${fn}@${domain}`);
  variations.push(`${ln}${fn}@${domain}`);
  
  // With numbers 1-10
  for (let i = 1; i <= 10; i++) {
    variations.push(`${fn}${i}@${domain}`);
  }
  
  // Combo + numbers
  for (let i = 1; i <= 10; i++) {
    variations.push(`${fn}.${ln}${i}@${domain}`);
  }
  
  // Short + numbers
  for (let i = 1; i <= 10; i++) {
    variations.push(`${fi}${ln}${i}@${domain}`);
  }
  
  // Professional prefixes
  const prefixes = ['contact', 'info', 'sales', 'hello', 'hi', 'reach', 'meet', 'get', 'team', 'ask'];
  prefixes.forEach(prefix => {
    variations.push(`${prefix}.${fn}@${domain}`);
  });
  
  return variations.slice(0, Math.min(count, 50));
}
