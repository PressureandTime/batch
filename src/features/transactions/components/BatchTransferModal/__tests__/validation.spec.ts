import { describe, it, expect } from 'vitest';
import { transactionSchema, parseCsvAmount } from '../validation';

describe('parseCsvAmount', () => {
  it('trims and parses numbers', () => {
    expect(parseCsvAmount(' 123.45 ')).toBe(123.45);
  });
  it('removes thousands separators', () => {
    expect(parseCsvAmount('1,234.56')).toBe(1234.56);
  });
  it('handles empty/invalid strings to NaN', () => {
    expect(Number.isNaN(parseCsvAmount(''))).toBe(true);
    expect(Number.isNaN(parseCsvAmount('abc'))).toBe(true);
  });
});

describe('transactionSchema', () => {
  const base = {
    'Transaction Date': '2025-02-20',
    'Account Number': '000-123456789-01',
    'Account Holder Name': 'John Doe',
    Amount: '100.00',
  } as const;

  it('accepts a valid record', () => {
    const res = transactionSchema.safeParse(base);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.Amount).toBe(100);
    }
  });

  it('rejects invalid date format and invalid calendar dates', () => {
    expect(transactionSchema.safeParse({ ...base, 'Transaction Date': '2025/02/20' }).success).toBe(false);
    expect(transactionSchema.safeParse({ ...base, 'Transaction Date': '2025-02-30' }).success).toBe(false);
  });

  it('rejects invalid account number format', () => {
    expect(transactionSchema.safeParse({ ...base, 'Account Number': '00012345678901' }).success).toBe(false);
  });

  it('rejects empty account holder name', () => {
    expect(transactionSchema.safeParse({ ...base, 'Account Holder Name': '' }).success).toBe(false);
  });

  it('accepts amounts with commas and coerces to number', () => {
    const res = transactionSchema.safeParse({ ...base, Amount: '1,234.56' });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.Amount).toBe(1234.56);
    }
  });

  it('rejects non-positive amounts', () => {
    expect(transactionSchema.safeParse({ ...base, Amount: '0' }).success).toBe(false);
    expect(transactionSchema.safeParse({ ...base, Amount: '-10' }).success).toBe(false);
  });
});

