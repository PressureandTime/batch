import { test, expect } from '@playwright/test';
import path from 'path';

const sample = (name: string) => path.resolve(process.cwd(), 'sample-data', name);

test.describe('Batch Transfer - Invalid CSV Review + Toggle', () => {
  test('shows invalid rows with tooltips and filters with toggle', async ({ page }) => {
    await page.goto('/');

    // Open modal
    await page.getByTestId('open-batch-transfer').click();
    await expect(page.getByTestId('batch-transfer-dialog')).toBeVisible();

    // Step 1: fill form
    await page.getByTestId('batch-name-input').fill('Test Batch 2');
    await page.getByTestId('approver-select').selectOption({ label: 'Bob Smith' });

    const filePath = sample('invalid-transactions.csv');
    await page.getByTestId('csv-file-input').setInputFiles(filePath);
    await expect(page.getByTestId('selected-file-name')).toContainText('invalid-transactions.csv');

    // Next to Step 2
    await page.getByTestId('next-btn').click();
    await expect(page.getByTestId('step-title')).toContainText('Review');
    await expect(page.getByText('Parsing and validating CSV file...')).toBeHidden({
      timeout: 15000,
    });
    await expect(page.getByTestId('review-table')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('valid-count')).toContainText('1');
    await expect(page.getByTestId('invalid-count')).toContainText('4');

    // Toggle only invalid
    await page.getByTestId('only-invalid-toggle').check();

    // Verify rows rendered <= invalid count and tooltips visible on hover
    const rows = page.locator('[data-testid="review-table"] [data-testid="review-row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBe(4);

    // Hover first invalid status and check tooltip content
    const invalidStatus = rows.first().locator('[data-testid="invalid-status"]');
    await invalidStatus.hover();

    // Expect at least one known validation error piece to be present
    const tooltip = page.locator('[data-testid="error-tooltip"]');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('Transaction Date');
    await expect(tooltip).toContainText('Account Number');

    // Proceed to Step 3 and verify only 1 valid transaction counted
    await page.getByTestId('next-btn').click();
    await expect(page.getByText('Number of Payments')).toBeVisible();
    await expect(page.getByTestId('number-of-payments-value')).toHaveText('1');
    await expect(page.getByTestId('total-amount-value')).toHaveText('$100.00');
  });
});
