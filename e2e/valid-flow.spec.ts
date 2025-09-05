import { test, expect } from '@playwright/test';
import path from 'path';

const sample = (name: string) => path.resolve(process.cwd(), 'sample-data', name);

test.describe('Batch Transfer - Valid CSV Flow', () => {
  test('uploads valid CSV and submits, appending 5 pending rows', async ({ page }) => {
    await page.goto('/');

    // Open modal
    await page.getByTestId('open-batch-transfer').click();
    await expect(page.getByTestId('batch-transfer-dialog')).toBeVisible();

    // Step 1: fill form
    await page.getByTestId('batch-name-input').fill('Test Batch 1');
    await page.getByTestId('approver-select').selectOption({ label: 'Alice Johnson' });

    const filePath = sample('valid-transactions.csv');
    await page.getByTestId('csv-file-input').setInputFiles(filePath);
    await expect(page.getByTestId('selected-file-name')).toContainText('valid-transactions.csv');

    // Record initial row count in main table
    const initialRows = await page
      .locator('[data-testid="transactions-table"] [data-testid="tx-row"]')
      .count();

    // Next to Step 2
    await page.getByTestId('next-btn').click();
    await expect(page.getByTestId('step-title')).toContainText('Review');
    // Wait for parsing to finish by checking either spinner text disappears or table appears
    await expect(page.getByText('Parsing and validating CSV file...')).toBeHidden({
      timeout: 15000,
    });
    await expect(page.getByTestId('review-table')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('valid-count')).toContainText('5');
    await expect(page.getByTestId('invalid-count')).toContainText('0');

    // Next to Step 3
    await page.getByTestId('next-btn').click();
    await expect(page.getByText('Total Amount')).toBeVisible();
    await expect(page.getByTestId('total-amount-value')).toHaveText('$1,051.50');
    await expect(page.getByText('Number of Payments')).toBeVisible();
    await expect(page.getByTestId('number-of-payments-value')).toHaveText('5');
    await expect(page.getByText('Average Payment Value')).toBeVisible();
    await expect(page.getByTestId('average-payment-value')).toHaveText('$210.30');

    // Submit
    await page.getByTestId('submit-batch-btn').click();

    // Verify 5 new rows appended with Pending status
    const finalRows = await page
      .locator('[data-testid="transactions-table"] [data-testid="tx-row"]')
      .count();
    expect(finalRows).toBe(initialRows + 5);

    const statuses = page.locator(
      '[data-testid="transactions-table"] [data-testid="tx-row"] [data-testid="tx-status"]'
    );
    await expect(statuses).toHaveCount(finalRows);
    // Check the last 5 rows have Pending (simple check on at least one new row)
    await expect(statuses.last()).toContainText('Pending');
  });
});
