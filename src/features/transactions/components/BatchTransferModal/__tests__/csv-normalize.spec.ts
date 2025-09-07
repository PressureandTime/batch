import { describe, it, expect } from 'vitest';
import { normalizeRowKeys } from '../csv-normalize';

describe('normalizeRowKeys', () => {
  it('normalizes case and trims spaces for canonical headers', () => {
    const row = {
      ' transaction  date  ': '2025-02-20',
      'ACCOUNT NUMBER': '000-123456789-01',
      'Account   Holder   Name ': 'John Doe',
      ' amount ': '100.00',
    } as const;

    const normalized = normalizeRowKeys(row);

    expect(Object.keys(normalized)).toEqual([
      'Transaction Date',
      'Account Number',
      'Account Holder Name',
      'Amount',
    ]);
    expect(normalized['Amount']).toBe('100.00');
  });

  it('does not convert non-canonical synonyms', () => {
    const row = {
      'Txn Date': '2025-02-20',
      'Acct Number': '000-123456789-01',
      Name: 'John Doe',
      Amount: '100.00',
    };

    const normalized = normalizeRowKeys(row);

    expect(normalized['Txn Date']).toBe('2025-02-20');
    expect(normalized['Acct Number']).toBe('000-123456789-01');
    expect(normalized['Name']).toBe('John Doe');
    expect(normalized['Amount']).toBe('100.00');
  });
});

