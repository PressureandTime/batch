import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Field, Input, Stack, Text, SimpleGrid } from '@chakra-ui/react';
import { Step1ApproverField } from './Step1ApproverField';
import { Step1SelectedFileName } from './Step1SelectedFileName';
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

const approvers = ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Emma Davis'];

// FileList guard for browser and JSDOM
const isFileList = (val: unknown): val is FileList => {
  try {
    if (typeof FileList !== 'undefined' && val instanceof FileList) return true;
  } catch {
    /* noop */
  }
  const maybe = val as { length: number; item: (index: number) => unknown } | null | undefined;
  return !!maybe && typeof maybe.length === 'number' && typeof maybe.item === 'function';
};

// Schema permits reusing stored file on back navigation
export type Step1FormData = {
  batchName: string;
  approver: string;
  file: FileList | null | undefined;
};

export const makeStep1Schema = (hasStoredFile: boolean) =>
  z.object({
    batchName: z.string().min(1, 'Batch name is required'),
    approver: z.string().min(1, 'Approver selection is required'),
    // Allow empty file when reusing stored file (back-nav)
    file: z.any().superRefine((val, ctx) => {
      const allowEmpty = hasStoredFile;
      if (allowEmpty && (val == null || (isFileList(val) && val.length === 0))) {
        return;
      }

      if (!isFileList(val)) {
        ctx.addIssue({ code: 'custom', message: 'Invalid file input' });
        return;
      }

      if (!val || val.length === 0) {
        ctx.addIssue({ code: 'custom', message: 'File is required' });
        return;
      }

      const f = val[0];
      const isCsv = f?.type === 'text/csv' || f?.name?.endsWith('.csv');
      if (!isCsv) {
        ctx.addIssue({ code: 'custom', message: 'Only CSV files are allowed' });
      }
    }),
  });

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
  const randomizedApprovers = useMemo(() => [...approvers].sort(), []);
  const hiddenSubmitRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const step1Schema = useMemo(() => makeStep1Schema(!!storedFile), [storedFile]);

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

  const fileReg = register('file');

  const [selectedName, setSelectedName] = useState<string>('');

  // Keep validity in sync with RHF and native inputs
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
    recomputeValidity();
    const sub = watch(() => recomputeValidity());
    return () => {
      const maybe = sub as unknown as { unsubscribe?: () => void } | (() => void) | undefined;
      if (typeof maybe === 'function') {
        try {
          maybe();
        } catch {
          /* noop */
        }
      } else if (maybe && typeof maybe.unsubscribe === 'function') {
        maybe.unsubscribe();
      }
    };
  }, [watch, recomputeValidity]);

  // Listen to native input changes
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

  useEffect(() => {
    setSelectedName(storedFile?.name ?? '');
  }, [storedFile]);
  // Sync selectedName from DOM input
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
  // Sync selectedName when RHF file changes
  useEffect(() => {
    const sub = watch((vals: Partial<Step1FormData>) => {
      try {
        const files = vals.file;
        const name = files && files.length > 0 ? files[0]?.name ?? '' : '';
        if (name) setSelectedName(name);
      } catch {
        // no-op
      }
    });
    return () => {
      const maybe = sub as unknown as { unsubscribe?: () => void } | (() => void) | undefined;
      if (typeof maybe === 'function') {
        try {
          maybe();
        } catch {
          /* noop */
        }
      } else if (maybe && typeof maybe.unsubscribe === 'function') {
        maybe.unsubscribe();
      }
    };
  }, [watch]);

  const onFormSubmit = (data: Step1FormData) => {
    // File fallback: RHF → DOM → stored
    let fileList: FileList | null = data.file ?? null;
    if (!fileList || fileList.length === 0) {
      const domFiles = (document.getElementById('file') as HTMLInputElement | null)?.files ?? null;
      if (domFiles && domFiles.length > 0) fileList = domFiles;
    }

    const selectedFile = fileList?.[0] ?? storedFile ?? null;

    setStep1Data({
      batchName: data.batchName,
      approver: data.approver,
      file: selectedFile,
    });

    nextStep();
    onSubmit?.();
  };

  // Guard native submission path
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const handler = () => {
      setTimeout(recomputeValidity, 0);
    };
    el.addEventListener('submit', handler);
    return () => el.removeEventListener('submit', handler);
  }, [recomputeValidity]);

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
        <Stack gap={{ base: 6, md: 8 }}>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 6, md: 8 }}>
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

            <Step1ApproverField
              randomizedApprovers={randomizedApprovers}
              register={register('approver')}
              errorMessage={errors.approver?.message}
            />

            <Field.Root invalid={!!errors.file} gridColumn={{ base: 'auto', md: '1 / -1' }}>
              <Field.Label htmlFor="file">CSV File</Field.Label>
              <input
                id="file"
                data-testid="csv-file-input"
                type="file"
                accept=".csv"
                onChange={(e) => {
                  fileReg.onChange(e);
                  const fl = (e.target as HTMLInputElement).files;
                  if (fl) {
                    setValue('file', fl as unknown as FileList, { shouldValidate: true });
                    const name = fl.length > 0 ? fl[0].name : '';
                    setSelectedName(name);
                  }
                  setTimeout(recomputeValidity, 0);
                }}
                style={{ paddingTop: '4px' }}
              />
              <Step1SelectedFileName selectedName={selectedName} />
              <Field.ErrorText>{errors.file?.message}</Field.ErrorText>
            </Field.Root>
          </SimpleGrid>

          <Button ref={hiddenSubmitRef} type="submit" display="none" aria-hidden="true">
            Submit
          </Button>
        </Stack>
      </form>
    </Box>
  );
});
