import React from 'react';
import { LayoutDashboard, BarChart2, Users, Settings, Activity } from 'lucide-react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoMark}>
          <Activity size={16} />
        </div>
        <span className={styles.wordmark}>AdminDash</span>
      </div>
      
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className={styles.icon} />
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
