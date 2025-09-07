import { z } from 'zod';

// Parse amount: trim, remove commas, parse number
export const parseCsvAmount = (value: unknown): number => {
  const str = String(value ?? '')
    .trim()
    .replace(/,/g, '');
  return parseFloat(str);
};

// CSV transaction schema
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
