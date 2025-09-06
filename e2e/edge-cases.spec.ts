import { test, expect } from '@playwright/test';
import path from 'path';

const sample = (name: string) => path.resolve(process.cwd(), 'sample-data', name);

test.describe('Edge cases for amounts and dates', () => {
  test('validates zero/negative amounts and boundary dates', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('open-batch-transfer').click();
    await page.getByTestId('batch-name-input').fill('Edge Cases');
    await page.getByTestId('approver-select').selectOption({ label: 'David Brown' });

    const filePath1 = sample('edge-amounts.csv');
    await page.getByTestId('csv-file-input').setInputFiles(filePath1);
    await page.getByTestId('next-btn').click();
    await expect(page.getByTestId('review-table')).toBeVisible({ timeout: 30000 });

    // Expect: Zero and negative invalidate, comma amount is valid; spaces around amounts are trimmed and parsed
    await expect(page.getByTestId('invalid-count')).not.toContainText('0');

    await page.getByTestId('previous-btn').click();

    const filePath2 = sample('boundary-dates.csv');
    await page.getByTestId('csv-file-input').setInputFiles(filePath2);
    await page.getByTestId('next-btn').click();
    await expect(page.getByTestId('review-table')).toBeVisible({ timeout: 30000 });

    // Mixed valid/invalid per file design
    await expect(page.getByTestId('valid-count')).not.toContainText('0');
    await expect(page.getByTestId('invalid-count')).not.toContainText('0');
  });
});

