import { describe, it, expect, beforeAll } from 'vitest';
import { normalizeRowKeys } from '../csv-normalize';
import { setStrictHeaderModeForTests } from '../../../../../config/csv-validation';

describe('normalizeRowKeys (permissive mode)', () => {
  beforeAll(() => {
    // Enable permissive mode for this suite
    setStrictHeaderModeForTests(false);
  });

  it('normalizes common synonyms to canonical headers when permissive', () => {
    const row = {
      'Txn Date': '2025-02-20',
      'Acct Number': '000-123456789-01',
      Name: 'John Doe',
      Amount: '100.00',
    };

    const normalized = normalizeRowKeys(row);

    expect(Object.keys(normalized)).toEqual([
      'Transaction Date',
      'Account Number',
      'Account Holder Name',
      'Amount',
    ]);
    expect(normalized['Transaction Date']).toBe('2025-02-20');
    expect(normalized['Account Number']).toBe('000-123456789-01');
    expect(normalized['Account Holder Name']).toBe('John Doe');
    expect(normalized['Amount']).toBe('100.00');
  });
});
