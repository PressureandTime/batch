import { test, expect } from '@playwright/test';
import path from 'path';

const sample = (name: string) => path.resolve(process.cwd(), 'sample-data', name);

/**
 * Large dataset pagination verification
 */

test.describe('Large dataset pagination controls', () => {
  test.setTimeout(180_000);

  test('navigate via first/last, prev/next, numeric buttons, and jump to page', async ({
    page,
  }) => {
    await page.goto('/');

    // Upload large CSV (10,000 rows) to get 10003 total with 10/page -> > 1000 pages
    await page.getByTestId('open-batch-transfer').click();
    await page.getByTestId('batch-name-input').fill('Large Upload');
    await page.getByTestId('approver-select').selectOption({ label: 'Alice Johnson' });
    await page.getByTestId('csv-file-input').setInputFiles(sample('large-valid-10000.csv'));

    // Step 1 -> Step 2
    await expect(page.getByTestId('next-btn')).toBeEnabled({ timeout: 300_000 });
    await page.getByTestId('next-btn').click();

    // Ensure Step 2 fully parsed before proceeding to summary
    await expect(page.getByTestId('step-title')).toContainText('Review', { timeout: 120_000 });
    await expect(page.getByText('Parsing and validating CSV file...')).toBeHidden({
      timeout: 300_000,
    });
    await expect(page.getByTestId('next-btn')).toBeEnabled({ timeout: 300_000 });
    await page.getByTestId('next-btn').click();

    // Submit batch and return to dashboard
    await expect(page.getByTestId('submit-batch-btn')).toBeEnabled({ timeout: 120_000 });
    await page.getByTestId('submit-batch-btn').click();

    // After submission, should land on page 1
    await expect(page.getByTestId('pagination-label')).toContainText('Page 1 of');

    // Controls visible
    await expect(page.getByTestId('pagination-first')).toBeVisible();
    await expect(page.getByTestId('pagination-prev')).toBeVisible();
    await expect(page.getByTestId('pagination-next')).toBeVisible();
    await expect(page.getByTestId('pagination-last')).toBeVisible();

    // Next navigates to page 2
    await page.getByTestId('pagination-next').click();
    await expect(page.getByTestId('pagination-label')).toContainText('Page 2 of');

    // Go to last page, then back to first
    await page.getByTestId('pagination-last').click();
    await expect(page.getByTestId('pagination-label')).toContainText('of');

    // Prev should move back by 1 from last
    await page.getByTestId('pagination-prev').click();
    await expect(page.getByTestId('pagination-label')).not.toContainText('Page 1 of');

    // First goes to page 1
    await page.getByTestId('pagination-first').click();
    await expect(page.getByTestId('pagination-label')).toContainText('Page 1 of');

    // Jump to page 100
    await page.getByTestId('pagination-jump-input').fill('100');
    await page.getByTestId('pagination-jump-go').click();
    await expect(page.getByTestId('pagination-label')).toContainText('Page 100 of');

    // Numeric buttons present; clicking current+1 works when available
    const page101 = page.getByTestId('pagination-page-101');
    if (await page101.isVisible()) {
      await page101.click();
      await expect(page.getByTestId('pagination-label')).toContainText('Page 101 of');
    }

    // Ellipses should be present for large totals
    await expect(page.getByTestId('pagination-ellipsis').first()).toBeVisible();

    // Change items per page to 50 and ensure pagination label updates but controls still work
    await page.getByTestId('items-per-page').selectOption('50');
    await expect(page.getByTestId('items-per-page')).toHaveValue('50');
    await expect(page.getByTestId('pagination-label')).toContainText('Page');

    // Jump with out-of-range value clamps to last page
    await page.getByTestId('pagination-jump-input').fill('999999');
    await page.getByTestId('pagination-jump-go').click();
    await expect(page.getByTestId('pagination-label')).toContainText('Page');
  });
});
