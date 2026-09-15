import { useState, useEffect } from 'react';
import { DollarSign, Users, UserPlus, TrendingUp } from 'lucide-react';
import { parseISO, getMonth, getYear } from 'date-fns';
import type { KpiData, TransactionFilters } from '../types';
import { transactionsApi } from '../api/transactions';

// ── Monthly revenue chart data ────────────────────────────────────────────────
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function useDashboardSummary(filters: TransactionFilters) {
  const [data, setData] = useState<{
    kpis: KpiData[];
    chartData: any[];
    chartYear: string;
    categoryData: any[];
    activities: any[];
  } | null>(null);

  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      try {
        // Fetch up to 1000 matching items to compute summary metrics
        const res = await transactionsApi.getAll({
          filters: filters,
          sort: { field: 'date', direction: 'desc' },
          page: 1,
          pageSize: 1000,
        });

        if (!active) return;

        const transactions = res.data;
        if (!transactions.length) {
          setData(null);
          return;
        }

        // ── KPIs ────────────────────────────────────────────────────────────────
        const revenue = transactions.filter((t) => t.category === 'Revenue');
        const expenses = transactions.filter((t) => t.category === 'Expense');

        const totalRevenue = revenue.reduce((s, t) => s + t.amount, 0);
        const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
        const uniqueUsers = new Set(transactions.map((t) => t.user_id)).size;
        const conversionRate = revenue.length
          ? ((revenue.filter((t) => t.status === 'Paid').length / revenue.length) * 100)
          : 0;

        const kpis: KpiData[] = [
          {
            id: 'revenue',
            label: 'Total Revenue',
            value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalRevenue),
            trend: 12.5,
            icon: DollarSign,
          },
          {
            id: 'expenses',
            label: 'Total Expenses',
            value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalExpenses),
            trend: -3.2,
            icon: TrendingUp,
          },
          {
            id: 'active_users',
            label: 'Active Users',
            value: uniqueUsers.toLocaleString(),
            trend: 5.2,
            icon: Users,
          },
          {
            id: 'conversion',
            label: 'Conversion Rate',
            value: `${conversionRate.toFixed(1)}%`,
            trend: 1.8,
            icon: UserPlus,
          },
        ];

        // ── Revenue vs Expenses by month ─────────────────────────────────────────
        const monthlyRevenue = new Array<number>(12).fill(0);
        const monthlyExpenses = new Array<number>(12).fill(0);

        // Collect all years to determine which year(s) the chart covers
        const yearCounts: Record<number, number> = {};
        transactions.forEach((t) => {
          const parsed = parseISO(String(t.date));
          const m = getMonth(parsed);
          const y = getYear(parsed);
          yearCounts[y] = (yearCounts[y] ?? 0) + 1;
          if (t.category === 'Revenue') monthlyRevenue[m] += t.amount;
          else monthlyExpenses[m] += t.amount;
        });

        // Find the most common year; if multiple years show a range
        const sortedYears = Object.keys(yearCounts)
          .map(Number)
          .sort((a, b) => a - b);
        const chartYear =
          sortedYears.length === 1
            ? String(sortedYears[0])
            : `${sortedYears[0]}–${sortedYears[sortedYears.length - 1]}`;

        const chartData = MONTH_NAMES.map((month, i) => ({
          month,
          revenue: monthlyRevenue[i],
          expenses: monthlyExpenses[i],
        }));

        // ── Category breakdown ────────────────────────────────────────────────────
        const categoryData = [
          { name: 'Revenue', value: totalRevenue, color: 'var(--status-green-text)' },
          { name: 'Expenses', value: totalExpenses, color: 'var(--status-red-text)' },
        ];

        // ── Activity feed (latest 8 transactions) ─────────────────────────────────
        const relativeLabels = ['2m ago', '15m ago', '42m ago', '1h ago', '2h ago', '4h ago', '8h ago', '1d ago'];
        const activities = [...transactions]
          .sort((a, b) => new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime())
          .slice(0, 8)
          .map((t, i) => ({
            id: `act_${t.id}`,
            type: (t.category === 'Revenue' ? 'payment' : 'order') as 'payment' | 'order',
            description: `${t.user_id} · ${t.category} of $${t.amount.toFixed(2)} — ${t.status}`,
            timestamp: relativeLabels[i] ?? '2d ago',
          }));

        setData({ kpis, chartData, chartYear, categoryData, activities });
      } catch (err) {
        console.error('Failed to load summary', err);
      }
    }

    loadSummary();
    return () => { active = false; };
  }, [filtersKey]);

  return data;
}
