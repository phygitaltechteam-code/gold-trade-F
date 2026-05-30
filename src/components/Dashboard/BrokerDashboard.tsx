import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  RefreshCw,
  Users,
  TrendingUp,
  Clock,
  Wallet,
  IndianRupee,
  ArrowDownRight,
  Activity,
  UserCheck,
  Target,
  DollarSign,
  PieChart,
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import GenericButton from '@/components/Forms/Buttons/GenericButton';
import { useGetBrokerDashboard } from '@/lib/api/dashboard';
import { cn } from '@/utils/utilities';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
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

// Custom Stat Card Component
const StatCard = ({
  title,
  value,
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
        {/* {subValue && <p className="text-gray-500 mt-1 text-xs">{subValue}</p>} */}
      </div>
      <div className={`rounded-lg p-2 ${iconColor.replace('text', 'bg')}/10`}>
        {Icon && <Icon className={`h-5 w-5 ${iconColor} md:h-6 md:w-6`} />}
      </div>
    </div>
  </div>
);

// Financial Stat Card
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
        {/* {subtext && <p className="text-gray-500 mt-1 text-xs">{subtext}</p>} */}
      </div>
      <div className={`rounded-lg p-2 ${iconColor.replace('text', 'bg')}/10`}>
        {Icon && <Icon className={`h-5 w-5 ${iconColor} md:h-6 md:w-6`} />}
      </div>
    </div>
  </div>
);

const BrokerDashboard: React.FC = () => {
  const { user } = useAuthContext();
  // const [selectedPeriod, setSelectedPeriod] = useState<
  //   '30d' | '7d' | '24h' | 'custom'
  // >('30d');
  // const [showDatePicker, setShowDatePicker] = useState(false);
  // const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  // const datePickerRef = useRef<HTMLDivElement>(null);

  const {
    data: dashboardData,
    isError,
    error,
    refetch,
  } = useGetBrokerDashboard();
  console.log('dashboardData', dashboardData);


  // const handlePeriodChange = (period: '30d' | '7d' | '24h' | 'custom') => {
  //   setSelectedPeriod(period);
  //   if (period === 'custom') {
  //     setShowDatePicker(true);
  //   } else {
  //     setShowDatePicker(false);
  //   }
  // };

  // const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
  //   setCustomDateRange((prev) => ({
  //     ...prev,
  //     [type]: value,
  //   }));
  // };

  // const handleApplyCustomFilter = () => {
  //   if (customDateRange.start && customDateRange.end) {
  //     setShowDatePicker(false);
  //     refetch();
  //   } else {
  //     toast.error('Please select both start and end dates');
  //   }
  // };

  // Close date picker when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (
  //       datePickerRef.current &&
  //       !datePickerRef.current.contains(event.target as Node)
  //     ) {
  //       setShowDatePicker(false);
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, []);

  // Set default custom dates when switching to custom
  // useEffect(() => {
  //   if (
  //     selectedPeriod === 'custom' &&
  //     !customDateRange.start &&
  //     !customDateRange.end
  //   ) {
  //     const end = new Date();
  //     const start = new Date();
  //     start.setDate(start.getDate() - 30);

  //     setCustomDateRange({
  //       start: start.toISOString().split('T')[0],
  //       end: end.toISOString().split('T')[0],
  //     });
  //   }
  // }, [selectedPeriod]);

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

  // Extract data from API response - Only Broker relevant data

  const dashboardStats = {
    // Broker's Downline Customers
    noOfCustomer: dashboardData?.data?.cards?.customers?.total ?? 0,
    activeCustomers: dashboardData?.data?.cards?.customers?.active ?? 0,
    totalActiveTrends: dashboardData?.data?.cards?.activeTrends?.total ?? 0,

    // Broker's Commission & Earnings
    brokerTotalCommission:
      dashboardData?.data?.cards?.totalCommission ?? 0,

    pendingBrokerCommission:
      dashboardData?.data?.cards?.pendingCommission ?? 0,

    // Customer Financials (Broker's clients)
    totalCustomerWalletBalance:
      dashboardData?.data?.cards?.totalCustomerWalletBalance ?? 0,

    totalDeposits:
      dashboardData?.data?.financials?.totalDeposits ?? 0,

    totalWithdrawals:
      dashboardData?.data?.financials?.totalWithdrawals ?? 0,

    // Performance Metrics
    totalTrades:
      dashboardData?.data?.cards?.totalTrades ?? 0,

    winRate:
      dashboardData?.data?.cards?.winRate ?? 0,
  };

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
              Broker Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Welcome back, {user?.name || 'Broker'}! Here's your business
              overview
            </p>
          </div>

          
        </motion.div>

        {/* Row 1: Customer Statistics - Broker's Downline */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <StatCard
            title="My Customers"
            value={formatNumber(dashboardStats.noOfCustomer)}
            // subValue={`${dashboardStats.activeCustomers} Active`}
            icon={Users}
            iconColor="text-green-500"
          />
          <StatCard
            title="Active Trends"
            value={formatNumber(dashboardStats.totalActiveTrends)}
            icon={Activity}
            iconColor="text-orange-500"
          />
          <StatCard
            title="Total Trades"
            value={formatNumber(dashboardStats.totalTrades)}
            icon={TrendingUp}
            iconColor="text-blue-500"
          />
        </div>

        {/* Row 2: Commission & Earnings Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <FinancialStatCard
            title="My Total Commission"
            amount={formatCurrency(dashboardStats.brokerTotalCommission)}
            icon={Wallet}
            iconColor="text-emerald-500"
          // subtext="Total commission earned"
          />
          <FinancialStatCard
            title="Pending Commission"
            amount={formatCurrency(dashboardStats.pendingBrokerCommission)}
            icon={Clock}
            iconColor="text-orange-500"
          // subtext="Awaiting settlement"
          />
          <FinancialStatCard
            title="Win Rate"
            amount={`${dashboardStats.winRate || 0}%`}
            icon={Target}
            iconColor="text-purple-500"
          // subtext="Success rate"
          />
        </div>

        {/* Row 3: Customer Financial Overview */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <FinancialStatCard
            title="Customer Wallet Balance"
            amount={formatCurrency(dashboardStats.totalCustomerWalletBalance)}
            icon={Wallet}
            iconColor="text-blue-500"
          // subtext="Total client funds"
          />
          <FinancialStatCard
            title="Total Deposits"
            amount={formatCurrency(dashboardStats.totalDeposits)}
            icon={TrendingUp}
            iconColor="text-green-500"
          // subtext="From my customers"
          />
          <FinancialStatCard
            title="Total Withdrawals"
            amount={formatCurrency(dashboardStats.totalWithdrawals)}
            icon={ArrowDownRight}
            iconColor="text-red-500"
          // subtext="By my customers"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default BrokerDashboard;
