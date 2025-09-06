import { test, expect } from '@playwright/test';
import path from 'path';

const sample = (name: string) => path.resolve(process.cwd(), 'sample-data', name);

/**
 * Pagination UX regression + edge-cases
 */
test.describe('Transactions pagination UX', () => {
  test('footer visible on single page, grows to multi-page, lands on first page after upload and changes page size', async ({
    page,
  }) => {
    await page.goto('/');

    // Initial state: 3 seeded rows -> single page
    await expect(page.getByTestId('pagination-label')).toHaveText('Page 1 of 1');
    await expect(page.getByTestId('results-count')).toHaveText('3 results');
    await expect(page.getByTestId('items-per-page')).toHaveValue('10');

    // prev/next are hidden on single page (we render label instead of controls)
    await expect(page.getByTestId('transactions-table')).toBeVisible();
    const initialCount = await page
      .locator('[data-testid="transactions-table"] [data-testid="tx-row"]')
      .count();
    expect(initialCount).toBe(3);

    // Upload 2x valid CSVs (5 records each) -> total becomes 13
    // 1st upload
    await page.getByTestId('open-batch-transfer').click();
    await expect(page.getByTestId('batch-transfer-dialog')).toBeVisible();
    await page.getByTestId('batch-name-input').fill('Pagination Batch 1');
    await page.getByTestId('approver-select').selectOption({ label: 'Alice Johnson' });
    await page.getByTestId('csv-file-input').setInputFiles(sample('valid-transactions.csv'));
    await page.getByTestId('next-btn').click();
    await expect(page.getByTestId('review-table')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('next-btn').click();
    await page.getByTestId('submit-batch-btn').click();

    // 2nd upload (new dialog opens)
    await page.getByTestId('open-batch-transfer').click();
    await expect(page.getByTestId('batch-transfer-dialog')).toBeVisible();
    await page.getByTestId('batch-name-input').fill('Pagination Batch 2');
    await page.getByTestId('approver-select').selectOption({ label: 'Bob Smith' });
    await page.getByTestId('csv-file-input').setInputFiles(sample('valid-transactions.csv'));
    await page.getByTestId('next-btn').click();
    await expect(page.getByTestId('review-table')).toBeVisible({ timeout: 15000 });
    await page.getByTestId('next-btn').click();
    await page.getByTestId('submit-batch-btn').click();

    // After 2nd submission, component should land on page 1
    await expect(page.getByTestId('pagination-label')).toHaveText('Page 1 of 2');
    await expect(page.getByTestId('results-count')).toHaveText('13 results');

    // Table should show the first 10 rows on page 1 (default page size is 10)
    const firstPageCount = await page
      .locator('[data-testid="transactions-table"] [data-testid="tx-row"]')
      .count();
    expect(firstPageCount).toBe(10);

    // Change items per page to 25 -> still multiple pages? 13 rows -> single page
    await page.getByTestId('items-per-page').selectOption('25');
    await expect(page.getByTestId('pagination-label')).toHaveText('Page 1 of 1');
    await expect(page.getByTestId('items-per-page')).toHaveValue('25');

    const allRows = await page
      .locator('[data-testid="transactions-table"] [data-testid="tx-row"]')
      .count();
    expect(allRows).toBeGreaterThanOrEqual(13);
  });
});
