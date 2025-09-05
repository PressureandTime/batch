import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Box, Text, Table, Spinner, Center, Stack, Tooltip, Checkbox } from '@chakra-ui/react';
import { useBatchTransferStore } from './useBatchTransferStore';
import type { ParsedRecord } from '../../types';
import { transactionSchema } from './validation';

export const Step2_Review = () => {
  const { file, setParsedRecords, parsedRecords } = useBatchTransferStore();
  const [isLoading, setIsLoading] = useState(true);
  const [onlyInvalid, setOnlyInvalid] = useState(false);

  useEffect(() => {
    if (file) {
      setIsLoading(true);
      const results: ParsedRecord[] = [];

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        step: (result) => {
          const validation = transactionSchema.safeParse(result.data);
          if (validation.success) {
            results.push({
              data: validation.data as Record<string, unknown>,
              isValid: true,
              errors: {},
            });
          } else {
            results.push({
              data: result.data as Record<string, unknown>,
              isValid: false,
              errors: validation.error.flatten().fieldErrors,
            });
          }
        },
        complete: () => {
          setParsedRecords(results);
          setIsLoading(false);
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          setIsLoading(false);
        },
      });
    }
  }, [file, setParsedRecords]);

  if (isLoading) {
    return (
      <Center py={10}>
        <Stack align="center" gap={4}>
          <Spinner size="lg" />
          <Text>Parsing and validating CSV file...</Text>
        </Stack>
      </Center>
    );
  }

  const validCount = parsedRecords.filter((record) => record.isValid).length;
  const invalidCount = parsedRecords.filter((record) => !record.isValid).length;

  return (
    <Box>
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        Batch Transfer - Step 2 of 3
      </Text>

      <Stack gap={4} mb={6}>
        <Text fontWeight="bold">Validation Results:</Text>
        <Stack direction="row" gap={6} align="center">
          <Text color="green.500" data-testid="valid-count">
            {validCount} valid records
          </Text>
          <Text color="red.500" data-testid="invalid-count">
            {invalidCount} invalid records
          </Text>
          <Checkbox.Root
            ml="auto"
            checked={onlyInvalid}
            onCheckedChange={(details) => setOnlyInvalid(details.checked === true)}
            data-testid="only-invalid-toggle"
          >
            <Checkbox.Control />
            <Checkbox.Label>Show only invalid</Checkbox.Label>
            <Checkbox.HiddenInput />
          </Checkbox.Root>
        </Stack>
      </Stack>

      <Box
        borderWidth="1px"
        borderRadius="lg"
        maxH="350px"
        overflowY="auto"
        data-testid="review-table"
      >
        <Table.Root variant="outline" size="sm">
          <Table.Header position="sticky" top={0} bg="white" zIndex={1}>
            <Table.Row>
              <Table.ColumnHeader w="12">Status</Table.ColumnHeader>
              <Table.ColumnHeader>Transaction Date</Table.ColumnHeader>
              <Table.ColumnHeader>Account Number</Table.ColumnHeader>
              <Table.ColumnHeader>Account Holder Name</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Amount</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {(onlyInvalid ? parsedRecords.filter((r) => !r.isValid) : parsedRecords).map(
              (record, index) => (
                <Table.Row
                  key={index}
                  bg={!record.isValid ? 'red.50' : 'transparent'}
                  data-testid="review-row"
                >
                  <Table.Cell>
                    {record.isValid ? (
                      <Text color="green.500" fontSize="lg" fontWeight="bold">
                        ✓
                      </Text>
                    ) : (
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <Text
                            color="red.500"
                            fontSize="lg"
                            fontWeight="bold"
                            cursor="pointer"
                            data-testid="invalid-status"
                          >
                            ⚠
                          </Text>
                        </Tooltip.Trigger>
                        <Tooltip.Positioner>
                          <Tooltip.Content
                            bg="red.600"
                            color="white"
                            borderRadius="md"
                            px={3}
                            py={2}
                            fontSize="sm"
                            maxW="300px"
                            data-testid="error-tooltip"
                          >
                            <Tooltip.Arrow>
                              <Tooltip.ArrowTip />
                            </Tooltip.Arrow>
                            {Object.entries(record.errors)
                              .filter(([, messages]) => messages && messages.length > 0)
                              .map(([field, messages]) => `${field}: ${messages?.join(', ')}`)
                              .join('; ')}
                          </Tooltip.Content>
                        </Tooltip.Positioner>
                      </Tooltip.Root>
                    )}
                  </Table.Cell>
                  <Table.Cell>{String(record.data['Transaction Date'] ?? '')}</Table.Cell>
                  <Table.Cell>{String(record.data['Account Number'] ?? '')}</Table.Cell>
                  <Table.Cell>{String(record.data['Account Holder Name'] ?? '')}</Table.Cell>
                  <Table.Cell textAlign="end">{String(record.data['Amount'] ?? '')}</Table.Cell>
                </Table.Row>
              )
            )}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
};
