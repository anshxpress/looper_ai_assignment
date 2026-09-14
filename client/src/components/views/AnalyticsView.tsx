import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { transactionsApi } from '../../api/transactions';
import styles from '../charts/Chart.module.css';

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(v);

interface AnalyticsData {
  daily: { date: string; revenue: number; expenses: number }[];
  userCharts: { userId: string; data: { date: string; revenue: number; expenses: number }[] }[];
  topCustomers: { userId: string; revenue: number }[];
}

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    transactionsApi.getAnalytics().then((resData) => {
      if (active) {
        setData(resData as AnalyticsData);
        setIsLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <span style={{ color: 'var(--text-muted)' }}>Loading analytics...</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
      {/* Top row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-16)' }}>
        
        {/* Main Global Chart */}
        <div className={styles.wrap} style={{ minHeight: 320 }}>
          <h3 className={styles.title}>Global Revenue & Expenses (Monthly)</h3>
          <div className={styles.chartArea}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.daily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={fmt} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} dx={-4} />
                <Tooltip
                  formatter={(v: unknown) => [fmt(Number(v))]}
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Bar dataKey="revenue" name="Revenue" fill="#16A34A" radius={[2, 2, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#DC2626" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Customers */}
        <div className={styles.wrap} style={{ minHeight: 320 }}>
          <h3 className={styles.title}>Top Customers</h3>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.topCustomers.map((c, i) => (
              <div key={c.userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-body)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>#{i + 1}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{c.userId}</span>
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#16A34A' }}>
                  {fmt(c.revenue)}
                </span>
              </div>
            ))}
            {data.topCustomers.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No customers found.</div>
            )}
          </div>
        </div>
      </div>

      {/* 2x2 Grid for User Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)' }}>
        {data.userCharts?.map(userChart => (
          <div key={userChart.userId} className={styles.wrap} style={{ minHeight: 260 }}>
            <h3 className={styles.title}>{userChart.userId} - Activity</h3>
            <div className={styles.chartArea}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userChart.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={fmt} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} dx={-4} />
                  <Tooltip
                    formatter={(v: unknown) => [fmt(Number(v))]}
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: 12 }}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="#16A34A" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#DC2626" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
