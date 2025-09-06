import { test, expect } from '@playwright/test';

/**
 * Verify that the Failed status shows its tooltip with the error message
 * for the seeded rows on initial load.
 */

test.describe('Failed status tooltip', () => {
  test('shows error tooltip on hover for Failed row', async ({ page }) => {
    await page.goto('/');

    // Find the last row (seeded failed row is last among initial 3)
    const lastStatusCell = page
      .locator('[data-testid="transactions-table"] [data-testid="tx-row"] [data-testid="tx-status"]')
      .last();

    // Hover to trigger tooltip
    await lastStatusCell.hover();

    // The seeded error message is set in initial data
    await expect(page.getByText('Insufficient funds in account')).toBeVisible();
  });
});

