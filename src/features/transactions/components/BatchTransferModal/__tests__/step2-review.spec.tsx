import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Step2_Review } from '../Step2_Review';
import { useBatchTransferStore } from '../useBatchTransferStore';
import { renderWithProviders } from '../../../../../test-utils';
import type { ParsedRecord } from '../../../types';

// Helper to set store state
const setParsed = (rows: ParsedRecord[]) => {
  const { setParsedRecords } = useBatchTransferStore.getState();
  setParsedRecords(rows);
};

const renderStep2 = () => renderWithProviders(<Step2_Review />);

describe('Step2_Review validation display', () => {
  it('renders per-row errors and counts', async () => {
    setParsed([
      {
        data: {
          'Transaction Date': '2025/02/21',
          'Account Number': '00012345678901',
          'Account Holder Name': 'Jane Smith',
          Amount: '250.50',
        },
        isValid: false,
        errors: {
          'Transaction Date': ['Date must be in YYYY-MM-DD format'],
          'Account Number': ['Account number must follow format: 000-000000000-00'],
        },
      },
      {
        data: {
          'Transaction Date': '2025-02-20',
          'Account Number': '000-123456789-01',
          'Account Holder Name': 'John Doe',
          Amount: '100.00',
        },
        isValid: true,
        errors: {},
      },
    ]);

    renderStep2();

    // Wait for counts by querying text content to be more resilient
    expect(await screen.findByText(/1 valid records/i)).toBeInTheDocument();
    expect(await screen.findByText(/1 invalid records/i)).toBeInTheDocument();

    // Hover invalid status to see tooltip
    const invalid = await screen.findByTestId('invalid-status');
    await userEvent.hover(invalid);
    const tooltip = await screen.findByTestId('error-tooltip');
    expect(tooltip).toHaveTextContent('Transaction Date');
    expect(tooltip).toHaveTextContent('Account Number');
  });
});
