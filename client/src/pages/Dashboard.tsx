import { useState } from 'react';
import { DashboardLayout } from '../components/common/DashboardLayout';
import { KpiRow } from '../components/charts/KpiCard';
import { RevenueChart } from '../components/charts/RevenueChart';
import { CategoryChart } from '../components/charts/CategoryChart';
import { ActivityFeed } from '../components/common/ActivityFeed';
import { AnalyticsView } from '../components/views/AnalyticsView';
import { UsersView } from '../components/views/UsersView';
import { SettingsView } from '../components/views/SettingsView';
import TransactionsTable from '../components/table/TransactionsTable';
import ExportModal from '../components/export/ExportModal';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { useTransactions } from '../hooks/useTransactions';

const Dashboard = () => {
  const [activePage, setActivePage] = useState('overview');
  const [showExport, setShowExport] = useState(false);

  // Hooks
  const {
    filters, sort, page, totalPages, totalCount, pageSize,
    paginated, updateFilter, resetFilters, toggleSort, setPage,
  } = useTransactions();

  // Summary computed by backend (fetching matching search query)
  const summary = useDashboardSummary(filters);

  return (
    <>
      <DashboardLayout
        activePage={activePage}
        onPageChange={setActivePage}
        searchQuery={filters.search}
        onSearchChange={(q) => updateFilter('search', q)}
        onExportClick={() => setShowExport(true)}
      >
        {/* Conditional Rendering based on activePage */}
        {activePage === 'overview' ? (
          <>
            {/* KPI Row */}
            {summary && <KpiRow kpis={summary.kpis} />}

            {/* Charts row */}
            {summary && (
              <div className="charts-grid">
                <RevenueChart data={summary.chartData} year={summary.chartYear} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
                  <CategoryChart data={summary.categoryData} />
                  <ActivityFeed items={summary.activities} />
                </div>
              </div>
            )}

            {/* Transaction Table */}
            <TransactionsTable
              data={paginated}
              filters={filters}
              sort={sort}
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onFilterChange={updateFilter}
              onResetFilters={resetFilters}
              onSortToggle={toggleSort}
              onPageChange={setPage}
            />
          </>
        ) : activePage === 'analytics' ? (
          <AnalyticsView />
        ) : activePage === 'users' ? (
          <UsersView />
        ) : (
          <SettingsView />
        )}
      </DashboardLayout>

      {/* Export Modal */}
      {showExport && (
        <ExportModal
          filters={filters}
          totalCount={totalCount}
          previewData={paginated.slice(0, 3)}
          onClose={() => setShowExport(false)}
        />
      )}
    </>
  );
};

export default Dashboard;
