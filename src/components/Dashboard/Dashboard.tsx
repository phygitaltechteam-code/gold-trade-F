import React, {useState, useEffect, useRef} from 'react';
import {motion} from 'framer-motion';
import {
  Landmark,
  Wallet,
  DollarSign,
  CalendarDays,
  RefreshCw,
  Users,
  TrendingUp,
  Clock,
  PieChart,
  Award,
  Briefcase,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  UserCheck,
  CreditCard,
  Activity,
} from 'lucide-react';
import {useAuthContext} from '@/context/AuthContext';
import toast from 'react-hot-toast';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {
  buildDashboardFilters,
  useGetCompanyDashboard,
} from '@/lib/api/dashboard';
import {cn} from '@/utils/utilities';

// Animation variants
const containerVariants = {
  hidden: {opacity: 0},
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {opacity: 0, y: 20},
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

// Custom Stat Card Component with icon on the right
const StatCard = ({
  title,
  value,
  subValue,
  icon: Icon,
  iconColor = 'text-orange-500',
}) => (
  <div className="group relative overflow-hidden rounded-lg border border-stroke bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-strokedark dark:bg-boxdark md:p-5">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
          {title}
        </p>
        <h4 className="mt-2 text-xl font-bold text-black dark:text-white md:text-2xl">
          {value}
        </h4>
        {subValue && <p className="text-gray-500 mt-1 text-xs">{subValue}</p>}
      </div>
      <div className={`rounded-lg p-2 ${iconColor.replace('text', 'bg')}/10`}>
        {Icon && <Icon className={`h-5 w-5 ${iconColor} md:h-6 md:w-6`} />}
      </div>
    </div>
  </div>
);

// Financial Stat Card with icon on the right
const FinancialStatCard = ({
  title,
  amount,
  icon: Icon,
  iconColor = 'text-orange-500',
}) => (
  <div className="group relative overflow-hidden rounded-lg border border-stroke bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-strokedark dark:bg-boxdark md:p-5">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
          {title}
        </p>
        <h4 className="mt-2 text-lg font-bold text-black dark:text-white md:text-xl">
          {amount}
        </h4>
      </div>
      <div className={`rounded-lg p-2 ${iconColor.replace('text', 'bg')}/10`}>
        {Icon && <Icon className={`h-5 w-5 ${iconColor} md:h-6 md:w-6`} />}
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const {user} = useAuthContext();
  const [selectedPeriod, setSelectedPeriod] = useState<
    '30d' | '7d' | '24h' | 'custom'
  >('30d');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({start: '', end: ''});
  const datePickerRef = useRef<HTMLDivElement>(null);

  const filters = buildDashboardFilters(
    selectedPeriod,
    selectedPeriod === 'custom' ? customDateRange : undefined,
  );

  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCompanyDashboard(filters);

  const handlePeriodChange = (period: '30d' | '7d' | '24h' | 'custom') => {
    setSelectedPeriod(period);
    if (period === 'custom') {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
    }
  };

  const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
    setCustomDateRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleApplyCustomFilter = () => {
    if (customDateRange.start && customDateRange.end) {
      setShowDatePicker(false);
      refetch();
    } else {
      toast.error('Please select both start and end dates');
    }
  };

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set default custom dates when switching to custom
  useEffect(() => {
    if (
      selectedPeriod === 'custom' &&
      !customDateRange.start &&
      !customDateRange.end
    ) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);

      setCustomDateRange({
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      });
    }
  }, [selectedPeriod]);

  // Format functions
  const formatNumber = (num: number) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return '₹0';
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`;
    }
    return `₹${formatNumber(amount)}`;
  };

  // Extract data from API response
  const dashboardStats = {
    // User Statistics
    noOfSuperBroker: dashboardData?.cards?.superBrokers?.total ?? 0,
    activeSuperBrokers: dashboardData?.cards?.superBrokers?.active ?? 0,
    noOfBroker: dashboardData?.cards?.brokers?.total ?? 0,
    activeBrokers: dashboardData?.cards?.brokers?.active ?? 0,
    noOfCustomer: dashboardData?.cards?.customers?.total ?? 0,
    activeCustomers: dashboardData?.cards?.customers?.active ?? 0,
    totalActiveTrends: dashboardData?.cards?.activeTrends?.total ?? 0,
    totalActiveTrendsAmount: 0, // Not available in current API

    // Financial Metrics
    adminCommission: dashboardData?.cards?.adminCommission ?? 0,
    superBrokerTotalCommission:
      dashboardData?.cards?.superBrokerTotalCommission ?? 0,
    totalBrokerCommission: dashboardData?.cards?.totalBrokerCommission ?? 0,
    totalAdminProfitLoss: dashboardData?.cards?.totalAdminPnL ?? 0,
    totalCustomerWalletBalance:
      dashboardData?.cards?.totalCustomerWalletBalance ?? 0,
    pendingSuperBrokerCommission:
      dashboardData?.cards?.pendingSuperBrokerCommission ?? 0,
    pendingBrokerCommission: dashboardData?.cards?.pendingBrokerCommission ?? 0,

    // Financials
    totalDeposits: dashboardData?.financials?.totalDeposits ?? 0,
    totalWithdrawals: dashboardData?.financials?.totalWithdrawals ?? 0,
    netCashFlow: dashboardData?.financials?.netCashFlow ?? 0,
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-4">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
          <h3 className="text-lg font-semibold text-slate-900">
            Loading Dashboard
          </h3>
          <p className="text-slate-500">Fetching latest data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-4">
        <div className="max-w-md text-center">
          <div className="mb-4 text-5xl text-red-500">⚠️</div>
          <h3 className="mb-2 text-lg font-semibold text-slate-900">
            Failed to Load Dashboard
          </h3>
          <p className="mb-4 text-slate-500">
            {error instanceof Error
              ? error.message
              : 'An unknown error occurred'}
          </p>
          <GenericButton
            onClick={() => refetch()}
            className="flex items-center gap-2 bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </GenericButton>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#f8fafc] p-4 md:p-6"
    >
      <div className="mx-auto max-w-[2000px]">
        {/* Header with controls */}
        <motion.div
          variants={itemVariants}
          className="mb-6 flex flex-col justify-between gap-4 md:mb-8 md:flex-row md:items-center"
        >
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              Dashboard Overview
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Current Filter:{' '}
              <span className="font-medium text-orange-500">
                {selectedPeriod === '30d'
                  ? '30 Days'
                  : selectedPeriod === '7d'
                    ? '7 Days'
                    : selectedPeriod === '24h'
                      ? '24 Hours'
                      : 'Custom Range'}
              </span>
              {filters.from && filters.to && selectedPeriod === 'custom' && (
                <span className="ml-2 text-slate-500">
                  ({filters.from} to {filters.to})
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => refetch()}
              className="text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-lg border border-stroke bg-white px-4 py-2 text-sm font-medium transition-all"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Period Selector */}
            <div className="relative" ref={datePickerRef}>
              <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-stroke bg-white p-1 shadow-sm">
                <button
                  onClick={() => handlePeriodChange('30d')}
                  className={cn(
                    'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    selectedPeriod === '30d'
                      ? 'bg-orange-500 text-white shadow-sm hover:bg-orange-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  <span className="hidden sm:inline">30 Days</span>
                  <span className="sm:hidden">30D</span>
                </button>
                <button
                  onClick={() => handlePeriodChange('7d')}
                  className={cn(
                    'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    selectedPeriod === '7d'
                      ? 'bg-orange-500 text-white shadow-sm hover:bg-orange-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  <span className="hidden sm:inline">7 Days</span>
                  <span className="sm:hidden">7D</span>
                </button>
                <button
                  onClick={() => handlePeriodChange('24h')}
                  className={cn(
                    'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    selectedPeriod === '24h'
                      ? 'bg-orange-500 text-white shadow-sm hover:bg-orange-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  <span className="hidden sm:inline">24 Hours</span>
                  <span className="sm:hidden">24H</span>
                </button>
                <div className="bg-gray-200 mx-1 h-5 w-px"></div>
                <button
                  onClick={() => handlePeriodChange('custom')}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    selectedPeriod === 'custom'
                      ? 'bg-orange-500 text-white shadow-sm hover:bg-orange-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">Custom</span>
                </button>
              </div>

              {/* Custom Date Range Picker */}
              {selectedPeriod === 'custom' && showDatePicker && (
                <div className="absolute right-0 top-full z-40 mt-2 w-full min-w-[300px] rounded-lg border border-stroke bg-white p-4 shadow-lg sm:w-auto">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                      <label className="text-gray-700 text-sm font-medium sm:w-12">
                        From:
                      </label>
                      <input
                        type="date"
                        value={customDateRange.start}
                        onChange={(e) =>
                          handleCustomDateChange('start', e.target.value)
                        }
                        className="border-gray-300 w-full rounded border px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                      <label className="text-gray-700 text-sm font-medium sm:w-8">
                        To:
                      </label>
                      <input
                        type="date"
                        value={customDateRange.end}
                        onChange={(e) =>
                          handleCustomDateChange('end', e.target.value)
                        }
                        className="border-gray-300 w-full rounded border px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    <button
                      onClick={handleApplyCustomFilter}
                      className="mt-2 rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-2 sm:mt-0"
                      disabled={!customDateRange.start || !customDateRange.end}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Row 1: User Statistics Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <StatCard
            title="No. of Super Brokers"
            value={formatNumber(dashboardStats.noOfSuperBroker)}
            subValue={`${dashboardStats.activeSuperBrokers} Active`}
            icon={Award}
            iconColor="text-purple-500"
          />
          <StatCard
            title="No. of Brokers"
            value={formatNumber(dashboardStats.noOfBroker)}
            subValue={`${dashboardStats.activeBrokers} Active`}
            icon={Briefcase}
            iconColor="text-blue-500"
          />
          <StatCard
            title="No. of Customers"
            value={formatNumber(dashboardStats.noOfCustomer)}
            subValue={`${dashboardStats.activeCustomers} Active`}
            icon={Users}
            iconColor="text-green-500"
          />
          <StatCard
            title="Total Active Trends"
            value={formatNumber(dashboardStats.totalActiveTrends)}
            icon={Activity}
            iconColor="text-orange-500"
          />
        </div>

        {/* Row 2: Commission Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <FinancialStatCard
            title="Admin Commission"
            amount={formatCurrency(dashboardStats.adminCommission)}
            icon={IndianRupee}
            iconColor="text-emerald-500"
          />
          <FinancialStatCard
            title="Super Broker Total Commission"
            amount={formatCurrency(dashboardStats.superBrokerTotalCommission)}
            icon={Wallet}
            iconColor="text-blue-500"
          />
          <FinancialStatCard
            title="Total Broker Commission"
            amount={formatCurrency(dashboardStats.totalBrokerCommission)}
            icon={Landmark}
            iconColor="text-indigo-500"
          />
          <FinancialStatCard
            title="Total Admin P&L"
            amount={formatCurrency(dashboardStats.totalAdminProfitLoss)}
            icon={PieChart}
            iconColor={
              dashboardStats.totalAdminProfitLoss >= 0
                ? 'text-green-500'
                : 'text-red-500'
            }
          />
        </div>

        {/* Row 3: Wallet & Pending Commissions */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <FinancialStatCard
            title="Total Customer Wallet Balance"
            amount={formatCurrency(dashboardStats.totalCustomerWalletBalance)}
            icon={Wallet}
            iconColor="text-green-500"
          />
          <FinancialStatCard
            title="Pending Super Broker Commission"
            amount={formatCurrency(dashboardStats.pendingSuperBrokerCommission)}
            icon={Clock}
            iconColor="text-orange-500"
          />
          <FinancialStatCard
            title="Pending Broker Commission"
            amount={formatCurrency(dashboardStats.pendingBrokerCommission)}
            icon={Clock}
            iconColor="text-orange-500"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
