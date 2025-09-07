import { z } from 'zod';

/**
 * Utility to parse amount values from CSV strings.
 * - Trims whitespace
 * - Removes thousands separators (commas)
 * - Parses to number
 *
 * @param value - CSV field value for Amount (string or number)
 * @returns number (NaN for unparseable values)
 */
export const parseCsvAmount = (value: unknown): number => {
  const str = String(value ?? '')
    .trim()
    .replace(/,/g, '');
  const num = parseFloat(str);
  return num;
};

/**
 * Zod validation schema for CSV transaction records.
 * Keys match CSV column headers exactly as provided by requirements.
 *
 * Fields
 * - Transaction Date: ISO YYYY-MM-DD; validated as a real calendar date
 * - Account Number: 000-000000000-00 pattern
 * - Account Holder Name: non-empty string
 * - Amount: positive number, accepts comma-separated strings; coerced to number
 */
export const transactionSchema = z.object({
  'Transaction Date': z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/u, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
    }, 'Invalid date'),
  'Account Number': z
    .string()
    .regex(/^\d{3}-\d{9}-\d{2}$/u, 'Account number must follow format: 000-000000000-00'),
  'Account Holder Name': z.string().min(1, 'Account holder name is required'),
  Amount: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'number' ? val : parseCsvAmount(val)))
    .refine((num) => !isNaN(num) && num > 0, 'Amount must be a positive number'),
});

export type TransactionSchema = z.infer<typeof transactionSchema>;
