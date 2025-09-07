import { test, expect } from '@playwright/test';
import path from 'path';

const sample = (name: string) => path.resolve(process.cwd(), 'sample-data', name);

test.describe('Batch Transfer - Back navigation preserves selected file', () => {
  test('remembers file when navigating back to Step 1 and proceeding again', async ({ page }) => {
    await page.goto('/');

    // Open modal
    await page.getByTestId('open-batch-transfer').click();
    await expect(page.getByTestId('batch-transfer-dialog')).toBeVisible();

    // Step 1 inputs
    await page.getByTestId('batch-name-input').fill('Back Nav Batch');
    await page.getByTestId('approver-select').selectOption({ label: 'David Brown' });

    const filePath = sample('valid-transactions.csv');
    await page.getByTestId('csv-file-input').setInputFiles(filePath);
    await expect(page.getByTestId('selected-file-name')).toContainText('valid-transactions.csv');

    // Step 2
    await page.getByTestId('next-btn').click();
    await expect(page.getByTestId('step-title')).toContainText('Review');
    await expect(page.getByText('Parsing and validating CSV file...')).toBeHidden({
      timeout: 15000,
    });
    await expect(page.getByTestId('review-table')).toBeVisible({ timeout: 15000 });

    // Step 3
    await page.getByTestId('next-btn').click();
    await expect(page.getByTestId('step-title')).toContainText('Summary');

    // Back to Step 2 then Step 1
    await page.getByTestId('previous-btn').click();
    await expect(page.getByTestId('step-title')).toContainText('Review');
    await page.getByTestId('previous-btn').click();
    await expect(page.getByTestId('step-title')).toContainText('Transfer Details');

    // Proceed forward again
    await page.getByTestId('next-btn').click();

    // EXPECTED: we should land on Step 2 without needing to re-upload and without error
    await expect(page.getByTestId('step-title')).toContainText('Review');

    // If the app instead shows an error on Step 1, capture it for diagnosis
    const error = page.getByText('Invalid file input');
    if (await error.isVisible()) {
      await page.screenshot({
        path: 'playwright-artifacts/back-nav-invalid-file.png',
        fullPage: true,
      });
    }
  });
});
