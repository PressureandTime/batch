/** Pagination helpers used by the Transactions page and unit tests */

/**
 * Compute total page count given total items and page size.
 * @param totalCount - total number of items (>= 0)
 * @param pageSize - items per page (<= 0 yields 1 page)
 */
export const getTotalPages = (totalCount: number, pageSize: number): number => {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(totalCount / pageSize));
};

/**
 * Clamp a requested page number to the valid range [1, totalPages].
 * @param page - requested page (1-based)
 * @param totalPages - total number of pages (>= 1)
 */
export const clampPage = (page: number, totalPages: number): number => {
  if (!Number.isFinite(page) || page < 1) return 1;
  if (!Number.isFinite(totalPages) || totalPages < 1) return 1;
  return Math.min(totalPages, Math.max(1, Math.floor(page)));
};

/**
 * Get a slice of elements for the current page.
 * @param arr - source array
 * @param page - current page (1-based)
 * @param pageSize - items per page
 */
export const getPaginated = <T>(arr: T[], page: number, pageSize: number): T[] => {
  const end = page * pageSize;
  const start = end - pageSize;
  return arr.slice(start, end);
};
