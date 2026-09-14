import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Chart.module.css';

interface Slice { name: string; value: number; color: string; }

const fmt = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(v);

export const CategoryChart: React.FC<{ data: Slice[] }> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className={styles.wrap}>
      <h3 className={styles.title}>Category Breakdown</h3>
      <div className={styles.chartArea}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v: unknown) => [fmt(Number(v))]}
              contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: -8 }}>
          {data.map((d) => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: d.color, display: 'inline-block' }} />
              <span>{d.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>
                {total > 0 ? `${((d.value / total) * 100).toFixed(0)}%` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
