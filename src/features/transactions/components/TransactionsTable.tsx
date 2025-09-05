import { Table, Box, Text } from '@chakra-ui/react';
import type { Transaction } from '../types';
import { StatusBadge } from './StatusBadge';

interface TransactionsTableProps {
  transactions: Transaction[];
}

export const TransactionsTable = ({ transactions }: TransactionsTableProps) => {
  if (transactions.length === 0) {
    return (
      <Box p={5} borderWidth="1px" borderRadius="lg">
        <Text>No transactions to display.</Text>
      </Box>
    );
  }

  return (
    <Box borderWidth="1px" borderRadius="lg" data-testid="transactions-table">
      <Table.Root variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Batch Name</Table.ColumnHeader>
            <Table.ColumnHeader>Approver</Table.ColumnHeader>
            <Table.ColumnHeader>Transaction Date</Table.ColumnHeader>
            <Table.ColumnHeader>Account Number</Table.ColumnHeader>
            <Table.ColumnHeader>Account Holder Name</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">Amount</Table.ColumnHeader>
            <Table.ColumnHeader>Status</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {transactions.map((tx) => (
            <Table.Row key={tx.id} data-testid="tx-row">
              <Table.Cell>{tx.batchName}</Table.Cell>
              <Table.Cell>{tx.approver}</Table.Cell>
              <Table.Cell>{tx.transactionDate}</Table.Cell>
              <Table.Cell>{tx.accountNumber}</Table.Cell>
              <Table.Cell>{tx.accountHolderName}</Table.Cell>
              <Table.Cell textAlign="end">${tx.amount.toFixed(2)}</Table.Cell>
              <Table.Cell data-testid="tx-status">
                <StatusBadge status={tx.status} errorMessage={tx.errorMessage} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};
