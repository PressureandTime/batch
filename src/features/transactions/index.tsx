import { Box, Button, Container, Heading, Stack } from '@chakra-ui/react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TransactionsTable } from './components/TransactionsTable';
import { BatchTransferModal } from './components/BatchTransferModal';
import type { Transaction } from './types';

// Initial mock data to populate the table and demonstrate all status types
const initialTransactions: Transaction[] = [
  {
    id: uuidv4(),
    transactionDate: '2025-01-15',
    accountNumber: '000-123456789-01',
    accountHolderName: 'John Doe',
    amount: 1250.0,
    status: 'Settled',
  },
  {
    id: uuidv4(),
    transactionDate: '2025-01-16',
    accountNumber: '000-987654321-02',
    accountHolderName: 'Jane Smith',
    amount: 750.5,
    status: 'Pending',
  },
  {
    id: uuidv4(),
    transactionDate: '2025-01-17',
    accountNumber: '000-111222333-03',
    accountHolderName: 'Bob Johnson',
    amount: 500.0,
    status: 'Failed',
    errorMessage: 'Insufficient funds in account',
  },
];

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBatchSubmit = (newTransactions: Transaction[]) => {
    setTransactions((prev) => [...prev, ...newTransactions]);
  };

  return (
    <Container maxW="6xl" py={10}>
      <Stack gap={8} align="stretch">
        <Box>
          <Heading as="h1" size="4xl" mb={4}>
            Transaction Dashboard
          </Heading>
          <Button colorPalette="blue" onClick={() => setIsModalOpen(true)}>
            Batch Transfer
          </Button>
        </Box>

        <TransactionsTable transactions={transactions} />
      </Stack>

      <BatchTransferModal
        open={isModalOpen}
        onOpenChange={(details) => setIsModalOpen(details.open)}
        onSubmit={handleBatchSubmit}
      />
    </Container>
  );
};
