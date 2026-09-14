import React from 'react';
import { KpiCard, type KpiData } from './KpiCard';
import styles from './KpiCard.module.css';

interface KpiRowProps {
  kpis: KpiData[];
}

export const KpiRow: React.FC<KpiRowProps> = ({ kpis }) => {
  return (
    <div className={styles.kpiRow}>
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} data={kpi} />
      ))}
    </div>
  );
};
