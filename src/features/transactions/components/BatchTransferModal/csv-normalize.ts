/**
 * CSV header normalization helpers.
 * Rules:
 * - Trim whitespace
 * - Collapse repeated spaces to one
 * - Match canonical headers case-insensitively
 * - Canonical headers: Transaction Date, Account Number, Account Holder Name, Amount
 * - Synonyms (for example, "Txn Date") are not normalized
 */

export type CsvRow = Record<string, unknown>;

/** Normalize a header for matching (trim, collapse spaces, lowercase). */
const normalizeForMatch = (key: string): string => key.trim().replace(/\s+/g, ' ').toLowerCase();

const headerMap = new Map<string, string>([
  [normalizeForMatch('Transaction Date'), 'Transaction Date'],
  [normalizeForMatch('Account Number'), 'Account Number'],
  [normalizeForMatch('Account Holder Name'), 'Account Holder Name'],
  [normalizeForMatch('Amount'), 'Amount'],
]);

/**
 * Returns a new object with keys normalized to canonical headers where applicable.
 * If multiple source keys map to the same canonical header, the first wins.
 */
export const normalizeRowKeys = (row: CsvRow): CsvRow => {
  const out: CsvRow = {};
  for (const [rawKey, value] of Object.entries(row)) {
    const normalizedKey = headerMap.get(normalizeForMatch(rawKey)) ?? rawKey;
    if (!(normalizedKey in out)) {
      out[normalizedKey] = value;
    }
  }
  return out;
};
