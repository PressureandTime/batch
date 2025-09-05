export type TransactionStatus = 'Pending' | 'Settled' | 'Failed';

export interface Transaction {
  id: string;
  batchName: string;
  approver: string;
  transactionDate: string;
  accountNumber: string;
  accountHolderName: string;
  amount: number;
  status: TransactionStatus;
  errorMessage?: string;
}

export interface ParsedRecord {
  data: Record<string, unknown>;
  isValid: boolean;
  errors: Record<string, string[] | undefined>;
}
