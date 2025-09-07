import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { Box, Text, Spinner, Center, Stack } from '@chakra-ui/react';
import type { ParseStepResult } from 'papaparse';
import { Step2ReviewControls } from './Step2ReviewControls';
import { Step2ReviewTable } from './Step2ReviewTable';

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

  // Derived rows and counts
  const rows = useMemo(
    () => (onlyInvalid ? parsedRecords.filter((r) => !r.isValid) : parsedRecords),
    [parsedRecords, onlyInvalid]
  );
  const validCount = useMemo(() => parsedRecords.filter((r) => r.isValid).length, [parsedRecords]);
  const invalidCount = useMemo(
    () => parsedRecords.length - validCount,
    [parsedRecords.length, validCount]
  );

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

            // Normalize keys before validation
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
                errors: validation.error.issues.reduce<Record<string, string[]>>(
                  (
                    acc: Record<string, string[]>,
                    issue: { path: Array<string | number | symbol>; message: string }
                  ) => {
                    const key = issue.path?.[0];
                    if (typeof key === 'string') {
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(issue.message);
                    }
                    return acc;
                  },
                  {}
                ),
              });
            }

            // Show some rows quickly, then update in batches
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
          error: () => {
            if (!isActive) return;

            if (watchdogId) window.clearTimeout(watchdogId);
            if (useWorker) {
              // Retry without worker if needed
              run(false);
            } else {
              setIsLoading(false);
            }
          },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentParser = Papa.parse(file as File, config as any) as unknown as {
          abort?: () => void;
        };

        // Watchdog to fallback if worker stalls
        if (useWorker) {
          watchdogId = window.setTimeout(() => {
            if (!isActive) return;
            if (progressed === 0) {
              try {
                currentParser?.abort?.();
              } catch {
                /* noop */
              }
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
      } catch {
        /* noop */
      }
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

      <Step2ReviewControls
        validCount={validCount}
        invalidCount={invalidCount}
        onlyInvalid={onlyInvalid}
        onToggleOnlyInvalid={(checked) => setOnlyInvalid(checked)}
        isPending={isPending}
      />

      <Step2ReviewTable rows={rows} />
    </Box>
  );
};
