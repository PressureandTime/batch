import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders } from '../../../../../test-utils';
import { Step3_Summary } from '../Step3_Summary';
import { useBatchTransferStore } from '../useBatchTransferStore';
import { screen } from '@testing-library/react';

type Row = { isValid: boolean; errors: Record<string, string[]>; data: Record<string, unknown> };
const setParsed = (rows: Row[]) => useBatchTransferStore.getState().setParsedRecords(rows);

describe('Step3_Summary - statistics and zero-state', () => {
  beforeEach(() => {
    useBatchTransferStore.getState().reset();
  });

  it('formats totals and averages correctly with string/number Amount inputs', async () => {
    setParsed([
      {
        isValid: true,
        errors: {},
        data: {
          Amount: 100,
          'Transaction Date': '2025-01-01',
          'Account Number': '000-123456789-01',
          'Account Holder Name': 'A',
        },
      },
      {
        isValid: true,
        errors: {},
        data: {
          Amount: '250.50',
          'Transaction Date': '2025-01-02',
          'Account Number': '000-123456789-01',
          'Account Holder Name': 'B',
        },
      },
      { isValid: false, errors: { Amount: ['bad'] }, data: { Amount: '-12.00' } },
    ]);

    renderWithProviders(<Step3_Summary />);

    // Values only consider valid rows (2)
    expect(await screen.findByTestId('total-amount-value')).toHaveTextContent('$350.50');
    expect(screen.getByTestId('number-of-payments-value')).toHaveTextContent('2');
    // Average 175.25 -> formatted to 2 decimals
    expect(screen.getByTestId('average-payment-value')).toHaveTextContent('$175.25');
  });

  it('shows zero-state banner when there are no valid records', async () => {
    setParsed([{ isValid: false, errors: { Amount: ['bad'] }, data: { Amount: '-12.00' } }]);
    renderWithProviders(<Step3_Summary />);

    expect(await screen.findByText(/No valid transactions found/i)).toBeInTheDocument();
  });
});
