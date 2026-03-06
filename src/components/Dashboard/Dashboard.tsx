import React, {useState, useEffect, useRef} from 'react';
import {motion} from 'framer-motion';
import {
  Landmark,
  Wallet,
  DollarSign,
  Layers,
  Edit3,
  MoreHorizontal,
  CalendarDays,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import StatsCard from '@/components/Dashboard/StatsCards';
import {
  VolumeVsFeesChart,
  TopUpsVsTransfersChart,
} from '@/components/Dashboard/Charts';
import {useAuthContext} from '@/context/AuthContext';
import toast from 'react-hot-toast';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import {buildDashboardFilters, useDashboardData} from '@/lib/api/dashboard';
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
    error,
    refetch,
    isError,
  } = useDashboardData(filters);

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
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return '$0';
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${formatNumber(amount)}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="font-sans flex min-h-screen w-full items-center justify-center bg-[#f8fafc] p-4">
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
      <div className="font-sans flex min-h-screen w-full items-center justify-center bg-[#f8fafc] p-4">
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

  // Map API data to component props - all dynamic from API
  const statsData = {
    totalDeposits: dashboardData?.TOTAL_DEPOSITS ?? 0,
    withdrawals: dashboardData?.WITHDRAWALS ?? 0,
    platformProfit: dashboardData?.PLATFORM_PROFIT ?? 0,
    openExposure: dashboardData?.OPEN_EXPOSURE ?? 0,
    marginUtil: dashboardData?.MARGIN_UTIL ?? 0,
  };

  // You can add more dynamic data here as your API expands
  // For now, we'll show empty states for charts and tables
  const emptyTradingVolume: {name: string; volume: number; fees: number}[] = [];
  const emptyWeeklyData: {name: string; topUps: number; transfers: number}[] =
    [];
  const emptyTopTraders: any[] = [];
  const emptyTransactions: any[] = [];

  // Optional: Show message when data is zero/empty
  const hasNoData = Object.values(statsData).every((value) => value === 0);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="font-sans min-h-screen bg-[#f8fafc] text-slate-900"
    >
      <main className="mx-auto w-full max-w-7xl space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:space-y-8 lg:px-8 lg:py-8">
        {/* Header with controls */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"
        >
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl">
              Financial Overview
            </h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Current Filter:{' '}
              <span className="font-medium text-orange-500">
                {filters.filter === '30Days'
                  ? '30 Days'
                  : filters.filter === '7Days'
                    ? '7 Days'
                    : filters.filter === '24Hours'
                      ? '24 Hours'
                      : 'Custom Range'}
              </span>
              {filters.from && filters.to && (
                <span className="ml-2 text-slate-500">
                  ({filters.from} to {filters.to})
                </span>
              )}
            </p>
            {hasNoData && (
              <p className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-600">
                No data available for the selected period. Try adjusting your
                filters.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Period Selector */}
            <div className="relative" ref={datePickerRef}>
              <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  onClick={() => handlePeriodChange('30d')}
                  className={cn(
                    'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    selectedPeriod === '30d'
                      ? 'bg-orange-500 text-white shadow-sm hover:bg-orange-600'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
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
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
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
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
                  )}
                >
                  <span className="hidden sm:inline">24 Hours</span>
                  <span className="sm:hidden">24H</span>
                </button>
                <div className="mx-1 h-5 w-px shrink-0 bg-slate-200"></div>
                <button
                  onClick={() => handlePeriodChange('custom')}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    selectedPeriod === 'custom'
                      ? 'bg-orange-500 text-white shadow-sm hover:bg-orange-600'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
                  )}
                >
                  <CalendarDays className="h-4 w-4" />
                  <span className="hidden sm:inline">Custom</span>
                </button>
              </div>

              {/* Custom Date Range Picker */}
              {selectedPeriod === 'custom' && showDatePicker && (
                <div className="absolute right-0 top-full z-40 mt-2 w-full min-w-[300px] rounded-lg border border-slate-200 bg-white p-4 shadow-lg sm:w-auto">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                      <label className="text-sm font-medium text-slate-700 sm:w-12">
                        From:
                      </label>
                      <input
                        type="date"
                        value={customDateRange.start}
                        onChange={(e) =>
                          handleCustomDateChange('start', e.target.value)
                        }
                        className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                      <label className="text-sm font-medium text-slate-700 sm:w-8">
                        To:
                      </label>
                      <input
                        type="date"
                        value={customDateRange.end}
                        onChange={(e) =>
                          handleCustomDateChange('end', e.target.value)
                        }
                        className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
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

        {/* Stats Cards Grid - All Dynamic */}
        <motion.section
          variants={containerVariants}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5"
        >
          <StatsCard
            title="TOTAL DEPOSITS"
            value={formatCurrency(statsData.totalDeposits)}
            trend={statsData.totalDeposits > 0 ? '+0%' : '0%'}
            isUp={statsData.totalDeposits > 0}
            icon={Landmark}
          />
          <StatsCard
            title="WITHDRAWALS"
            value={formatCurrency(statsData.withdrawals)}
            trend={statsData.withdrawals > 0 ? '+0%' : '0%'}
            isUp={statsData.withdrawals > 0}
            icon={Wallet}
          />
          <StatsCard
            title="PLATFORM PROFIT"
            value={formatCurrency(statsData.platformProfit)}
            progress={
              statsData.platformProfit > 0
                ? Math.min((statsData.platformProfit / 1000000) * 100, 100)
                : 0
            }
            isDark={true}
            icon={DollarSign}
          />
          <StatsCard
            title="OPEN EXPOSURE"
            value={`${statsData.openExposure} XAU`}
            status={
              statsData.openExposure > 1000 ? 'High Volatility' : 'Normal'
            }
            statusType={statsData.openExposure > 1000 ? 'warning' : 'success'}
            icon={Layers}
          />
          <StatsCard
            title="MARGIN UTIL"
            value={`${statsData.marginUtil}%`}
            status={
              statsData.marginUtil < 50
                ? 'Healthy'
                : statsData.marginUtil < 75
                  ? 'Moderate'
                  : 'High'
            }
            statusType={
              statsData.marginUtil < 50
                ? 'success'
                : statsData.marginUtil < 75
                  ? 'warning'
                  : 'warning'
            }
            icon={Edit3}
          />
        </motion.section>

        {/* Charts Section - Will show empty states until API provides data */}
        <motion.section
          variants={containerVariants}
          className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3"
        >
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6 lg:col-span-2"
          >
            <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                  Daily Trading Volume
                </h3>
              </div>
            </div>
            <div className="flex h-[200px] w-full items-center justify-center sm:h-[250px] lg:h-[300px]">
              {dashboardData?.tradingVolume ? (
                <VolumeVsFeesChart data={dashboardData.tradingVolume} />
              ) : (
                <p className="text-sm text-slate-400">
                  No trading volume data available
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6"
          >
            <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                  Revenue Source
                </h3>
              </div>
            </div>
            <div className="flex h-[200px] w-full items-center justify-center sm:h-[250px] lg:h-[300px]">
              {dashboardData?.weeklyData ? (
                <TopUpsVsTransfersChart data={dashboardData.weeklyData} />
              ) : (
                <p className="text-sm text-slate-400">
                  No weekly activity data available
                </p>
              )}
            </div>
          </motion.div>
        </motion.section>

        {/* Tables Section - Will show empty states until API provides data */}
        <motion.section
          variants={containerVariants}
          className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2"
        >
          {/* Top Traders */}
          <motion.div
            variants={itemVariants}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-6">
              <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                Top Traders
              </h3>
              <motion.button
                whileHover={{rotate: 90}}
                transition={{duration: 0.2}}
                className="text-slate-400 hover:text-slate-600"
              >
                <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[9px] font-bold uppercase tracking-wider text-slate-400 lg:text-[10px]">
                    <th className="px-4 py-4 lg:px-6">Trader</th>
                    <th className="px-4 py-4 lg:px-6">Volume (XAU)</th>
                    <th className="px-4 py-4 lg:px-6">PNL</th>
                    <th className="px-4 py-4 lg:px-6">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dashboardData?.topTraders &&
                  dashboardData.topTraders.length > 0 ? (
                    dashboardData.topTraders.map((trader, index) => (
                      <motion.tr
                        key={trader.id || index}
                        initial={{opacity: 0, x: -20}}
                        animate={{opacity: 1, x: 0}}
                        transition={{delay: index * 0.1}}
                        className="transition-colors hover:bg-slate-50/50"
                      >
                        <td className="px-4 py-4 lg:px-6">
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{scale: 1.1}}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-500 lg:h-8 lg:w-8 lg:text-xs"
                            >
                              {trader.name
                                ? trader.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                : 'NA'}
                            </motion.div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 lg:text-sm">
                                {trader.name || 'Unknown'}
                              </div>
                              <div className="text-[8px] text-slate-400 lg:text-[10px]">
                                ID: #{trader.id || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-medium text-slate-600 lg:px-6 lg:text-sm">
                          {trader.volume || '0'}
                        </td>
                        <td
                          className={cn(
                            'px-4 py-4 text-xs font-bold lg:px-6 lg:text-sm',
                            trader.pnl && trader.pnl.startsWith('+')
                              ? 'text-emerald-500'
                              : 'text-rose-500',
                          )}
                        >
                          {trader.pnl || '$0'}
                        </td>
                        <td className="px-4 py-4 lg:px-6">
                          <span
                            className={cn(
                              'rounded-md px-2 py-1 text-[8px] font-bold lg:text-[10px]',
                              trader.risk === 'Low'
                                ? 'bg-emerald-50 text-emerald-600'
                                : trader.risk === 'Med'
                                  ? 'bg-amber-50 text-amber-600'
                                  : 'bg-rose-50 text-rose-600',
                            )}
                          >
                            {trader.risk || 'Low'}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        No trader data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            variants={itemVariants}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-6">
              <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                Recent Transactions
              </h3>
              <button className="text-[10px] font-bold text-orange-500 hover:underline sm:text-xs">
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[9px] font-bold uppercase tracking-wider text-slate-400 lg:text-[10px]">
                    <th className="px-4 py-4 lg:px-6">Type</th>
                    <th className="px-4 py-4 lg:px-6">Date/Time</th>
                    <th className="px-4 py-4 lg:px-6">Amount</th>
                    <th className="px-4 py-4 lg:px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dashboardData?.recentTransactions &&
                  dashboardData.recentTransactions.length > 0 ? (
                    dashboardData.recentTransactions.map((tx, i) => (
                      <motion.tr
                        key={i}
                        initial={{opacity: 0, x: 20}}
                        animate={{opacity: 1, x: 0}}
                        transition={{delay: i * 0.1}}
                        className="transition-colors hover:bg-slate-50/50"
                      >
                        <td className="px-4 py-4 lg:px-6">
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{rotate: 360}}
                              transition={{duration: 0.3}}
                              className="rounded-lg bg-slate-100 p-1.5 lg:p-2"
                            >
                              {tx.type === 'Deposit' ? (
                                <ArrowDownLeft className="h-3 w-3 text-slate-600 lg:h-3.5 lg:w-3.5" />
                              ) : (
                                <ArrowUpRight className="h-3 w-3 text-slate-600 lg:h-3.5 lg:w-3.5" />
                              )}
                            </motion.div>
                            <span className="text-xs font-bold text-slate-900 lg:text-sm">
                              {tx.type || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs text-slate-500 lg:px-6 lg:text-sm">
                          {tx.date || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-xs font-bold text-slate-900 lg:px-6 lg:text-sm">
                          {tx.amount || '$0'}
                        </td>
                        <td className="px-4 py-4 lg:px-6">
                          <span
                            className={cn(
                              'rounded-full px-2 py-1 text-[8px] font-bold lg:px-3 lg:text-[10px]',
                              tx.status === 'Completed'
                                ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
                                : tx.status === 'Pending'
                                  ? 'border border-amber-100 bg-amber-50 text-amber-600'
                                  : 'border border-rose-100 bg-rose-50 text-rose-600',
                            )}
                          >
                            {tx.status || 'Pending'}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        No transaction data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.section>
      </main>
    </motion.div>
  );
};

export default Dashboard;
