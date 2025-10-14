export function generateEmailVariations(
  firstName: string,
  lastName: string,
  domain: string,
  count: number = 50
): string[] {
  const targetCount = Math.max(1, count);
  const fn = firstName.trim().toLowerCase();
  const ln = lastName.trim().toLowerCase();
  const fi = fn.charAt(0);
  const li = ln.charAt(0);

  const variations = new Set<string>();
  const add = (localPart: string) => {
    if (!localPart) return;
    const email = `${localPart}@${domain}`;
    if (!variations.has(email) && variations.size < targetCount) {
      variations.add(email);
    }
  };

  // Basic human-friendly formats
  [
    fn,
    `${fn}.${ln}`,
    `${fn}.${li}`,
    `${fi}.${ln}`,
    `${fn}${ln}`,
    `${fi}${ln}`,
    `${fn}_${ln}`,
    `${fn}-${ln}`,
    `${ln}.${fn}`,
    `${ln}${fn}`,
  ].forEach(add);

  const prefixes = ['contact', 'info', 'sales', 'hello', 'hi', 'reach', 'meet', 'get', 'team', 'ask'];
  prefixes.forEach(prefix => add(`${prefix}.${fn}`));

  // Numeric permutations – keep iterating until we have enough entries
  const numericPatterns: Array<(i: number) => string> = [
    (i) => `${fn}${i}`,
    (i) => `${fn}.${ln}${i}`,
    (i) => `${fi}${ln}${i}`,
    (i) => `${fn}${ln}${i}`,
    (i) => `${fn}_${ln}${i}`,
    (i) => `${fn}-${ln}${i}`,
    (i) => `${ln}${fn}${i}`,
    (i) => `${ln}.${fn}${i}`,
    (i) => `${fn}${i.toString().padStart(2, '0')}`,
  ];

  let i = 1;
  while (variations.size < targetCount && i < 1000) {
    numericPatterns.forEach(pattern => add(pattern(i)));
    i += 1;
  }

  // Fallback for extremely large counts: append alphabetical suffixes
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let suffixIndex = 0;
  while (variations.size < targetCount && suffixIndex < alphabet.length ** 2) {
    const first = alphabet[Math.floor(suffixIndex / alphabet.length)] ?? 'x';
    const second = alphabet[suffixIndex % alphabet.length] ?? 'y';
    add(`${fn}${ln}${first}${second}`);
    suffixIndex += 1;
  }

  return Array.from(variations).slice(0, targetCount);
}
