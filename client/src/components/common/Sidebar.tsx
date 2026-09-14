import React from 'react';
import { LayoutDashboard, BarChart2, Users, Settings, Zap, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange }) => {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logoContainer}>
        <div className={styles.logoMark}>
          <Zap size={14} />
        </div>
        <span className={styles.wordmark}>Looper</span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`${styles.navItem} ${activePage === id ? styles.active : ''}`}
            onClick={() => onPageChange(id)}
          >
            <Icon className={styles.navIcon} />
            <span className={styles.navLabel}>{label}</span>
          </button>
        ))}
      </nav>

      {/* User section */}
      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>{initials}</div>
          <div>
            <div className={styles.userName}>{user?.name ?? 'Admin'}</div>
            <div className={styles.userEmail}>{user?.email ?? ''}</div>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={logout}>
          <LogOut size={14} />
          <span className={styles.navLabel}>Sign out</span>
        </button>
      </div>
    </aside>
  );
};
