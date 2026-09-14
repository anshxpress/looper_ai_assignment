import type { FilterQuery } from 'mongoose';
import type { ITransaction } from '../models/Transaction';

// Fix 5: Escape user-supplied strings before using in MongoDB $regex
// Prevents ReDoS attacks and unintended broad matches.
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface TransactionQueryParams {
  search?: string;
  category?: string;
  status?: string;
  user?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: string;
  amountMax?: string;
}

// Fix 6: Shared filter builder — eliminates duplication between
// transactions.controller.ts and export.controller.ts
export function buildTransactionFilter(params: TransactionQueryParams): FilterQuery<ITransaction> {
  const { search = '', category = '', status = '', user = '', dateFrom = '', dateTo = '', amountMin = '', amountMax = '' } = params;
  const filter: FilterQuery<ITransaction> = {};

  if (category && category !== 'All') filter.category = category as ITransaction['category'];
  if (status && status !== 'All') filter.status = status as ITransaction['status'];

  if (user) filter.user_id = { $regex: escapeRegex(user), $options: 'i' };

  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) (filter.date as Record<string, Date>).$gte = new Date(dateFrom);
    if (dateTo) (filter.date as Record<string, Date>).$lte = new Date(dateTo + 'T23:59:59Z');
  }

  if (amountMin || amountMax) {
    filter.amount = {};
    if (amountMin) (filter.amount as Record<string, number>).$gte = parseFloat(amountMin);
    if (amountMax) (filter.amount as Record<string, number>).$lte = parseFloat(amountMax);
  }

  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { user_id:  { $regex: safeSearch, $options: 'i' } },
      { status:   { $regex: safeSearch, $options: 'i' } },
      { category: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  return filter;
}
