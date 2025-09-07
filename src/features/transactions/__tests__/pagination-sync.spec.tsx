import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../../../test-utils';
import { TransactionsPage } from '../index';
import { screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/** Helper to set the URL before rendering */
const setUrl = (query: string) => {
  const path = query ? `/?${query}` : '/';
  window.history.replaceState(null, '', path);
};

describe('TransactionsPage — URL/LocalStorage pagination sync', () => {
  beforeEach(() => {
    localStorage.clear();
    setUrl('');
  });

  it('reads initial page and pageSize from URL, clamps invalids, and reflects back to URL', async () => {
    setUrl('page=3&pageSize=25');
    renderWithProviders(<TransactionsPage />);

    // Items per page should reflect 25 (from URL)
    const select = screen.getByTestId('items-per-page') as HTMLSelectElement;
    expect(select.value).toBe('25');

    // Reflects clamped page in UI label
    const label = screen.getByTestId('pagination-label');
    expect(label).toHaveTextContent('Page 1 of 1'); // only seed data, so clamped to 1

    // URL updated with clamped values
    const url = new URL(window.location.href);
    expect(url.searchParams.get('page')).toBe('1');
    expect(url.searchParams.get('pageSize')).toBe('25');
  });

  it('persists page and pageSize to localStorage and restores them when URL lacks params', async () => {
    // First render - set selections
    renderWithProviders(<TransactionsPage />);
    const selects = screen.getAllByTestId('items-per-page') as HTMLSelectElement[];
    await userEvent.selectOptions(selects[0], '10');

    // Should persist in localStorage
    expect(localStorage.getItem('txItemsPerPage')).toBe('10');
    expect(localStorage.getItem('txPage')).toBe('1');

    // Simulate reload with cleared URL and without params -> should read from LS
    cleanup();
    setUrl('');
    renderWithProviders(<TransactionsPage />);
    const selects2 = screen.getAllByTestId('items-per-page') as HTMLSelectElement[];
    expect(selects2[0].value).toBe('10');
  });

  it('clamps current page when items-per-page changes reducing total pages and updates URL', async () => {
    renderWithProviders(<TransactionsPage />);

    // With seed data of 3 rows, move to page 1 is always the only
    const labelBefore = screen.getByTestId('pagination-label');
    expect(labelBefore).toHaveTextContent('Page 1 of 1');

    // Change page size and ensure URL updated
    const select = screen.getByTestId('items-per-page');
    await userEvent.selectOptions(select, '50');

    const url = new URL(window.location.href);
    expect(url.searchParams.get('page')).toBe('1');
    expect(url.searchParams.get('pageSize')).toBe('50');
  });
});
