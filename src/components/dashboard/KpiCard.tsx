import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './KpiCard.module.css';

export interface KpiData {
  id: string;
  label: string;
  value: string;
  trend: number; // percentage change
  icon: React.ElementType;
}

interface KpiCardProps {
  data: KpiData;
}

export const KpiCard: React.FC<KpiCardProps> = ({ data }) => {
  const Icon = data.icon;
  const isPositive = data.trend > 0;
  const isNegative = data.trend < 0;
  
  let trendClass = styles.trendNeutral;
  let TrendIcon = Minus;
  
  if (isPositive) {
    trendClass = styles.trendPositive;
    TrendIcon = TrendingUp;
  } else if (isNegative) {
    trendClass = styles.trendNegative;
    TrendIcon = TrendingDown;
  }

  return (
    <div className={styles.kpiCard}>
      <div className={styles.header}>
        <span className={styles.label}>{data.label}</span>
        <div className={styles.iconWrapper}>
          <Icon size={16} />
        </div>
      </div>
      <div className={styles.value}>{data.value}</div>
      <div className={`${styles.trend} ${trendClass}`}>
        <TrendIcon size={14} />
        <span>{Math.abs(data.trend).toFixed(1)}%</span>
        <span style={{ color: 'var(--text-muted)' }}>vs last month</span>
      </div>
    </div>
  );
};
