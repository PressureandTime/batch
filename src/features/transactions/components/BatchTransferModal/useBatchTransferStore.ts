import { create } from 'zustand';
import type { ParsedRecord } from '../../types';

export interface BatchTransferState {
  // Current step in the modal (1, 2, or 3)
  currentStep: number;
  
  // Step 1 data
  batchName: string;
  approver: string;
  file: File | null;
  
  // Step 2 data
  parsedRecords: ParsedRecord[];
  
  // Actions
  setStep1Data: (data: { batchName: string; approver: string; file: File | null }) => void;
  setParsedRecords: (records: ParsedRecord[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1,
  batchName: '',
  approver: '',
  file: null,
  parsedRecords: [],
};

export const useBatchTransferStore = create<BatchTransferState>((set, get) => ({
  ...initialState,
  
  setStep1Data: (data) => {
    set({
      batchName: data.batchName,
      approver: data.approver,
      file: data.file,
    });
  },
  
  setParsedRecords: (records) => {
    set({ parsedRecords: records });
  },
  
  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 3) {
      set({ currentStep: currentStep + 1 });
    }
  },
  
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1 });
    }
  },
  
  reset: () => {
    set(initialState);
  },
}));
