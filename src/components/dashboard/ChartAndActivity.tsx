import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { CheckCircle2, ShoppingCart, UserPlus, CreditCard } from 'lucide-react';
import styles from './ChartAndActivity.module.css';

export interface ChartData {
  month: string;
  revenue: number;
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'signup' | 'payment' | 'completed';
  description: string;
  timestamp: string; // e.g. "2m ago"
}

interface ChartAndActivityProps {
  chartData: ChartData[];
  activities: ActivityItem[];
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'order': return <ShoppingCart size={16} />;
    case 'signup': return <UserPlus size={16} />;
    case 'payment': return <CreditCard size={16} />;
    case 'completed': return <CheckCircle2 size={16} />;
    default: return <CheckCircle2 size={16} />;
  }
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumSignificantDigits: 3
  }).format(value);
};

export const ChartAndActivity: React.FC<ChartAndActivityProps> = ({ chartData, activities }) => {
  return (
    <div className={styles.container}>
      <div className={styles.chartSection}>
        <h3 className={styles.sectionTitle}>Revenue Overview</h3>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tickFormatter={formatCurrency}
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                dx={-10}
              />
              <Tooltip 
                formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
                contentStyle={{ 
                  backgroundColor: 'var(--bg-surface)', 
                  borderColor: 'var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="var(--accent-color)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className={styles.activitySection}>
        <h3 className={styles.sectionTitle}>Recent Activity</h3>
        <div className={styles.activityList}>
          {activities.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div className={styles.activityIcon}>
                {getActivityIcon(activity.type)}
              </div>
              <div className={styles.activityContent}>
                <span className={styles.activityText}>{activity.description}</span>
                <span className={styles.activityTime}>{activity.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
