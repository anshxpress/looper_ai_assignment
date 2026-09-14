import React, { useState } from 'react';
import { format } from 'date-fns';
import { ChevronUp, ChevronDown, ChevronsUpDown, SlidersHorizontal, X } from 'lucide-react';
import type { Transaction, TransactionFilters, SortConfig, SortField } from '../../types';
import styles from './TransactionsTable.module.css';

interface Props {
  data: Transaction[];
  filters: TransactionFilters;
  sort: SortConfig;
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onFilterChange: <K extends keyof TransactionFilters>(k: K, v: TransactionFilters[K]) => void;
  onResetFilters: () => void;
  onSortToggle: (field: SortField) => void;
  onPageChange: (p: number) => void;
}

const getBadgeCls = (status: string) => {
  if (status === 'Paid') return styles.badgeSuccess;
  if (status === 'Pending') return styles.badgePending;
  return styles.badgeFailed;
};

const SortIndicator: React.FC<{ field: SortField; sort: SortConfig }> = ({ field, sort }) => {
  const active = sort.field === field;
  if (!active) return <ChevronsUpDown size={13} className={styles.sortIcon} />;
  return sort.direction === 'asc'
    ? <ChevronUp size={13} className={`${styles.sortIcon} ${styles.sortActive}`} />
    : <ChevronDown size={13} className={`${styles.sortIcon} ${styles.sortActive}`} />;
};

const COLUMNS: { key: SortField; label: string }[] = [
  { key: 'id', label: 'Order ID' },
  { key: 'user_id', label: 'Customer' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount' },
  { key: 'date', label: 'Date' },
];

const TransactionsTable: React.FC<Props> = ({
  data, filters, sort, page, totalPages, totalCount, pageSize,
  onFilterChange, onResetFilters, onSortToggle, onPageChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  const pageNumbers = (() => {
    const pages: (number | '…')[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
      else if (pages[pages.length - 1] !== '…') pages.push('…');
    }
    return pages;
  })();

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.tableHeader}>
        <span className={styles.tableTitle}>Recent Orders</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={styles.countBadge}>{totalCount} records</span>
          <button
            className={`${styles.filterToggleBtn} ${showFilters ? styles.active : ''}`}
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className={styles.filterBar}>
          <div className={styles.filterPanel}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Category</label>
              <select
                className={styles.filterSelect}
                value={filters.category}
                onChange={(e) => onFilterChange('category', e.target.value as TransactionFilters['category'])}
              >
                <option value="All">All</option>
                <option value="Revenue">Revenue</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Status</label>
              <select
                className={styles.filterSelect}
                value={filters.status}
                onChange={(e) => onFilterChange('status', e.target.value as TransactionFilters['status'])}
              >
                <option value="All">All</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>User ID</label>
              <input
                className={styles.filterInput}
                placeholder="user_001"
                value={filters.user}
                onChange={(e) => onFilterChange('user', e.target.value)}
              />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Date From</label>
              <input
                type="date"
                className={styles.filterInput}
                value={filters.dateFrom}
                onChange={(e) => onFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Date To</label>
              <input
                type="date"
                className={styles.filterInput}
                value={filters.dateTo}
                onChange={(e) => onFilterChange('dateTo', e.target.value)}
              />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Min Amount</label>
              <input
                type="number"
                className={styles.filterInput}
                placeholder="0"
                value={filters.amountMin}
                onChange={(e) => onFilterChange('amountMin', e.target.value)}
              />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Max Amount</label>
              <input
                type="number"
                className={styles.filterInput}
                placeholder="9999"
                value={filters.amountMax}
                onChange={(e) => onFilterChange('amountMax', e.target.value)}
              />
            </div>
            <button className={styles.resetBtn} onClick={onResetFilters}>
              <X size={12} style={{ display: 'inline', marginRight: 4 }} />
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th key={String(col.key)} className={styles.th} onClick={() => onSortToggle(col.key)}>
                  <div className={styles.thInner}>
                    {col.label}
                    <SortIndicator field={col.key} sort={sort} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={6} className={styles.noData}>No transactions match your filters.</td></tr>
            ) : data.map((t) => (
              <tr key={t.id} className={styles.tr}>
                <td className={styles.td}>#{t.id}</td>
                <td className={styles.td}>
                  <div className={styles.customer}>
                    <img src={t.user_profile} alt="" className={styles.avatar} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    {t.user_id}
                  </div>
                </td>
                <td className={styles.td}>
                  <span className={t.category === 'Revenue' ? styles.catRevenue : styles.catExpense}>
                    {t.category}
                  </span>
                </td>
                <td className={styles.td}>
                  <span className={`${styles.badge} ${getBadgeCls(t.status)}`}>{t.status}</span>
                </td>
                <td className={styles.td}>
                  ${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className={styles.td}>
                  {format(new Date(t.date), 'MMM dd, yyyy')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <span className={styles.pageInfo}>
          Showing {totalCount === 0 ? 0 : start}–{end} of {totalCount}
        </span>
        <div className={styles.pageControls}>
          <button className={styles.pageBtn} onClick={() => onPageChange(page - 1)} disabled={page === 1}>‹</button>
          {pageNumbers.map((p, i) =>
            p === '…'
              ? <span key={`el-${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: 13 }}>…</span>
              : (
                <button
                  key={p}
                  className={`${styles.pageBtn} ${p === page ? styles.pageCurrent : ''}`}
                  onClick={() => onPageChange(Number(p))}
                >
                  {p}
                </button>
              )
          )}
          <button className={styles.pageBtn} onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>›</button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTable;
