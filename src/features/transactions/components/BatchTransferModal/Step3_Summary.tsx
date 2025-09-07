import { useMemo } from 'react';
import { Box, Text, Stack, Stat, Separator, Grid } from '@chakra-ui/react';
import { useBatchTransferStore } from './useBatchTransferStore';

export const Step3_Summary = () => {
  const { batchName, approver, parsedRecords } = useBatchTransferStore();

  // Calculate statistics using useMemo for performance
  const statistics = useMemo(() => {
    const validRecords = parsedRecords.filter((record) => record.isValid);

    if (validRecords.length === 0) {
      return {
        totalAmount: 0,
        numberOfPayments: 0,
        averagePaymentValue: 0,
      };
    }

    const totalAmount = validRecords.reduce((sum, record) => {
      const amount =
        typeof record.data.Amount === 'number'
          ? record.data.Amount
          : parseFloat(String(record.data.Amount)) || 0;
      return sum + amount;
    }, 0);

    const numberOfPayments = validRecords.length;
    const averagePaymentValue = totalAmount / numberOfPayments;

    return {
      totalAmount,
      numberOfPayments,
      averagePaymentValue,
    };
  }, [parsedRecords]);

  // Format currency with proper decimal places
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Box data-testid="summary-section">
      <Text fontSize="lg" fontWeight="semibold" mb={6}>
        Batch Transfer - Step 3 of 3
      </Text>

      {/* Batch Information Section */}
      <Stack gap={4} mb={6}>
        <Text fontSize="md" fontWeight="bold">
          Batch Information
        </Text>
        <Grid templateColumns="1fr 2fr" gap={4}>
          <Text fontWeight="medium" color="gray.600">
            Batch Name:
          </Text>
          <Text>{batchName}</Text>

          <Text fontWeight="medium" color="gray.600">
            Approver:
          </Text>
          <Text>{approver}</Text>
        </Grid>
      </Stack>

      <Separator mb={6} />

      {/* Statistics Section */}
      <Stack gap={4} mb={6}>
        <Text fontSize="md" fontWeight="bold">
          Transaction Statistics
        </Text>

        {statistics.numberOfPayments === 0 ? (
          <Box p={4} bg="yellow.50" borderRadius="md" borderWidth="1px" borderColor="yellow.200">
            <Text color="yellow.800" fontWeight="medium">
              No valid transactions found. Please review and correct the CSV data before proceeding.
            </Text>
          </Box>
        ) : (
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6}>
            <Stat.Root>
              <Stat.Label>Total Amount</Stat.Label>
              <Stat.ValueText
                data-testid="total-amount-value"
                fontSize="2xl"
                fontWeight="bold"
                color="green.600"
              >
                {formatCurrency(statistics.totalAmount)}
              </Stat.ValueText>
            </Stat.Root>

            <Stat.Root>
              <Stat.Label>Number of Payments</Stat.Label>
              <Stat.ValueText
                data-testid="number-of-payments-value"
                fontSize="2xl"
                fontWeight="bold"
                color="blue.600"
              >
                {statistics.numberOfPayments.toLocaleString()}
              </Stat.ValueText>
            </Stat.Root>

            <Stat.Root>
              <Stat.Label>Average Payment Value</Stat.Label>
              <Stat.ValueText
                data-testid="average-payment-value"
                fontSize="2xl"
                fontWeight="bold"
                color="purple.600"
              >
                {formatCurrency(statistics.averagePaymentValue)}
              </Stat.ValueText>
            </Stat.Root>
          </Grid>
        )}
      </Stack>

      {/* Final Confirmation Message */}
      {statistics.numberOfPayments > 0 && (
        <Box p={4} bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
          <Text color="blue.800" fontWeight="medium">
            Ready to submit batch transfer with {statistics.numberOfPayments} valid transactions
            totaling {formatCurrency(statistics.totalAmount)}.
          </Text>
        </Box>
      )}
    </Box>
  );
};
