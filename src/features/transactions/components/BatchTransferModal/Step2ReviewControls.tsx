import { Stack, Text } from '@chakra-ui/react';

export interface Step2ReviewControlsProps {
  validCount: number;
  invalidCount: number;
  onlyInvalid: boolean;
  onToggleOnlyInvalid: (checked: boolean) => void;
  isPending?: boolean;
}

export const Step2ReviewControls = ({
  validCount,
  invalidCount,
  onlyInvalid,
  onToggleOnlyInvalid,
  isPending = false,
}: Step2ReviewControlsProps) => {
  return (
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
            id="only-invalid-toggle"
            name="onlyInvalid"
            type="checkbox"
            data-testid="only-invalid-toggle"
            checked={onlyInvalid}
            onChange={(e) => onToggleOnlyInvalid(e.target.checked)}
          />
          <label htmlFor="only-invalid-toggle">Show only invalid</label>
          {isPending ? (
            <Text as="span" fontSize="sm" color="gray.500" ml={3} data-testid="filtering-indicator">
              Filtering...
            </Text>
          ) : null}
        </Stack>
      </Stack>
    </Stack>
  );
};
