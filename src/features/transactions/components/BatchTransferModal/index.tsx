import { Dialog, Button, Stack, Text, Box } from '@chakra-ui/react';
import { useRef } from 'react';
import type { Transaction } from '../../types';
import { useBatchTransferStore } from './useBatchTransferStore';
import { Step1_Details, type Step1DetailsRef } from './Step1_Details';
import { Step2_Review } from './Step2_Review';
import { Step3_Summary } from './Step3_Summary';

interface BatchTransferModalProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  onSubmit?: (transactions: Transaction[]) => void;
}

export const BatchTransferModal = ({ open, onOpenChange, onSubmit }: BatchTransferModalProps) => {
  const { currentStep, prevStep, nextStep, reset, parsedRecords } = useBatchTransferStore();
  const step1Ref = useRef<Step1DetailsRef>(null);

  const handleClose = () => {
    reset(); // Reset store when closing
    onOpenChange({ open: false });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Trigger Step 1 form submission
      step1Ref.current?.triggerSubmit();
    } else {
      nextStep();
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      // Convert valid parsed records to Transaction format
      const validTransactions: Transaction[] = parsedRecords
        .filter((record) => record.isValid)
        .map((record, index) => ({
          id: `batch-${Date.now()}-${index}`,
          transactionDate: String(record.data['Transaction Date']),
          accountNumber: String(record.data['Account Number']),
          accountHolderName: String(record.data['Account Holder Name']),
          amount:
            typeof record.data.Amount === 'number'
              ? record.data.Amount
              : parseFloat(String(record.data.Amount)) || 0,
          status: 'Pending' as const,
        }));

      onSubmit(validTransactions);
    }
    handleClose();
  };

  const canProceed = () => {
    if (currentStep === 3) {
      return parsedRecords.some((record) => record.isValid);
    }
    return true;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Transfer Details';
      case 2:
        return 'Review & Validate';
      case 3:
        return 'Summary & Submit';
      default:
        return 'Batch Transfer';
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1_Details ref={step1Ref} />;
      case 2:
        return <Step2_Review />;
      case 3:
        return <Step3_Summary />;
      default:
        return null;
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => (details.open ? null : handleClose())}
      size="xl"
      closeOnInteractOutside={false}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="900px" mx={4}>
          <Dialog.Header>
            <Dialog.Title>{getStepTitle()}</Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>

          <Dialog.Body py={6} minH="400px">
            {renderCurrentStep()}
          </Dialog.Body>

          <Dialog.Footer>
            <Stack direction="row" gap={3} justify="space-between" w="full">
              <Box>
                {currentStep > 1 && (
                  <Button variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
              </Box>

              <Stack direction="row" gap={3}>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  borderColor="gray.300"
                  color="gray.700"
                  _hover={{ bg: 'gray.50' }}
                >
                  Cancel
                </Button>

                {currentStep < 3 ? (
                  <Button colorPalette="blue" onClick={handleNext} disabled={!canProceed()}>
                    Next
                  </Button>
                ) : (
                  <Button colorPalette="green" onClick={handleSubmit} disabled={!canProceed()}>
                    Submit Batch
                  </Button>
                )}
              </Stack>
            </Stack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
