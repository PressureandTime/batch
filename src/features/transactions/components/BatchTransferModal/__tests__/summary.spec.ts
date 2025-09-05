import { describe, it, expect } from 'vitest';

interface RecordLike { Amount: number | string }

const compute = (records: Array<RecordLike>) => {
  const valid = records.map((r) => (typeof r.Amount === 'number' ? r.Amount : parseFloat(r.Amount))).filter((n) => !isNaN(n) && n > 0);
  const total = valid.reduce((s, n) => s + n, 0);
  const count = valid.length;
  const avg = count ? total / count : 0;
  return { total, count, avg };
};

describe('summary statistics', () => {
  it('computes total, count, and average', () => {
    const r = compute([{ Amount: 100 }, { Amount: 250.5 }, { Amount: '75.25' }]);
    expect(r.total).toBeCloseTo(425.75, 2);
    expect(r.count).toBe(3);
    expect(r.avg).toBeCloseTo(141.9167, 3);
  });

  it('handles empty dataset', () => {
    const r = compute([]);
    expect(r.total).toBe(0);
    expect(r.count).toBe(0);
    expect(r.avg).toBe(0);
  });
});

