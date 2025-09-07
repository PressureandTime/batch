/** CSV header validation mode (code-level switch).
 * Strict (default): accept only canonical headers from requirements.md.
 * Permissive: also accept a few common synonyms.
 */
export let STRICT_HEADER_MODE: boolean = true;

// Test helper: switch modes within unit tests.
export const setStrictHeaderModeForTests = (value: boolean): void => {
  STRICT_HEADER_MODE = value;
};
