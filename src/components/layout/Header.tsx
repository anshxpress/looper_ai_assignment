import React from 'react';
import { Search, Bell } from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <div className={styles.searchContainer}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>
      <div className={styles.rightSection}>
        <button className={styles.iconButton} aria-label="Notifications">
          <Bell size={20} />
        </button>
        <div className={styles.avatar} aria-label="User profile">
          JD
        </div>
      </div>
    </header>
  );
};
