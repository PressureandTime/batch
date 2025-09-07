import { useEffect, useMemo, useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import Papa from 'papaparse';
import { Box, Text, Table, Spinner, Center, Stack } from '@chakra-ui/react';
import { StatusIndicator } from './StatusIndicator';
import { RowView } from './RowView';
import type { ParseStepResult } from 'papaparse';

type CsvRow = Record<string, unknown>;

import { useBatchTransferStore } from './useBatchTransferStore';
import type { ParsedRecord } from '../../types';
import { transactionSchema } from './validation';
import { normalizeRowKeys } from './csv-normalize';

export const Step2_Review = () => {
  const { file, setParsedRecords, parsedRecords } = useBatchTransferStore();
  const [isLoading, setIsLoading] = useState(true);
  const [onlyInvalid, setOnlyInvalid] = useState(false);
  const isPending = false;

  const parentRef = useRef<HTMLDivElement | null>(null);

  // Memoize derived rows and counts for responsiveness
  const rows = useMemo(
    () => (onlyInvalid ? parsedRecords.filter((r) => !r.isValid) : parsedRecords),
    [parsedRecords, onlyInvalid]
  );
  const validCount = useMemo(() => parsedRecords.filter((r) => r.isValid).length, [parsedRecords]);
  const invalidCount = useMemo(
    () => parsedRecords.length - validCount,
    [parsedRecords.length, validCount]
  );

  // Enable virtualization for medium+ datasets
  const useVirtual = rows.length > 300;
  // Always call useVirtualizer to respect Rules of Hooks; choose whether to use it based on useVirtual
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
  });

  useEffect(() => {
    if (!file) return;

    let isActive = true;
    let watchdogId: number | null = null;
    let currentParser: { abort?: () => void } | null = null;

    setIsLoading(true);

    const run = (useWorker: boolean) => {
      try {
        const results: ParsedRecord[] = [];
        let progressed = 0;
        const FIRST_BATCH_SIZE = 1;
        const SUBSEQUENT_BATCH_SIZE = 1000;

        const config: {
          header: boolean;
          skipEmptyLines: boolean;
          worker: boolean;
          step: (result: ParseStepResult<CsvRow>) => void;
          complete: () => void;
          error: (error: unknown) => void;
        } = {
          header: true,
          skipEmptyLines: true,
          worker: useWorker,
          step: (result: ParseStepResult<CsvRow>) => {
            if (!isActive) return;
            progressed += 1;

            // Normalize keys before validation to tolerate case/space variations of canonical headers
            const normalized = normalizeRowKeys(result.data as CsvRow);

            const validation = transactionSchema.safeParse(normalized);

            if (validation.success) {
              results.push({
                data: validation.data as Record<string, unknown>,
                isValid: true,
                errors: {},
              });
            } else {
              results.push({
                data: normalized as Record<string, unknown>,
                isValid: false,
                errors: validation.error.flatten().fieldErrors,
              });
            }

            // Incremental UI updates to make review table visible early and responsive
            if (results.length === FIRST_BATCH_SIZE) {
              setParsedRecords([...results]);
              setIsLoading(false);
            } else if (
              results.length > FIRST_BATCH_SIZE &&
              results.length % SUBSEQUENT_BATCH_SIZE === 0
            ) {
              setParsedRecords([...results]);
            }
          },
          complete: () => {
            if (!isActive) return;
            if (watchdogId) window.clearTimeout(watchdogId);
            setParsedRecords([...results]);
            setIsLoading(false);
          },
          error: (error: unknown) => {
            if (!isActive) return;

            if (watchdogId) window.clearTimeout(watchdogId);
            if (useWorker) {
              // Fallback: retry without worker (some environments disallow workers in tests)
              run(false);
            } else {
              setIsLoading(false);
            }
          },
        };

        // The config discriminated union is tricky with worker on/off; cast narrowly here.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentParser = Papa.parse(file as File, config as any) as unknown as {
          abort?: () => void;
        };

        // Watchdog: if worker parse makes no progress quickly, abort and retry without worker
        if (useWorker) {
          watchdogId = window.setTimeout(() => {
            if (!isActive) return;
            if (progressed === 0) {
              try {
                currentParser?.abort?.();
              } catch {}
              run(false);
            }
          }, 5000);
        }
      } catch {
        if (useWorker) run(false);
        else setIsLoading(false);
      }
    };

    run(true);

    return () => {
      isActive = false;
      if (watchdogId) window.clearTimeout(watchdogId);
      try {
        currentParser?.abort?.();
      } catch {}
    };
  }, [file, setParsedRecords]);

  // counts are memoized above

  return (
    <Box>
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        Batch Transfer - Step 2 of 3
      </Text>

      {isLoading ? (
        <Center py={4}>
          <Stack align="center" gap={2}>
            <Spinner size="md" />
            <Text>Parsing and validating CSV file...</Text>
          </Stack>
        </Center>
      ) : null}

      <Stack gap={4} mb={6}>
        <Text fontWeight="bold">Validation Results:</Text>
        <Stack direction="row" gap={6} align="center">
          <Text color="green.500" data-testid="valid-count">
            {validCount} valid records
          </Text>
          <Text color="red.500" data-testid="invalid-count">
            {invalidCount} invalid records
          </Text>
          <Stack direction="row" align="center" ml="auto">
            <input
              type="checkbox"
              data-testid="only-invalid-toggle"
              checked={onlyInvalid}
              onChange={(e) => setOnlyInvalid(e.target.checked)}
            />
            <span>Show only invalid</span>
            {isPending ? (
              <Text
                as="span"
                fontSize="sm"
                color="gray.500"
                ml={3}
                data-testid="filtering-indicator"
              >
                Filtering...
              </Text>
            ) : null}
          </Stack>
        </Stack>
      </Stack>

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
          {rows.length === 0 && (
            <Table.Body>
              <Table.Row>
                <Table.Cell colSpan={5}>
                  <Text color="gray.500">Loading rows...</Text>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          )}

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
                      transform={`translateY(${
                        rowVirtualizer!.getVirtualItems()[0]?.start ?? 0
                      }px)`}
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
    </Box>
  );
};
