import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import styles from './DashboardLayout.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onPageChange: (page: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activePage,
  onPageChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className={styles.layout}>
      <Sidebar activePage={activePage} onPageChange={onPageChange} />
      <div className={styles.mainContent}>
        <Header searchQuery={searchQuery} onSearchChange={onSearchChange} />
        <main className={styles.pageContent}>
          {children}
        </main>
      </div>
    </div>
  );
};
