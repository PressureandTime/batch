/** CSV header normalization helpers. */

export type CsvRow = Record<string, unknown>;

import { STRICT_HEADER_MODE } from '../../../../config/csv-validation';

/** Normalize a header for matching (trim, collapse spaces, lowercase). */
const normalizeForMatch = (key: string): string => key.trim().replace(/\s+/g, ' ').toLowerCase();

const buildHeaderMap = (strict: boolean): Map<string, string> => {
  const map = new Map<string, string>([
    [normalizeForMatch('Transaction Date'), 'Transaction Date'],
    [normalizeForMatch('Account Number'), 'Account Number'],
    [normalizeForMatch('Account Holder Name'), 'Account Holder Name'],
    [normalizeForMatch('Amount'), 'Amount'],
  ]);

  if (!strict) {
    // Synonyms → canonical (permissive mode only)
    map.set(normalizeForMatch('Txn Date'), 'Transaction Date');
    map.set(normalizeForMatch('Acct Number'), 'Account Number');
    map.set(normalizeForMatch('Name'), 'Account Holder Name');
  }

  return map;
};

let strictHeaderMap: Map<string, string> | null = null;
let permissiveHeaderMap: Map<string, string> | null = null;

const getHeaderMap = (): Map<string, string> => {
  if (STRICT_HEADER_MODE) {
    if (!strictHeaderMap) strictHeaderMap = buildHeaderMap(true);
    return strictHeaderMap;
  }
  if (!permissiveHeaderMap) permissiveHeaderMap = buildHeaderMap(false);
  return permissiveHeaderMap;
};

/**
 * Returns a new object with keys normalized to canonical headers where applicable.
 * If multiple source keys map to the same canonical header, the first wins.
 */
export const normalizeRowKeys = (row: CsvRow): CsvRow => {
  const out: CsvRow = {};
  const map = getHeaderMap();
  for (const [rawKey, value] of Object.entries(row)) {
    const normalizedKey = map.get(normalizeForMatch(rawKey)) ?? rawKey;
    if (!(normalizedKey in out)) {
      out[normalizedKey] = value;
    }
  }
  return out;
};
