import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KpiData } from '../../types';
import styles from './KpiCard.module.css';

export const KpiCard: React.FC<{ data: KpiData }> = ({ data }) => {
  const Icon = data.icon;
  const isPos = data.trend > 0;
  const isNeg = data.trend < 0;
  const TrendIcon = isPos ? TrendingUp : isNeg ? TrendingDown : Minus;
  const trendCls = isPos ? styles.trendPos : isNeg ? styles.trendNeg : styles.trendNeutral;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.label}>{data.label}</span>
        <div className={styles.iconWrap}><Icon size={15} /></div>
      </div>
      <div className={styles.value}>{data.value}</div>
      <div className={`${styles.trend} ${trendCls}`}>
        <TrendIcon size={13} />
        <span>{Math.abs(data.trend).toFixed(1)}%</span>
        <span className={styles.trendMuted}>vs last month</span>
      </div>
    </div>
  );
};

export const KpiRow: React.FC<{ kpis: KpiData[] }> = ({ kpis }) => (
  <div className={styles.kpiRow}>
    {kpis.map((k) => <KpiCard key={k.id} data={k} />)}
  </div>
);
