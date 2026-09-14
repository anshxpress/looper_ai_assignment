import { useState, useMemo } from 'react';
import { DollarSign, Users, UserPlus, Activity } from 'lucide-react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { KpiRow } from './components/dashboard/KpiRow';
import { ChartAndActivity } from './components/dashboard/ChartAndActivity';
import { OrdersTable, type Order } from './components/dashboard/OrdersTable';
import { processTransactions } from './utils/dataProcessing';

import transactionsData from '../transactions (1).json';

function App() {
  const [activePage, setActivePage] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Order[]>(transactionsData as Order[]);

  const processedData = useMemo(() => {
    if (!transactions.length) return null;
    
    const result = processTransactions(transactions, searchQuery);
    
    // Inject the correct lucide icons to KPIs
    const icons = [DollarSign, Users, UserPlus, Activity];
    result.kpis = result.kpis.map((kpi, i) => ({
      ...kpi,
      icon: icons[i % icons.length]
    }));

    return result;
  }, [transactions, searchQuery]);

  return (
    <DashboardLayout 
      activePage={activePage} 
      onPageChange={setActivePage}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      {processedData ? (
        <>
          <KpiRow kpis={processedData.kpis as any} />
          <ChartAndActivity chartData={processedData.chartData} activities={processedData.activities} />
          <OrdersTable orders={processedData.recentOrders} />
        </>
      ) : (
        <div style={{ padding: '24px', color: 'var(--text-muted)' }}>No data available.</div>
      )}
    </DashboardLayout>
  );
}

export default App;
