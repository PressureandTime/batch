import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
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

describe('Step2_Review Amount rendering', () => {
  it('shows Amount for valid (number) and invalid (string) records', async () => {
    setParsed([
      {
        data: {
          'Transaction Date': '2025-02-20',
          'Account Number': '000-123456789-01',
          'Account Holder Name': 'John Doe',
          Amount: 100,
        },
        isValid: true,
        errors: {},
      },
      {
        data: {
          'Transaction Date': '2025/02/21', // invalid date
          'Account Number': '000-123456789-01',
          'Account Holder Name': 'Jane Smith',
          Amount: '250.50',
        },
        isValid: false,
        errors: {
          'Transaction Date': ['Date must be in YYYY-MM-DD format'],
        },
      },
    ]);

    renderStep2();

    const rows = await screen.findAllByTestId('review-row');
    expect(rows.length).toBe(2);

    // For simplicity, assert text content contains the amounts as strings
    expect(rows[0]).toHaveTextContent('100');
    expect(rows[1]).toHaveTextContent('250.50');
  });
});
