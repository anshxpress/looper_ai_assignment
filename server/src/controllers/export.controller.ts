import type { Request, Response, NextFunction } from 'express';
import { stringify } from 'csv-stringify';
import { Transaction } from '../models/Transaction';
import { format } from 'date-fns';
import { buildTransactionFilter } from '../utils/filterBuilder';

const ALL_COLUMNS = ['id', 'date', 'user_id', 'category', 'status', 'amount', 'user_profile'];

export const exportCsv = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { columns = ALL_COLUMNS, filters = {} } = req.body as {
      columns: string[];
      filters: Record<string, string>;
    };

    const filter = buildTransactionFilter(filters);
    const transactions = await Transaction.find(filter).sort({ date: -1 }).lean();

    const validCols = columns.filter((c) => ALL_COLUMNS.includes(c));

    const rows = transactions.map((t) =>
      validCols.map((col) => {
        if (col === 'date') return format(new Date(String(t.date)), 'yyyy-MM-dd');
        return String((t as Record<string, unknown>)[col] ?? '');
      })
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transactions_${format(new Date(), 'yyyy-MM-dd')}.csv"`);

    stringify([validCols, ...rows], (err, output) => {
      if (err) return next(err);
      res.send(output);
    });
  } catch (err) { next(err); }
};
