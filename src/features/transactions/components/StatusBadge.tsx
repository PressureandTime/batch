import { Badge, Tooltip } from '@chakra-ui/react';
import type { TransactionStatus } from '../types';

/** Props for StatusBadge */
interface StatusBadgeProps {
  /** Status text to render */
  status: TransactionStatus;
  /** Optional error message for Failed status; shown in tooltip */
  errorMessage?: string;
}

/**
 * Map transaction status to Chakra color palette names.
 */
const statusColorMap: Record<TransactionStatus, string> = {
  Pending: 'yellow',
  Settled: 'green',
  Failed: 'red',
};

/**
 * Renders a status badge. When status is Failed and errorMessage exists,
 * wraps with a Tooltip displaying the message.
 */
export const StatusBadge = ({ status, errorMessage }: StatusBadgeProps) => {
  const colorPalette = statusColorMap[status];

  const badge = (
    <Badge
      colorPalette={colorPalette}
      variant="solid"
      borderRadius="md"
      px={3}
      py={1}
      fontSize="sm"
      fontWeight="medium"
      aria-label={`Transaction status: ${status}`}
    >
      {status}
    </Badge>
  );

  // Show tooltip only for Failed status with error message
  if (status === 'Failed' && errorMessage) {
    return (
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{badge}</Tooltip.Trigger>
        <Tooltip.Positioner>
          <Tooltip.Content
            bg="red.600"
            color="white"
            borderRadius="md"
            px={3}
            py={2}
            fontSize="sm"
            maxW="200px"
          >
            <Tooltip.Arrow>
              <Tooltip.ArrowTip />
            </Tooltip.Arrow>
            {errorMessage}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Tooltip.Root>
    );
  }

  return badge;
};
