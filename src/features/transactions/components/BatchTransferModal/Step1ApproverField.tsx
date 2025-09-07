import { Field } from '@chakra-ui/react';
import type { UseFormRegisterReturn } from 'react-hook-form';

export interface Step1ApproverFieldProps {
  randomizedApprovers: string[];
  register: UseFormRegisterReturn;
  errorMessage?: string;
}

export const Step1ApproverField = ({
  randomizedApprovers,
  register,
  errorMessage,
}: Step1ApproverFieldProps) => {
  return (
    <Field.Root invalid={!!errorMessage}>
      <Field.Label htmlFor="approver">Approver</Field.Label>
      <select
        id="approver"
        data-testid="approver-select"
        {...register}
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
      <Field.ErrorText>{errorMessage}</Field.ErrorText>
    </Field.Root>
  );
};

