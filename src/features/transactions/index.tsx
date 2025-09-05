import { Box, Button, Container, Heading, Stack, Text, NativeSelect } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TransactionsTable } from './components/TransactionsTable';
import { BatchTransferModal } from './components/BatchTransferModal';
import type { Transaction } from './types';

// Initial mock data to populate the table and demonstrate all status types
const initialTransactions: Transaction[] = [
  {
    id: uuidv4(),
    batchName: 'Initial Seed',
    approver: 'System',
    transactionDate: '2025-01-15',
    accountNumber: '000-123456789-01',
    accountHolderName: 'John Doe',
    amount: 1250.0,
    status: 'Settled',
  },
  {
    id: uuidv4(),
    batchName: 'Initial Seed',
    approver: 'System',
    transactionDate: '2025-01-16',
    accountNumber: '000-987654321-02',
    accountHolderName: 'Jane Smith',
    amount: 750.5,
    status: 'Pending',
  },
  {
    id: uuidv4(),
    batchName: 'Initial Seed',
    approver: 'System',
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

  const [currentPage, setCurrentPage] = useState<number>(() => {
    try {
      const params = new URL(window.location.href).searchParams;
      const fromUrl = parseInt(params.get('page') || '', 10);
      if (Number.isFinite(fromUrl) && fromUrl > 0) return fromUrl;
    } catch {}
    const saved = localStorage.getItem('txPage');
    return saved ? Math.max(1, parseInt(saved, 10) || 1) : 1;
  });
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    try {
      const params = new URL(window.location.href).searchParams;
      const fromUrl = parseInt(params.get('pageSize') || '', 10);
      if (Number.isFinite(fromUrl) && fromUrl > 0) return fromUrl;
    } catch {}
    const saved = localStorage.getItem('txItemsPerPage');
    return saved ? Math.max(1, parseInt(saved, 10) || 10) : 10;
  });

  const handleBatchSubmit = (newTransactions: Transaction[]) => {
    setTransactions((prev) => {
      const updated = [...prev, ...newTransactions];
      const newTotalPages = Math.max(1, Math.ceil(updated.length / itemsPerPage));
      setCurrentPage(newTotalPages); // jump to last page to show newest rows
      return updated;
    });
  };

  const paginatedTransactions = useMemo(() => {
    const end = currentPage * itemsPerPage;
    const start = end - itemsPerPage;
    return transactions.slice(start, end);
  }, [transactions, currentPage, itemsPerPage]);

  // reflect state in URL for deep-linking
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', String(currentPage));
    url.searchParams.set('pageSize', String(itemsPerPage));
    window.history.replaceState(null, '', url);
  }, [currentPage, itemsPerPage]);

  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  // persist pagination state
  useEffect(() => {
    localStorage.setItem('txPage', String(currentPage));
  }, [currentPage]);
  useEffect(() => {
    localStorage.setItem('txItemsPerPage', String(itemsPerPage));
  }, [itemsPerPage]);

  return (
    <Container maxW="6xl" py={10}>
      <Stack gap={8} align="stretch">
        <Box>
          <Heading as="h1" size="4xl" mb={4}>
            Transaction Dashboard
          </Heading>
          <Button
            data-testid="open-batch-transfer"
            colorPalette="blue"
            onClick={() => setIsModalOpen(true)}
          >
            Batch Transfer
          </Button>
        </Box>

        <TransactionsTable transactions={paginatedTransactions} />

        <Stack direction="row" justify="space-between" align="center">
          <Stack direction="row" align="center" gap={3}>
            <Text fontSize="sm" data-testid="results-count">
              {transactions.length} result{transactions.length === 1 ? '' : 's'}
            </Text>
            <NativeSelect.Root size="sm" width="auto">
              <NativeSelect.Field
                data-testid="items-per-page"
                value={String(itemsPerPage)}
                onChange={(e) => {
                  const next = parseInt(e.currentTarget.value, 10);
                  setItemsPerPage(next);
                  const newTotal = Math.max(1, Math.ceil(transactions.length / next));
                  if (currentPage > newTotal) setCurrentPage(newTotal);
                }}
              >
                <option value="10">10 / page</option>
                <option value="25">25 / page</option>
                <option value="50">50 / page</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Stack>

          {totalPages > 1 ? (
            <Stack direction="row" justify="flex-end" gap={4} align="center">
              <Button
                data-testid="pagination-prev"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Text data-testid="pagination-label">
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                data-testid="pagination-next"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </Stack>
          ) : (
            <Text data-testid="pagination-label">Page 1 of 1</Text>
          )}
        </Stack>
      </Stack>

      <BatchTransferModal
        open={isModalOpen}
        onOpenChange={(details) => setIsModalOpen(details.open)}
        onSubmit={handleBatchSubmit}
      />
    </Container>
  );
};
