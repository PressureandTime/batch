import { Box, Text } from '@chakra-ui/react';
import type { ParsedRecord } from '../../types';
import { StatusIndicator } from './StatusIndicator';

export interface RowViewProps {
  record: ParsedRecord;
}

// Non-table row view used inside the virtualized path (grid-based)
export const RowView = ({ record }: RowViewProps) => {
  return (
    <Box
      data-testid="review-row"
      display="grid"
      gridTemplateColumns="80px minmax(140px, 200px) minmax(220px, 0.9fr) minmax(220px, 1fr) max-content"
      columnGap={2}
      alignItems="center"
      bg={!record.isValid ? 'red.50' : 'transparent'}
      borderBottomWidth="1px"
      px={{ base: 3, md: 4 }}
      py={{ base: 2, md: 3 }}
    >
      <Box>
        <StatusIndicator isValid={record.isValid} errors={record.errors} />
      </Box>
      <Box>{String(record.data['Transaction Date'] ?? '')}</Box>
      <Box fontFamily="mono">{String(record.data['Account Number'] ?? '')}</Box>
      <Box>{String(record.data['Account Holder Name'] ?? '')}</Box>
      <Box textAlign="end" pr={{ base: 2, md: 3 }} whiteSpace="nowrap" color="gray.800">
        {String(record.data['Amount'] ?? '')}
      </Box>
    </Box>
  );
};

