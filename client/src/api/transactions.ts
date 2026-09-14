import axiosInstance from './axiosInstance';
import type { Transaction, PaginatedResponse, TransactionFilters, SortConfig } from '../types';

interface FetchParams {
  filters: TransactionFilters;
  sort: SortConfig;
  page: number;
  pageSize: number;
}

export const transactionsApi = {
  /**
   * GET /api/transactions
   * Server-side filtering, sorting, and pagination.
   */
  getAll: async ({ filters, sort, page, pageSize }: FetchParams): Promise<PaginatedResponse<Transaction>> => {
    const { data } = await axiosInstance.get('/transactions', {
      params: {
        ...filters,
        sortField: sort.field,
        sortDir: sort.direction,
        page,
        pageSize,
      },
    });
    return data;
  },

  /**
   * GET /api/transactions/summary
   * Returns aggregate KPIs (totalRevenue, totalExpenses, uniqueUsers, etc.)
   */
  getSummary: async () => {
    const { data } = await axiosInstance.get('/transactions/summary');
    return data;
  },

  /**
   * GET /api/transactions/analytics
   * Returns daily grouped data and top customers
   */
  getAnalytics: async () => {
    const { data } = await axiosInstance.get('/transactions/analytics');
    return data.data;
  },

  /**
   * POST /api/export
   * Generates CSV from selected columns and filtered dataset.
   * Returns blob for download.
   */
  exportCsv: async (columns: string[], filters: Partial<TransactionFilters>): Promise<Blob> => {
    const response = await axiosInstance.post(
      '/export',
      { columns, filters },
      { responseType: 'blob' }
    );
    return response.data as Blob;
  },
};
