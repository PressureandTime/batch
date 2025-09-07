import { describe, it, expect } from 'vitest';
import { act } from '@testing-library/react';
import { useBatchTransferStore } from '../useBatchTransferStore';

// Basic smoke tests for navigation/reset logic

describe('useBatchTransferStore navigation/reset', () => {
  it('increments/decrements step within bounds', () => {
    const store = useBatchTransferStore.getState();
    expect(store.currentStep).toBe(1);

    act(() => store.nextStep());
    expect(useBatchTransferStore.getState().currentStep).toBe(2);

    act(() => store.prevStep());
    expect(useBatchTransferStore.getState().currentStep).toBe(1);

    act(() => store.prevStep());
    expect(useBatchTransferStore.getState().currentStep).toBe(1);

    act(() => {
      useBatchTransferStore.setState({ currentStep: 3 });
      store.nextStep();
    });
    expect(useBatchTransferStore.getState().currentStep).toBe(3);
  });

  it('reset returns to initial state', () => {
    const store = useBatchTransferStore.getState();
    act(() => {
      store.setStep1Data({ batchName: 'x', approver: 'a', file: null });
      store.setParsedRecords([{ data: {}, isValid: false, errors: {} }]);
      store.nextStep();
      store.reset();
    });

    const s = useBatchTransferStore.getState();
    expect(s.currentStep).toBe(1);
    expect(s.batchName).toBe('');
    expect(s.approver).toBe('');
    expect(s.file).toBe(null);
    expect(s.parsedRecords.length).toBe(0);
  });
});

