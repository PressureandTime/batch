import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../../../../test-utils';
import { TransactionsTable } from '../TransactionsTable';
import { v4 as uuidv4 } from 'uuid';
import { screen } from '@testing-library/react';

const row = (over: Partial<Parameters<typeof TransactionsTable>[0]['transactions'][number]> = {}) => ({
  id: uuidv4(),
  batchName: 'Batch X',
  approver: 'Alice',
  transactionDate: '2025-01-01',
  accountNumber: '000-123456789-01',
  accountHolderName: 'John',
  amount: 1234.5,
  status: 'Pending' as const,
  ...over,
});

describe('TransactionsTable', () => {
  it('renders a basic row with formatted amount and status badge', () => {
    renderWithProviders(<TransactionsTable transactions={[row()]} />);
    expect(screen.getByTestId('transactions-table')).toBeInTheDocument();
    const r = screen.getByTestId('tx-row');
    expect(r).toHaveTextContent('Batch X');
    expect(r).toHaveTextContent('Alice');
    expect(r).toHaveTextContent('2025-01-01');
    expect(r).toHaveTextContent('000-123456789-01');
    expect(r).toHaveTextContent('John');
    expect(r).toHaveTextContent('$1234.50');
    expect(screen.getByTestId('tx-status')).toBeInTheDocument();
  });

  it('renders empty state when no transactions', () => {
    renderWithProviders(<TransactionsTable transactions={[]} />);
    expect(screen.getByText(/No transactions to display/i)).toBeInTheDocument();
  });
});

