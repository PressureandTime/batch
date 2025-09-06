import { test, expect } from '@playwright/test';
import path from 'path';

const sample = (name: string) => path.resolve(process.cwd(), 'sample-data', name);

test.describe('Header mismatch handling', () => {
  test('zero or near-zero valid when headers are wrong and submit disabled', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('open-batch-transfer').click();
    await page.getByTestId('batch-name-input').fill('Header Mismatch');
    await page.getByTestId('approver-select').selectOption({ label: 'Carol Williams' });

    const filePath = sample('header-mismatch.csv');
    await page.getByTestId('csv-file-input').setInputFiles(filePath);

    await page.getByTestId('next-btn').click();

    await expect(page.getByTestId('review-table')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('valid-count')).toContainText('0');

    await page.getByTestId('next-btn').click();
    // With zero valid records, submit should be disabled
    await expect(page.getByTestId('submit-batch-btn')).toBeDisabled();
  });
});

