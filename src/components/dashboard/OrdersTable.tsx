import React from 'react';
import { format } from 'date-fns';
import styles from './OrdersTable.module.css';

export interface Order {
  id: string | number;
  user_id: string;
  user_profile: string;
  status: string;
  amount: number;
  date: string;
}

interface OrdersTableProps {
  orders: Order[];
}

const getBadgeClass = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === 'completed' || normalized === 'paid') return styles.badgeSuccess;
  if (normalized === 'pending') return styles.badgePending;
  if (normalized === 'failed') return styles.badgeFailed;
  return styles.badgePending;
};

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Recent orders</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Order ID</th>
            <th className={styles.th}>Customer</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Amount</th>
            <th className={styles.th}>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className={styles.tr}>
              <td className={styles.td}>#{order.id}</td>
              <td className={styles.td}>
                <div className={styles.customerCell}>
                  <img src={order.user_profile} alt="avatar" className={styles.customerAvatar} />
                  <span>{order.user_id}</span>
                </div>
              </td>
              <td className={styles.td}>
                <span className={`${styles.badge} ${getBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td className={styles.td}>
                ${order.amount.toFixed(2)}
              </td>
              <td className={styles.td}>
                {format(new Date(order.date), 'MMM dd, yyyy')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
