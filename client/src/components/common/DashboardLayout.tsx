import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onPageChange: (page: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onExportClick: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activePage,
  onPageChange,
  searchQuery,
  onSearchChange,
  onExportClick,
}) => (
  <div className={styles.layout}>
    <Sidebar activePage={activePage} onPageChange={onPageChange} />
    <div className={styles.main}>
      <Header
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onExportClick={onExportClick}
      />
      <main className={styles.content}>{children}</main>
    </div>
  </div>
);
