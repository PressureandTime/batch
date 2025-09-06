import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Box, Button, HStack, Input, Stack, Text, useBreakpointValue } from '@chakra-ui/react';

export interface PaginationProps {
  /** Current page (1-based) */
  page: number;
  /** Total number of pages (>= 1) */
  totalPages: number;
  /** Callback invoked when page changes */
  onChange: (page: number) => void;
  /** Max numeric buttons to show including the current window (first/last not counted). Default 7. */
  maxButtons?: number;
  /** Whether to show jump-to-page input. Default true. */
  showJump?: boolean;
}

/** Compute a windowed list of page tokens including ellipses. */
function usePageTokens(page: number, totalPages: number, maxButtons = 7): (number | '…')[] {
  return useMemo(() => {
    const tp = Math.max(1, Math.floor(totalPages));
    const p = Math.min(tp, Math.max(1, Math.floor(page)));
    const max = Math.max(3, Math.floor(maxButtons));

    if (tp <= max) {
      return Array.from({ length: tp }, (_, i) => i + 1);
    }

    const windowSize = Math.max(1, max - 2); // exclude first/last
    let start = Math.max(2, p - Math.floor(windowSize / 2));
    let end = Math.min(tp - 1, start + windowSize - 1);
    // ensure full window when near end
    start = Math.max(2, Math.min(start, Math.max(2, tp - 1 - (windowSize - 1))));
    end = Math.min(tp - 1, Math.max(end, start + windowSize - 1));

    const tokens: (number | '…')[] = [1];
    if (start > 2) tokens.push('…');
    for (let i = start; i <= end; i++) tokens.push(i);
    if (end < tp - 1) tokens.push('…');
    tokens.push(tp);
    return tokens;
  }, [page, totalPages, maxButtons]);
}

export const Pagination = ({
  page,
  totalPages,
  onChange,
  maxButtons = 7,
  showJump = true,
}: PaginationProps) => {
  const responsiveMaxButtons = useBreakpointValue<number>({
    base: Math.min(maxButtons, 5),
    md: maxButtons,
  });
  const tokens = usePageTokens(page, totalPages, responsiveMaxButtons ?? maxButtons);
  const [jump, setJump] = useState<string>('');

  const goTo = (p: number) => {
    const tp = Math.max(1, Math.floor(totalPages));
    const clamped = Math.min(tp, Math.max(1, Math.floor(p)));
    if (clamped !== page) onChange(clamped);
  };

  const onSubmitJump = (e: FormEvent) => {
    e.preventDefault();
    const val = parseInt(jump, 10);
    if (Number.isFinite(val)) {
      goTo(val);
    }
  };

  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <Stack direction={{ base: 'column', sm: 'row' }} align="center" gap={3} as={Box} asChild>
      <nav aria-label="Results pagination">
        <HStack wrap="wrap" gap={3} align="center">
          <Button
            size="sm"
            onClick={() => goTo(1)}
            disabled={isFirst}
            aria-disabled={isFirst}
            data-testid="pagination-first"
          >
            First
          </Button>
          <Button
            size="sm"
            onClick={() => goTo(page - 1)}
            disabled={isFirst}
            aria-disabled={isFirst}
            data-testid="pagination-prev"
          >
            Previous
          </Button>

          {tokens.map((t, idx) =>
            t === '…' ? (
              <Box key={`ellipsis-${idx}`} data-testid="pagination-ellipsis" aria-hidden>
                …
              </Box>
            ) : (
              <Button
                key={t}
                size="sm"
                variant={t === page ? 'solid' : 'outline'}
                aria-current={t === page ? 'page' : undefined}
                onClick={() => goTo(t)}
                data-testid={`pagination-page-${t}`}
              >
                {t}
              </Button>
            )
          )}

          <Button
            size="sm"
            onClick={() => goTo(page + 1)}
            disabled={isLast}
            aria-disabled={isLast}
            data-testid="pagination-next"
          >
            Next
          </Button>
          <Button
            size="sm"
            onClick={() => goTo(totalPages)}
            disabled={isLast}
            aria-disabled={isLast}
            data-testid="pagination-last"
          >
            Last
          </Button>

          <Text as="span" fontSize="sm" data-testid="pagination-label">
            Page {Math.max(1, Math.min(page, totalPages))} of {Math.max(1, totalPages)}
          </Text>

          {showJump && totalPages > 1 && (
            <Box
              as="form"
              onSubmit={onSubmitJump}
              display="flex"
              alignItems="center"
              gap={2}
              ml={{ base: 0, md: 2 }}
            >
              <Input
                size="sm"
                type="number"
                min={1}
                max={totalPages}
                placeholder="Go to page"
                value={jump}
                onChange={(e) => setJump(e.currentTarget.value)}
                data-testid="pagination-jump-input"
                aria-label="Go to page"
                width={{ base: '24', sm: '28' }}
              />
              <Button size="sm" type="submit" data-testid="pagination-jump-go">
                Go
              </Button>
            </Box>
          )}
        </HStack>
      </nav>
    </Stack>
  );
};
