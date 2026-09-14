import { type Order } from '../components/dashboard/OrdersTable';
import { type ChartData, type ActivityItem } from '../components/dashboard/ChartAndActivity';
import { parseISO, getMonth } from 'date-fns';

export const processTransactions = (data: Order[], searchQuery: string) => {
  // 1. Filter data based on search query
  const query = searchQuery.toLowerCase();
  const filteredData = data.filter((item) => 
    item.id.toString().includes(query) ||
    item.user_id.toLowerCase().includes(query) ||
    item.status.toLowerCase().includes(query)
  );

  // 2. Compute KPIs
  const totalRevenue = filteredData
    .filter(item => (item as any).category === 'Revenue')
    .reduce((sum, item) => sum + item.amount, 0);
  
  const uniqueUsers = new Set(filteredData.map(item => item.user_id)).size;

  // Mocked metrics that might not be in the transactions data directly
  const newSignups = Math.floor(uniqueUsers * 0.15); 
  const conversionRate = 3.4;

  const kpis = [
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalRevenue),
      trend: 12.5,
    },
    {
      id: 'active_users',
      label: 'Active Users',
      value: uniqueUsers.toLocaleString(),
      trend: 5.2,
    },
    {
      id: 'new_signups',
      label: 'New Signups',
      value: newSignups.toLocaleString(),
      trend: -2.4,
    },
    {
      id: 'conversion',
      label: 'Conversion Rate',
      value: `${conversionRate.toFixed(2)}%`,
      trend: 1.2,
    }
  ];

  // 3. Process Chart Data
  // Group by month
  const monthlyRevenue = new Array(12).fill(0);
  filteredData.forEach(item => {
    if ((item as any).category === 'Revenue') {
      const date = parseISO(item.date);
      const month = getMonth(date);
      monthlyRevenue[month] += item.amount;
    }
  });

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData: ChartData[] = monthNames.map((month, index) => ({
    month,
    revenue: monthlyRevenue[index]
  }));

  // 4. Generate some recent activities from the latest transactions
  const sortedData = [...filteredData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const activities: ActivityItem[] = sortedData.slice(0, 6).map((item, index) => {
    let type: ActivityItem['type'] = 'order';
    if (item.status === 'Paid') type = 'payment';
    else if (item.status === 'Pending') type = 'order';

    // Mock relative time for demonstration since data is from 2024
    const times = ['2m ago', '15m ago', '1h ago', '3h ago', '5h ago', '1d ago'];
    
    return {
      id: `act_${item.id}`,
      type,
      description: `${item.user_id} ${(item as any).category === 'Revenue' ? 'made a payment' : 'created an order'} of $${item.amount}`,
      timestamp: times[index] || '2d ago'
    };
  });

  // Limit orders for the table
  const recentOrders = sortedData.slice(0, 10);

  return {
    kpis,
    chartData,
    activities,
    recentOrders
  };
};
