import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithProviders } from '../../../../../test-utils';
import { useBatchTransferStore } from '../useBatchTransferStore';
import { screen, waitFor } from '@testing-library/react';
import { Step2_Review } from '../Step2_Review';

let parseImpl: ((file: File, cfg: any) => any) | null = null;
vi.mock('papaparse', () => ({
  default: {
    parse: (file: File, cfg: any) => parseImpl?.(file, cfg),
  },
}));

interface ParserLike {
  abort?: () => void;
}

describe('Step2_Review - worker watchdog fallback and progressive updates', () => {
  const store = useBatchTransferStore;

  beforeEach(() => {
    store.getState().reset();
  });

  afterEach(() => {
    parseImpl = null;
  });

  it('falls back to non-worker when worker makes no progress (watchdog triggers abort)', async () => {
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    const file = new File(['csv'], 'data.csv', { type: 'text/csv' });
    store.getState().setStep1Data({ batchName: 'b', approver: 'a', file });

    // Mocked papaparse
    let first = true;
    parseImpl = (_file: File, cfg: any) => {
      if (first) {
        first = false;
        cfg.error(new Error('worker failed'));
        return { abort: vi.fn() } as ParserLike;
      }
      // Non-worker path
      cfg.step({
        data: {
          'Transaction Date': '2025-01-01',
          'Account Number': '000-123456789-01',
          'Account Holder Name': 'A',
          Amount: '1.00',
        },
      });
      cfg.step({
        data: {
          'Transaction Date': '2025-01-02',
          'Account Number': '000-123456789-01',
          'Account Holder Name': 'B',
          Amount: '2.00',
        },
      });
      cfg.complete();
      return { abort: vi.fn() } as ParserLike;
    };

    renderWithProviders(<Step2_Review />);

    // Wait for table
    await waitFor(() => expect(screen.getByTestId('review-table')).toBeInTheDocument());
    // Table visible, spinner gone
    await waitFor(() => expect(screen.getByTestId('review-table')).toBeInTheDocument(), {
      timeout: 8000,
    });
    await waitFor(
      () => expect(screen.queryByText('Parsing and validating CSV file...')).toBeNull(),
      { timeout: 8000 }
    );

    // Row counts
    await waitFor(() => expect(screen.getByTestId('valid-count').textContent).toMatch(/2/));
    await waitFor(() => expect(screen.getByTestId('invalid-count').textContent).toMatch(/0/));
  });
});
