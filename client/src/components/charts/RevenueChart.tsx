import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import styles from './Chart.module.css';

interface ChartPoint { month: string; revenue: number; expenses: number; }

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(v);

export const RevenueChart: React.FC<{ data: ChartPoint[] }> = ({ data }) => (
  <div className={styles.wrap} style={{ height: '100%' }}>
    <h3 className={styles.title}>Revenue vs Expenses</h3>
    <div className={styles.chartArea}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16A34A" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#DC2626" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} dy={8} />
          <YAxis axisLine={false} tickLine={false} tickFormatter={fmt} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} dx={-4} />
          <Tooltip
            formatter={(v: unknown) => [fmt(Number(v))]}
            contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#16A34A" strokeWidth={2} fill="url(#gRevenue)" />
          <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#DC2626" strokeWidth={2} fill="url(#gExpenses)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);
