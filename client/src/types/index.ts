// ── Transaction ──────────────────────────────────────────────────────────────
export interface Transaction {
  id: number;
  date: string;
  amount: number;
  category: 'Revenue' | 'Expense';
  status: 'Paid' | 'Pending' | 'Failed';
  user_id: string;
  user_profile: string;
}

// ── User / Auth ───────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'viewer';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ── API responses ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Filtering / Sorting ───────────────────────────────────────────────────────
export interface TransactionFilters {
  search: string;
  category: 'All' | 'Revenue' | 'Expense';
  status: 'All' | 'Paid' | 'Pending' | 'Failed';
  user: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
}

export type SortField = keyof Transaction | '';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// ── Dashboard KPI ─────────────────────────────────────────────────────────────
export interface KpiData {
  id: string;
  label: string;
  value: string;
  trend: number;
  icon: React.ElementType;
}

// ── CSV Export ────────────────────────────────────────────────────────────────
export type ExportColumn = {
  key: keyof Transaction;
  label: string;
  selected: boolean;
};
