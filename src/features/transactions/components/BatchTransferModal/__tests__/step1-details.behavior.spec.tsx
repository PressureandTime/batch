import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../../../test-utils';
import { Step1_Details } from '../Step1_Details';
import { useBatchTransferStore } from '../useBatchTransferStore';

const getStore = () => useBatchTransferStore.getState();

describe('Step1_Details - validation and file handling', () => {
  beforeEach(() => {
    useBatchTransferStore.getState().reset();
  });

  it('allows empty file input when a stored file exists (back navigation reuse)', async () => {
    const user = userEvent.setup();
    const csv = new File(['a,b\n1,2'], 'stored.csv', { type: 'text/csv' });
    getStore().setStep1Data({ batchName: '', approver: '', file: csv });

    const onSubmit = vi.fn();
    renderWithProviders(<Step1_Details onSubmit={onSubmit} />);

    await expect(screen.getByTestId('selected-file-name')).toHaveTextContent('stored.csv');

    // Fill required fields (no new file)
    await user.type(screen.getByTestId('batch-name-input'), 'Batch 1');
    await user.selectOptions(screen.getByTestId('approver-select'), 'Alice Johnson');

    const form = screen.getByTestId('step1-form');
    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    // step1IsValid type, presence checked
    expect(getStore().step1IsValid).toBeTypeOf('boolean');
  });

  it('rejects non-CSV file types and shows error message', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<Step1_Details onSubmit={onSubmit} />);

    await user.type(screen.getByTestId('batch-name-input'), 'Batch 2');
    await user.selectOptions(screen.getByTestId('approver-select'), 'Bob Smith');

    const fileInput = screen.getByTestId('csv-file-input') as HTMLInputElement;
    const bad = new File(['x'], 'notes.txt', { type: 'text/plain' });
    await user.upload(fileInput, bad);

    const form = screen.getByTestId('step1-form');
    await act(async () => {
      fireEvent.submit(form);
    });

    // Zod field error
    await waitFor(() =>
      expect(screen.getByTestId('step1-form')).toHaveTextContent(/Only CSV|Invalid file input/)
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('recomputes validity across DOM+RHF changes and updates selected file name', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Step1_Details />);

    // Initially no file selected
    await expect(screen.getByTestId('selected-file-name')).toHaveTextContent('No file selected');

    // step1IsValid starts false
    expect(getStore().step1IsValid).toBe(false);

    await user.type(screen.getByTestId('batch-name-input'), 'Batch 3');
    await user.selectOptions(screen.getByTestId('approver-select'), 'Carol Williams');

    const good = new File(['a,b\n1,2'], 'upload.csv', { type: 'text/csv' });
    await user.upload(screen.getByTestId('csv-file-input'), good);

    // Selected file updates and validity becomes true
    await expect(screen.getByTestId('selected-file-name')).toHaveTextContent('upload.csv');
    expect(getStore().step1IsValid).toBe(true);
  });
});
