import { Box } from '@chakra-ui/react';

export interface Step1SelectedFileNameProps {
  selectedName: string;
}

export const Step1SelectedFileName = ({ selectedName }: Step1SelectedFileNameProps) => (
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
);

