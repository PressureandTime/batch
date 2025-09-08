import { Box, Table, Text } from '@chakra-ui/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useRef } from 'react';
import type { ParsedRecord } from '../../types';
import { RowView } from './RowView';
import { StatusIndicator } from './StatusIndicator';

export interface Step2ReviewTableProps {
  rows: ParsedRecord[];
  emptyMessage?: string;
}

export const Step2ReviewTable = ({ rows, emptyMessage }: Step2ReviewTableProps) => {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const useVirtual = rows.length > 300;
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
  });

  const header = useMemo(
    () => (
      <Table.Header position="sticky" top={0} bg="white" zIndex={1}>
        <Table.Row>
          <Table.ColumnHeader w="80px">Status</Table.ColumnHeader>
          <Table.ColumnHeader minW="140px">Transaction Date</Table.ColumnHeader>
          <Table.ColumnHeader minW="220px">Account Number</Table.ColumnHeader>
          <Table.ColumnHeader minW="220px">Account Holder Name</Table.ColumnHeader>
          <Table.ColumnHeader minW="120px" textAlign="end" whiteSpace="nowrap">
            Amount
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
    ),
    []
  );

  if (rows.length === 0) {
    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        maxH={{ base: '350px', md: '420px', lg: '520px' }}
        minH="120px"
        overflow="hidden"
        pr={{ base: 4, md: 6 }}
        data-testid="review-table-empty"
        ref={parentRef}
      >
        <Box py={6} textAlign="center">
          <Text color="gray.600" data-testid="review-table-empty-message">
            {emptyMessage ?? 'No records to display'}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      maxH={{ base: '350px', md: '420px', lg: '520px' }}
      minH="150px"
      overflowY="auto"
      overflowX="auto"
      pr={{ base: 4, md: 6 }}
      data-testid="review-table"
      ref={parentRef}
    >
      <Table.Root variant="outline" size="sm">
        {header}

        {useVirtual ? (
          <Table.Body>
            <Table.Row>
              <Table.Cell colSpan={5} p={0}>
                <Box position="relative" height={`${rowVirtualizer!.getTotalSize()}px`}>
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    transform={`translateY(${rowVirtualizer!.getVirtualItems()[0]?.start ?? 0}px)`}
                  >
                    {rowVirtualizer!.getVirtualItems().map((v) => (
                      <RowView key={v.key} record={rows[v.index]} />
                    ))}
                  </Box>
                </Box>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        ) : (
          <Table.Body>
            {rows.map((record, index) => (
              <Table.Row
                key={index}
                bg={!record.isValid ? 'red.50' : 'transparent'}
                data-testid="review-row"
              >
                <Table.Cell>
                  <StatusIndicator isValid={record.isValid} errors={record.errors} />
                </Table.Cell>
                <Table.Cell>{String(record.data['Transaction Date'] ?? '')}</Table.Cell>
                <Table.Cell fontFamily="mono">
                  {String(record.data['Account Number'] ?? '')}
                </Table.Cell>
                <Table.Cell>{String(record.data['Account Holder Name'] ?? '')}</Table.Cell>
                <Table.Cell
                  textAlign="end"
                  pr={{ base: 2, md: 3 }}
                  whiteSpace="nowrap"
                  color="gray.800"
                >
                  {String(record.data['Amount'] ?? '')}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        )}
      </Table.Root>
    </Box>
  );
};
