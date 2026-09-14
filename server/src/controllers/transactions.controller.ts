import type { Request, Response, NextFunction } from 'express';
import { Transaction } from '../models/Transaction';
import { buildTransactionFilter } from '../utils/filterBuilder';

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      search = '', category = '', status = '', user = '',
      dateFrom = '', dateTo = '',
      amountMin = '', amountMax = '',
      sortField = 'date', sortDir = 'desc',
      page = '1', pageSize = '10',
    } = req.query as Record<string, string>;

    const filter = buildTransactionFilter({ search, category, status, user, dateFrom, dateTo, amountMin, amountMax });

    const pageNum = Math.max(1, parseInt(page, 10));
    const limit   = Math.min(10000, Math.max(1, parseInt(pageSize, 10)));
    const skip    = (pageNum - 1) * limit;
    const sort    = { [sortField]: sortDir === 'asc' ? 1 : -1 } as Record<string, 1 | -1>;

    const [data, total] = await Promise.all([
      Transaction.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Transaction.countDocuments(filter),
    ]);

    res.json({ success: true, data, total, page: pageNum, pageSize: limit, totalPages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

export const getSummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [revenue, expenses, total, paid, pending] = await Promise.all([
      Transaction.aggregate([{ $match: { category: 'Revenue' } }, { $group: { _id: null, sum: { $sum: '$amount' } } }]),
      Transaction.aggregate([{ $match: { category: 'Expense' } }, { $group: { _id: null, sum: { $sum: '$amount' } } }]),
      Transaction.countDocuments(),
      Transaction.countDocuments({ status: 'Paid' }),
      Transaction.countDocuments({ status: 'Pending' }),
    ]);
    res.json({
      success: true,
      data: {
        totalRevenue:  revenue[0]?.sum ?? 0,
        totalExpenses: expenses[0]?.sum ?? 0,
        totalCount: total,
        paidCount: paid,
        pendingCount: pending,
      },
    });
  } catch (err) { next(err); }
};

export const getAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const monthlyData = await Transaction.aggregate([
      {
        $group: {
          _id: { 
            month: { $dateToString: { format: "%Y-%m", date: "$date" } },
            category: "$category",
            userId: "$user_id"
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);

    const globalMonthlyMap: Record<string, { date: string, revenue: number, expenses: number }> = {};
    const userMonthlyMap: Record<string, Record<string, { date: string, revenue: number, expenses: number }>> = {};

    monthlyData.forEach(item => {
      const month = item._id.month;
      const cat = item._id.category;
      const user = item._id.userId;

      // Global aggregate
      if (!globalMonthlyMap[month]) globalMonthlyMap[month] = { date: month, revenue: 0, expenses: 0 };
      if (cat === 'Revenue') globalMonthlyMap[month].revenue += item.total;
      if (cat === 'Expense') globalMonthlyMap[month].expenses += item.total;

      // User aggregate
      if (!userMonthlyMap[user]) userMonthlyMap[user] = {};
      if (!userMonthlyMap[user][month]) userMonthlyMap[user][month] = { date: month, revenue: 0, expenses: 0 };
      if (cat === 'Revenue') userMonthlyMap[user][month].revenue += item.total;
      if (cat === 'Expense') userMonthlyMap[user][month].expenses += item.total;
    });

    const userCharts = Object.keys(userMonthlyMap).map(userId => ({
      userId,
      data: Object.values(userMonthlyMap[userId])
    })).sort((a, b) => a.userId.localeCompare(b.userId));

    const topCustomers = await Transaction.aggregate([
      { $match: { category: 'Revenue' } },
      { $group: { _id: "$user_id", totalRevenue: { $sum: "$amount" } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        daily: Object.values(globalMonthlyMap),
        userCharts,
        topCustomers: topCustomers.map(c => ({ userId: c._id, revenue: c.totalRevenue }))
      }
    });
  } catch (err) { next(err); }
};
