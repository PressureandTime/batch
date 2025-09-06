import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Field, Input, Select, Stack, Text } from '@chakra-ui/react';
import { useBatchTransferStore } from './useBatchTransferStore';
import {
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from 'react';

// Approvers list as specified in requirements
const approvers = ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Emma Davis'];

// Cross-environment FileList guard (Playwright/headless friendly)
const isFileList = (val: unknown): val is FileList => {
  try {
    if (typeof FileList !== 'undefined' && val instanceof FileList) return true;
  } catch {}
  const v = val as any;
  return !!v && typeof v.length === 'number' && typeof v.item === 'function';
};

// Zod validation schema
const step1Schema = z.object({
  batchName: z.string().min(1, 'Batch name is required'),
  approver: z.string().min(1, 'Approver selection is required'),
  file: z
    .custom<FileList>(isFileList, 'Invalid file input')
    .refine((files) => files.length > 0, 'File is required')
    .refine(
      (files) => files[0]?.type === 'text/csv' || files[0]?.name.endsWith('.csv'),
      'Only CSV files are allowed'
    ),
});

type Step1FormData = z.infer<typeof step1Schema>;

interface Step1DetailsProps {
  onSubmit?: () => void;
}

export interface Step1DetailsRef {
  triggerSubmit: () => void;
}

export const Step1_Details = forwardRef<Step1DetailsRef, Step1DetailsProps>(({ onSubmit }, ref) => {
  const {
    batchName,
    approver,
    file: storedFile,
    setStep1Data,
    nextStep,
    setStep1Validity,
  } = useBatchTransferStore();
  const randomizedApprovers = useMemo(() => [...approvers].sort(() => Math.random() - 0.5), []);
  const hiddenSubmitRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
    defaultValues: {
      batchName,
      approver,
    },
  });

  // Keep a stable registration reference for file input so we can merge events
  const fileReg = register('file');

  const [selectedName, setSelectedName] = useState<string>('');

  // Local validity recomputation to handle Zod + RHF + file timing in headless browsers
  const recomputeValidity = useCallback(() => {
    const vals = getValues();
    const rhfHasFile = isFileList(vals.file) && vals.file.length > 0;
    let domHasFile = false;
    let domHasBatch = false;
    let domHasApprover = false;
    if (typeof document !== 'undefined') {
      const inputEl = document.getElementById('file') as HTMLInputElement | null;
      domHasFile = !!(inputEl && inputEl.files && inputEl.files.length > 0);
      const batchEl = document.getElementById('batchName') as HTMLInputElement | null;
      domHasBatch = !!(batchEl && batchEl.value && batchEl.value.trim().length > 0);
      const approverEl = document.getElementById('approver') as HTMLSelectElement | null;
      domHasApprover = !!(approverEl && approverEl.value && approverEl.value.trim().length > 0);
    }
    const hasFile = rhfHasFile || domHasFile;
    const hasBatch =
      (typeof vals.batchName === 'string' && vals.batchName.trim().length > 0) || domHasBatch;
    const hasApprover =
      (typeof vals.approver === 'string' && vals.approver.trim().length > 0) || domHasApprover;
    setStep1Validity(hasBatch && hasApprover && hasFile);
  }, [getValues, setStep1Validity]);

  useEffect(() => {
    // Initialize and keep in sync as user edits fields
    recomputeValidity();
    const sub = watch(() => recomputeValidity());
    return () => {
      // Optional chaining in case RHF returns a non-subscription in some versions
      (sub as any)?.unsubscribe?.();
    };
  }, [watch, recomputeValidity]);

  // Ensure validity recomputes on native DOM events as well (headless-friendly)
  useEffect(() => {
    const bn = document.getElementById('batchName');
    const ap = document.getElementById('approver');
    const fi = document.getElementById('file');
    if (!bn || !ap || !fi) return;
    const handler = () => recomputeValidity();
    bn.addEventListener('input', handler);
    ap.addEventListener('change', handler);
    fi.addEventListener('change', handler);
    return () => {
      bn.removeEventListener('input', handler);
      ap.removeEventListener('change', handler);
      fi.removeEventListener('change', handler);
    };
  }, [recomputeValidity]);

  // Keep selected file name in sync with store
  useEffect(() => {
    setSelectedName(storedFile?.name ?? '');
  }, [storedFile]);
  // Native change listener to update selectedName directly from DOM input (robust in headless)
  useEffect(() => {
    const fi = document.getElementById('file') as HTMLInputElement | null;
    if (!fi) return;
    const updateName = () => {
      const fl = fi.files;
      const name = fl && fl.length > 0 ? fl[0].name : '';
      if (name) setSelectedName(name);
    };
    fi.addEventListener('change', updateName);
    return () => fi.removeEventListener('change', updateName);
  }, []);
  // Update selected file name when RHF 'file' value changes (headless-friendly)
  useEffect(() => {
    const sub = watch((vals) => {
      try {
        const files = (vals as any)?.file as FileList | undefined;
        const name = files && (files as any).length > 0 ? (files as any)[0]?.name ?? '' : '';
        if (name) setSelectedName(name);
      } catch {
        // no-op
      }
    });
    return () => {
      (sub as any)?.unsubscribe?.();
    };
  }, [watch]);

  // Randomize approver order once; set a default if none selected yet
  useEffect(() => {
    if (!approver && randomizedApprovers[0]) {
      setValue('approver', randomizedApprovers[0]);
    }
  }, [approver, randomizedApprovers, setValue]);

  const onFormSubmit = (data: Step1FormData) => {
    // Headless-safe: fallback to DOM input if RHF value is missing
    let fileList: FileList | null = data.file;
    if (!fileList || fileList.length === 0) {
      const domFiles = (document.getElementById('file') as HTMLInputElement | null)?.files ?? null;
      if (domFiles && domFiles.length > 0) fileList = domFiles;
    }

    const selectedFile = fileList?.[0] ?? null;

    // Update Zustand store with form data (file may be null; Step2 will handle null guard)
    setStep1Data({
      batchName: data.batchName,
      approver: data.approver,
      file: selectedFile,
    });

    // Advance to next step (even if selectedFile is null, Step2 shows spinner only when file present)
    nextStep();

    // Call external onSubmit if provided
    onSubmit?.();
  };

  // Also guard against native form submission bypassing RHF
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      // Let RHF/our handler run via onSubmit; no-op here.
      // But we can re-check validity after submit to be safe.
      setTimeout(recomputeValidity, 0);
    };
    el.addEventListener('submit', handler);
    return () => el.removeEventListener('submit', handler);
  }, [recomputeValidity]);

  // Expose submit function for external triggering via ref
  useImperativeHandle(ref, () => ({
    triggerSubmit: () => {
      hiddenSubmitRef.current?.click();
    },
  }));

  return (
    <Box>
      <Text fontSize="lg" fontWeight="semibold" mb={6}>
        Batch Transfer - Step 1 of 3
      </Text>

      <form ref={formRef} onSubmit={handleSubmit(onFormSubmit)} data-testid="step1-form">
        <Stack gap={6}>
          <Field.Root invalid={!!errors.batchName}>
            <Field.Label htmlFor="batchName">Batch Name</Field.Label>
            <Input
              id="batchName"
              data-testid="batch-name-input"
              {...register('batchName')}
              placeholder="Enter batch name"
            />
            <Field.ErrorText>{errors.batchName?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.approver}>
            <Field.Label htmlFor="approver">Approver</Field.Label>
            <select
              id="approver"
              data-testid="approver-select"
              {...register('approver')}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '16px',
                backgroundColor: 'white',
                color: '#1a202c',
              }}
            >
              <option value="">Select an approver</option>
              {randomizedApprovers.map((approverName) => (
                <option key={approverName} value={approverName}>
                  {approverName}
                </option>
              ))}
            </select>
            <Field.ErrorText>{errors.approver?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.file}>
            <Field.Label htmlFor="file">CSV File</Field.Label>
            <input
              id="file"
              data-testid="csv-file-input"
              type="file"
              accept=".csv"
              onChange={(e) => {
                // First pass event to RHF
                fileReg.onChange(e);
                const fl = (e.target as HTMLInputElement).files;
                if (fl) {
                  // Ensure RHF value is synchronized
                  setValue('file', fl as unknown as FileList, { shouldValidate: true });
                  const name = fl.length > 0 ? fl[0].name : '';
                  setSelectedName(name);
                }
                // Then recompute validity (microtask)
                setTimeout(recomputeValidity, 0);
              }}
              style={{ paddingTop: '4px' }}
            />
            {/* Visual feedback for selected file (always present for stable e2e) */}
            <Box
              mt={2}
              px={3}
              py={2}
              borderWidth="1px"
              borderRadius="md"
              bg="gray.50"
              color="gray.700"
              aria-live="polite"
              data-testid="selected-file-name"
            >
              Selected file: {selectedName || 'No file selected'}
            </Box>
            <Field.ErrorText>{errors.file?.message}</Field.ErrorText>
          </Field.Root>

          {/* Hidden submit button for external triggering */}
          <Button ref={hiddenSubmitRef} type="submit" display="none" aria-hidden="true">
            Submit
          </Button>
        </Stack>
      </form>
    </Box>
  );
});
