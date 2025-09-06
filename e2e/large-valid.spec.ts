import { test, expect } from '@playwright/test';
import path from 'path';

const sample = (name: string) => path.resolve(process.cwd(), 'sample-data', name);

// Large valid dataset; we avoid counting DOM rows for all 10k to keep it fast.
// We verify end-to-end: parse, counts, summary, and final results/pagination state.
test.describe('Large file - valid 10k', () => {
  test.setTimeout(120_000);

  test('uploads 10k valid and submits', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('open-batch-transfer').click();
    await page.getByTestId('batch-name-input').fill('Large Valid 10k');
    await page.getByTestId('approver-select').selectOption({ label: 'Alice Johnson' });

    const filePath = sample('large-valid-10000.csv');
    await page.getByTestId('csv-file-input').setInputFiles(filePath);
    await expect(page.getByTestId('next-btn')).toBeEnabled({ timeout: 60000 });

    await page.getByTestId('next-btn').click();
    // Ensure Step 2 is fully mounted and parsing has completed before proceeding
    await expect(page.getByTestId('step-title')).toContainText('Review', { timeout: 120_000 });
    await expect(page.getByText('Parsing and validating CSV file...')).toBeHidden({
      timeout: 300_000,
    });
    await expect(page.getByTestId('next-btn')).toBeEnabled({ timeout: 300_000 });
    await page.getByTestId('next-btn').click();

    await expect(page.getByText('Number of Payments')).toBeVisible({ timeout: 300_000 });
    await expect(page.getByText('Number of Payments')).toBeVisible({ timeout: 120_000 });
    await expect(page.getByTestId('number-of-payments-value')).toHaveText('10,000');

    // Just sanity-check average formatting exists (exact value depends on generator but not critical here)
    await expect(page.getByTestId('average-payment-value')).toContainText('$');

    await page.getByTestId('submit-batch-btn').click();

    // After submission, pagination should reflect large total; items per page initially 10
    await expect(page.getByTestId('items-per-page')).toHaveValue('10');
    await expect(page.getByTestId('results-count')).toContainText('10003'); // 3 seeded + 10000 new
  });
});
