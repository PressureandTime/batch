import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../../../test-utils';
import { Step2_Review } from '../Step2_Review';
import { useBatchTransferStore } from '../useBatchTransferStore';
import type { ParsedRecord } from '../../../types';

const setParsed = (rows: ParsedRecord[]) => {
  const { setParsedRecords } = useBatchTransferStore.getState();
  setParsedRecords(rows);
};

const renderStep2 = () => renderWithProviders(<Step2_Review />);

describe('Step2_Review empty/filtered state', () => {
  it('shows a clear empty message when filtered to only invalid and none exist', async () => {
    // Provide only valid rows
    setParsed([
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

    // Toggle only-invalid
    const toggle = await screen.findByTestId('only-invalid-toggle');
    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Message should appear and no rows
    expect(await screen.findByTestId('review-table-empty-message')).toHaveTextContent(
      /No invalid records found/i
    );
    expect(screen.queryByTestId('review-row')).toBeNull();
  });
});

