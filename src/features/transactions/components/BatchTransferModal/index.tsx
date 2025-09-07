/**
 * BatchTransferModal
 * Wraps a three step batch transfer flow in a Chakra Dialog.
 * Controls step navigation and submission via the Zustand store.
 * Step 1 validation happens in Step1_Details; we trigger that form submit here.
 */
import { Dialog, Button, Stack, Box, Portal } from '@chakra-ui/react';
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
  const { currentStep, prevStep, nextStep, reset, parsedRecords, batchName, approver } =
    useBatchTransferStore();

  const step1Ref = useRef<Step1DetailsRef>(null);

  const handleClose = () => {
    reset(); // Reset store on close
    onOpenChange({ open: false });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Trigger submit on Step 1 form
      step1Ref.current?.triggerSubmit();
    } else {
      nextStep();
    }
  };

  const handleSubmit = () => {
    if (onSubmit) {
      // Build Transaction objects from valid rows
      const validTransactions: Transaction[] = parsedRecords
        .filter((record) => record.isValid)
        .map((record, index) => ({
          id: `batch-${Date.now()}-${index}`,
          batchName,
          approver,
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
    if (currentStep === 1) {
      // Allow Next; Step 1 form blocks and shows errors if invalid
      return true;
    }
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
      closeOnInteractOutside={false}
    >
      <Portal>
        <Dialog.Backdrop position="fixed" inset={0} />
        <Dialog.Positioner
          position="fixed"
          inset={0}
          w="100vw"
          h="100vh"
          display="grid"
          placeItems="center"
        >
          <Dialog.Content
            w="full"
            maxW={{
              base: 'calc(100vw - 2rem)', // phones: unchanged
              md: 'min(96vw, 960px)', // tablets: near-full width with safe cap
              lg: 'min(92vw, 1200px)', // laptops/desktops
              xl: 'min(88vw, 1440px)', // larger desktops
              '2xl': 'min(80vw, 1600px)', // very large screens
            }}
            mx="auto"
            data-testid="batch-transfer-dialog"
          >
            <Dialog.Header>
              <Dialog.Title data-testid="step-title">{getStepTitle()}</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>

            <Dialog.Body py={6} minH="400px">
              {renderCurrentStep()}
            </Dialog.Body>

            <Dialog.Footer>
              <Stack direction="row" gap={3} justify="space-between" w="full">
                <Box>
                  {currentStep > 1 && (
                    <Button variant="outline" onClick={prevStep} data-testid="previous-btn">
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
                    _focus={{ boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)' }}
                  >
                    Cancel
                  </Button>

                  {currentStep < 3 ? (
                    <Button
                      colorPalette="blue"
                      onClick={handleNext}
                      disabled={!canProceed()}
                      data-testid="next-btn"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      colorPalette="green"
                      onClick={handleSubmit}
                      disabled={!canProceed()}
                      data-testid="submit-batch-btn"
                      aria-label="Submit Batch"
                    >
                      Submit Batch
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
