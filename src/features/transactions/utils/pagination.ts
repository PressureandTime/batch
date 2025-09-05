/**
 * Simple pagination helpers used by the Transactions page and unit tests.
 */
export const getTotalPages = (totalCount: number, pageSize: number): number => {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(totalCount / pageSize));
};

export const clampPage = (page: number, totalPages: number): number => {
  if (!Number.isFinite(page) || page < 1) return 1;
  if (!Number.isFinite(totalPages) || totalPages < 1) return 1;
  return Math.min(totalPages, Math.max(1, Math.floor(page)));
};

export const getPaginated = <T,>(arr: T[], page: number, pageSize: number): T[] => {
  const end = page * pageSize;
  const start = end - pageSize;
  return arr.slice(start, end);
};

