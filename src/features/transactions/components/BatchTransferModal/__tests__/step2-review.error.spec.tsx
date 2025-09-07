import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../../../../../test-utils';
import { useBatchTransferStore } from '../useBatchTransferStore';
import { Step2_Review } from '../Step2_Review';
import { screen, waitFor } from '@testing-library/react';

let parseImpl: ((file: File, cfg: any) => any) | null = null;
vi.mock('papaparse', () => ({
  default: {
    parse: (file: File, cfg: any) => parseImpl?.(file, cfg),
  },
}));

describe('Step2_Review - parse error path', () => {
  it('handles parse error by clearing loading and rendering stable UI', async () => {
    const file = new File(['bad'], 'bad.csv', { type: 'text/csv' });
    useBatchTransferStore.getState().reset();
    useBatchTransferStore.getState().setStep1Data({ batchName: 'b', approver: 'a', file });

    let first = true;
    parseImpl = (_file: File, cfg: any) => {
      if (first) {
        first = false;
        // trigger non-worker path
        cfg.error(new Error('worker fail'));
        return { abort() {} } as any;
      }
      // non-worker error
      cfg.error(new Error('parse error'));
      return { abort() {} } as any;
    };

    renderWithProviders(<Step2_Review />);

    // Spinner gone; counts 0
    await waitFor(() =>
      expect(screen.queryByText('Parsing and validating CSV file...')).toBeNull()
    );
    expect(screen.getByTestId('valid-count').textContent).toMatch(/0/);
    expect(screen.getByTestId('invalid-count').textContent).toMatch(/0/);
  });
});
