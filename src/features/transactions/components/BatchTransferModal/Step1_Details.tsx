import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Field, Input, Select, Stack, Text } from '@chakra-ui/react';
import { useBatchTransferStore } from './useBatchTransferStore';
import { useRef, forwardRef, useImperativeHandle } from 'react';

// Approvers list as specified in requirements
const approvers = ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Emma Davis'];

// Zod validation schema
const step1Schema = z.object({
  batchName: z.string().min(1, 'Batch name is required'),
  approver: z.string().min(1, 'Approver selection is required'),
  file: z
    .instanceof(FileList)
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
  const { batchName, approver, setStep1Data, nextStep } = useBatchTransferStore();
  const hiddenSubmitRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      batchName,
      approver,
    },
  });

  const onFormSubmit = (data: Step1FormData) => {
    const selectedFile = data.file[0];

    // Update Zustand store with form data
    setStep1Data({
      batchName: data.batchName,
      approver: data.approver,
      file: selectedFile,
    });

    // Advance to next step
    nextStep();

    // Call external onSubmit if provided
    onSubmit?.();
  };

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

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Stack gap={6}>
          <Field.Root invalid={!!errors.batchName}>
            <Field.Label htmlFor="batchName">Batch Name</Field.Label>
            <Input
              id="batchName"
              data-testid="batch-name-input"
              {...register('batchName')}
              placeholder="Enter batch name"
              defaultValue={batchName}
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
              defaultValue={approver}
            >
              <option value="">Select an approver</option>
              {approvers.map((approverName) => (
                <option key={approverName} value={approverName}>
                  {approverName}
                </option>
              ))}
            </select>
            <Field.ErrorText>{errors.approver?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.file}>
            <Field.Label htmlFor="file">CSV File</Field.Label>
            <Input
              id="file"
              data-testid="csv-file-input"
              type="file"
              accept=".csv"
              {...register('file')}
              pt={1}
            />
            {/* Visual feedback for selected file */}
            {(() => {
              const files = watch('file');
              const fileName = files && files.length > 0 ? files[0].name : '';
              return fileName ? (
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
                  Selected file: {fileName}
                </Box>
              ) : null;
            })()}
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
