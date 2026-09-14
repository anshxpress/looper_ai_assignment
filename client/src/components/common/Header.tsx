import React from 'react';
import { Search, Bell, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onExportClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, onExportClick }) => {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search transactions…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.iconBtn} title="Export CSV" onClick={onExportClick}>
          <Download size={18} />
        </button>
        <div className={`${styles.iconBtn} ${styles.badge}`} title="Notifications">
          <Bell size={18} />
          <span className={styles.badgeDot} />
        </div>
        <div className={styles.avatar}>{initials}</div>
      </div>
    </header>
  );
};
