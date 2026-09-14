import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Maximize2, X } from 'lucide-react';
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
  const [expandedUserChart, setExpandedUserChart] = useState<{ userId: string; data: { date: string; revenue: number; expenses: number }[] } | null>(null);

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
      <div className="analytics-top-grid">
        
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
      <div className="analytics-user-grid">
        {data.userCharts?.map(userChart => (
          <div key={userChart.userId} className={styles.wrap} style={{ minHeight: 260, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className={styles.title}>{userChart.userId} - Activity</h3>
              <button 
                onClick={() => setExpandedUserChart(userChart)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                title="Expand Chart"
              >
                <Maximize2 size={16} />
              </button>
            </div>
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

      {/* Expanded Chart Modal */}
      {expandedUserChart && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'var(--space-24)'
        }}>
          <div style={{
            background: 'var(--bg-surface)', width: '100%', maxWidth: 900,
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-24)',
            display: 'flex', flexDirection: 'column', gap: 'var(--space-16)',
            boxShadow: 'var(--shadow-md)', position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
                {expandedUserChart.userId} - Full Year Activity
              </h2>
              <button 
                onClick={() => setExpandedUserChart(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ height: 500, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expandedUserChart.data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={fmt} tick={{ fill: 'var(--text-muted)' }} dx={-4} />
                  <Tooltip
                    formatter={(v: unknown) => [fmt(Number(v))]}
                    contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '6px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 20 }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#16A34A" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  <Bar dataKey="expenses" name="Expenses" fill="#DC2626" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
