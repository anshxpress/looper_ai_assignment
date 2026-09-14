import React from 'react';
import { CheckCircle2, ShoppingCart, CreditCard, UserPlus } from 'lucide-react';
import styles from './ActivityFeed.module.css';

interface ActivityItem {
  id: string;
  type: 'payment' | 'order' | 'completed' | 'signup';
  description: string;
  timestamp: string;
}

const ICONS: Record<string, React.ElementType> = {
  payment: CreditCard,
  order: ShoppingCart,
  completed: CheckCircle2,
  signup: UserPlus,
};

export const ActivityFeed: React.FC<{ items: ActivityItem[] }> = ({ items }) => (
  <div className={styles.wrap}>
    <h3 className={styles.title}>Recent Activity</h3>
    <div className={styles.list}>
      {items.map((item) => {
        const Icon = ICONS[item.type] ?? CheckCircle2;
        return (
          <div key={item.id} className={styles.item}>
            <div className={styles.iconWrap}><Icon size={14} /></div>
            <div className={styles.body}>
              <span className={styles.desc}>{item.description}</span>
              <span className={styles.time}>{item.timestamp}</span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
