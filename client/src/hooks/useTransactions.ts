import { useState, useCallback, useEffect } from 'react';
import type { Transaction, TransactionFilters, SortConfig, SortField, SortDirection } from '../types';
import { transactionsApi } from '../api/transactions';
import { useAlert } from '../context/AlertContext';

const PAGE_SIZE = 10;

const DEFAULT_FILTERS: TransactionFilters = {
  search: '',
  category: 'All',
  status: 'All',
  user: '',
  dateFrom: '',
  dateTo: '',
  amountMin: '',
  amountMax: '',
};

export function useTransactions() {
  const { showAlert } = useAlert();
  
  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortConfig>({ field: 'date', direction: 'desc' });
  const [page, setPage] = useState(1);
  
  const [data, setData] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // ── Fetch Data ──────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await transactionsApi.getAll({
        filters,
        sort,
        page,
        pageSize: PAGE_SIZE,
      });
      setData(response.data);
      setTotalCount(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error(err);
      showAlert('error', 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [filters, sort, page, showAlert]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Update State ────────────────────────────────────────────────────────────
  const updateFilter = useCallback(<K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const toggleSort = useCallback((field: SortField) => {
    setSort((prev) => {
      if (prev.field === field) {
        const next: SortDirection = prev.direction === 'asc' ? 'desc' : 'asc';
        return { field, direction: next };
      }
      return { field, direction: 'asc' };
    });
    setPage(1);
  }, []);

  return {
    filters,
    sort,
    page,
    totalPages,
    totalCount,
    pageSize: PAGE_SIZE,
    paginated: data,
    isLoading,
    updateFilter,
    resetFilters,
    toggleSort,
    setPage,
  };
}
