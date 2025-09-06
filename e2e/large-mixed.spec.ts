import { test, expect } from '@playwright/test';
import path from 'path';

const sample = (name: string) => path.resolve(process.cwd(), 'sample-data', name);

test.describe('Large file - mixed 10k', () => {
  test.setTimeout(180_000);

  test('uploads 10k mixed and computes summary based on valid only', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('open-batch-transfer').click();
    await page.getByTestId('batch-name-input').fill('Large Mixed 10k');
    await page.getByTestId('approver-select').selectOption({ label: 'Bob Smith' });

    const filePath = sample('large-mixed-10000.csv');
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
    await expect(page.getByTestId('number-of-payments-value')).toHaveText('2,000');

    await page.getByTestId('submit-batch-btn').click();

    // After submission, ensure only valid ones are appended
    await expect(page.getByTestId('results-count')).toContainText('2003'); // 3 seeded + 2000 new
  });
});
