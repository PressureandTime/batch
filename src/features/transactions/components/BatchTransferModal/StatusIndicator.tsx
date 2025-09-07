import { Text, Tooltip } from '@chakra-ui/react';
import type { ParsedRecord } from '../../types';

export interface StatusIndicatorProps {
  isValid: boolean;
  errors: ParsedRecord['errors'];
}

export const StatusIndicator = ({ isValid, errors }: StatusIndicatorProps) => {
  if (isValid) {
    return (
      <Text color="green.500" fontSize="lg" fontWeight="bold">
        ✓
      </Text>
    );
  }

  const getErrorText = (errs: ParsedRecord['errors']): string =>
    Object.entries(errs)
      .filter(([, messages]) => messages && messages.length > 0)
      .map(([field, messages]) => `${field}: ${messages?.join(', ')}`)
      .join('; ');

  return (
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
          {getErrorText(errors)}
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  );
};
