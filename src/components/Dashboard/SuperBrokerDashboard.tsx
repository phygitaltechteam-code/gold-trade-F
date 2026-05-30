import React from 'react';
import {motion} from 'framer-motion';
import {
  Landmark,
  Wallet,
  Users,
  TrendingUp,
  Clock,
  Briefcase,
  IndianRupee,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import {useAuthContext} from '@/context/AuthContext';
import {useGetSuperBrokerDashboard} from '@/lib/api/dashboard';

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

const SuperBrokerDashboard: React.FC = () => {
  const {user} = useAuthContext();
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
  } = useGetSuperBrokerDashboard();

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
    noOfBroker: dashboardData?.data?.cards?.brokers?.total ?? 0,
    activeBrokers: dashboardData?.data?.cards?.brokers?.active ?? 0,
    noOfCustomer: dashboardData?.data?.cards?.customers?.total ?? 0,
    activeCustomers: dashboardData?.data?.cards?.customers?.active ?? 0,
    totalActiveTrends: dashboardData?.data?.cards?.activeTrends?.total ?? 0,
    superBrokerTotalCommission:
      dashboardData?.data?.cards?.totalCommission ?? 0,
    pendingSuperBrokerCommission:
      dashboardData?.data?.cards?.pendingCommission ?? 0,
    totalBrokerCommission:
      dashboardData?.data?.cards?.totalBrokerCommission ?? 0,
    totalCustomerWalletBalance:
      dashboardData?.data?.cards?.totalCustomerWalletBalance ?? 0,
    totalDeposits: dashboardData?.data?.cards?.totalDeposits ?? 0,
    totalWithdrawals: dashboardData?.data?.cards?.totalWithdrawals ?? 0,
  };

  // Log the data to debug
  console.log('Dashboard Data:', dashboardData);
  console.log('Stats:', dashboardStats);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-4">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
          <h3 className="text-lg font-semibold text-slate-900">
            Loading Dashboard
          </h3>
        </div>
      </div>
    );
  }

  if (isError) {
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
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="mb-6 flex flex-col justify-between gap-4 md:mb-8 md:flex-row md:items-center"
        >
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              Super Broker Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Welcome back, {user?.fullname || 'Super Broker'}! Here's your
              business overview
            </p>
          </div>
        </motion.div>

        {/* Row 1: Downline Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <StatCard
            title="My Brokers"
            value={formatNumber(dashboardStats.noOfBroker)}
            // subValue={`${dashboardStats.activeBrokers} Active`}
            icon={Briefcase}
            iconColor="text-blue-500"
          />
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
        </div>

        {/* Row 2: Commission & Earnings Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <FinancialStatCard
            title="My Total Commission"
            amount={formatCurrency(dashboardStats.superBrokerTotalCommission)}
            icon={Wallet}
            iconColor="text-emerald-500"
            // subtext="Total commission earned"
          />
          <FinancialStatCard
            title="Pending Commission"
            amount={formatCurrency(dashboardStats.pendingSuperBrokerCommission)}
            icon={Clock}
            iconColor="text-orange-500"
            // subtext="Awaiting settlement"
          />
          <FinancialStatCard
            title="Total Broker Commission"
            amount={formatCurrency(dashboardStats.totalBrokerCommission)}
            icon={Landmark}
            iconColor="text-indigo-500"
            // subtext="Commission earned by brokers under me"
          />
        </div>

        {/* Row 3: Financial Overview */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <FinancialStatCard
            title="Customer Wallet Balance"
            amount={formatCurrency(dashboardStats.totalCustomerWalletBalance)}
            icon={IndianRupee}
            iconColor="text-purple-500"
            // subtext="Total balance across all customers"
          />
          <FinancialStatCard
            title="Total Deposits"
            amount={formatCurrency(dashboardStats.totalDeposits)}
            icon={TrendingUp}
            iconColor="text-green-500"
            // subtext="Total customer deposits"
          />
          <FinancialStatCard
            title="Total Withdrawals"
            amount={formatCurrency(dashboardStats.totalWithdrawals)}
            icon={ArrowDownRight}
            iconColor="text-red-500"
            // subtext="Total customer withdrawals"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default SuperBrokerDashboard;
