import { describe, it, expect } from 'vitest';
import { buildTransactionFilter, escapeRegex } from '../../src/utils/filterBuilder';

// ── escapeRegex ───────────────────────────────────────────────────────────────
describe('escapeRegex', () => {
  it('escapes regex special characters', () => {
    expect(escapeRegex('user.001')).toBe('user\\.001');
    expect(escapeRegex('$100+')).toBe('\\$100\\+');
    expect(escapeRegex('(test)*')).toBe('\\(test\\)\\*');
  });

  it('leaves safe strings unchanged', () => {
    expect(escapeRegex('user_001')).toBe('user_001');
    expect(escapeRegex('hello world')).toBe('hello world');
  });
});

// ── buildTransactionFilter ────────────────────────────────────────────────────
describe('buildTransactionFilter', () => {
  it('returns empty filter when no params supplied', () => {
    const filter = buildTransactionFilter({});
    expect(filter).toEqual({});
  });

  it('filters by category when not All', () => {
    const filter = buildTransactionFilter({ category: 'Revenue' });
    expect(filter.category).toBe('Revenue');
  });

  it('does NOT set category when value is All', () => {
    const filter = buildTransactionFilter({ category: 'All' });
    expect(filter.category).toBeUndefined();
  });

  it('filters by status when not All', () => {
    const filter = buildTransactionFilter({ status: 'Paid' });
    expect(filter.status).toBe('Paid');
  });

  it('escapes user_id regex input', () => {
    const filter = buildTransactionFilter({ user: 'user.001' }) as Record<string, unknown>;
    const userFilter = filter.user_id as { $regex: string };
    expect(userFilter.$regex).toBe('user\\.001');
  });

  it('builds date range filter', () => {
    const filter = buildTransactionFilter({ dateFrom: '2024-01-01', dateTo: '2024-12-31' }) as Record<string, unknown>;
    const dateFilter = filter.date as { $gte: Date; $lte: Date };
    expect(dateFilter.$gte).toEqual(new Date('2024-01-01'));
    expect(dateFilter.$lte).toEqual(new Date('2024-12-31T23:59:59Z'));
  });

  it('builds amount range filter', () => {
    const filter = buildTransactionFilter({ amountMin: '100', amountMax: '5000' }) as Record<string, unknown>;
    const amountFilter = filter.amount as { $gte: number; $lte: number };
    expect(amountFilter.$gte).toBe(100);
    expect(amountFilter.$lte).toBe(5000);
  });

  it('builds $or search with escaped regex', () => {
    const filter = buildTransactionFilter({ search: 'user.001' }) as Record<string, unknown>;
    const orFilter = filter.$or as Array<Record<string, { $regex: string }>>;
    expect(orFilter[0].user_id.$regex).toBe('user\\.001');
  });
});
