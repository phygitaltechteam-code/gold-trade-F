import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import DisplaySuperBroker from './DisplaySuperBoker';
import { useGetAllSuperBrocker } from '@/lib/react-query/superbrocker';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';

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

// Stat Card Component
const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-orange-500',
  bgColor = 'bg-orange-50',
  valueColor = 'text-slate-900',
}) => (
  <div className="group relative overflow-hidden rounded-lg border border-stroke bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-strokedark dark:bg-boxdark md:p-5">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
          {title}
        </p>
        <h4 className={`mt-2 text-xl font-bold md:text-2xl ${valueColor}`}>
          {value}
        </h4>
      </div>
      <div className={`rounded-lg p-2 ${bgColor}`}>
        {Icon && <Icon className={`h-5 w-5 ${iconColor} md:h-6 md:w-6`} />}
      </div>
    </div>
  </div>
);

const SuperBrokerflow = () => {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const { data: responseData, isLoading } = useGetAllSuperBrocker();

  console.log('Full Response Data:', responseData);

  // Extract broker data
  let brokerData: any[] = [];
  if (responseData?.data?.data) {
    brokerData = responseData.data.data;
  } else if (responseData?.data) {
    brokerData = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
  } else if (Array.isArray(responseData)) {
    brokerData = responseData;
  }

  console.log('Broker Data:', brokerData);

  // Calculate statistics
  const totalSuperBrokers = brokerData?.length || 0;

  // Count active super brokers
  const activeSuperBrokers = brokerData?.filter(
    (broker) => broker.isActive === true || broker.status === 'ACTIVE'
  ).length || 0;

  // Calculate total commission
  const totalCommission = brokerData?.reduce((sum, broker) => {
    const commission = broker.totalCommission ||
      broker.totalBrokerCommission ||
      broker.commissionTotal ||
      broker.totalCommissions ||
      broker.commission ||
      0;
    return sum + (typeof commission === 'number' ? commission : parseFloat(commission) || 0);
  }, 0) || 0;

  // Calculate paid commission
  const paidCommission = brokerData?.reduce((sum, broker) => {
    const commission = broker.paidCommission ||
      broker.paidBrokerCommission ||
      broker.commissionPaid ||
      broker.paidCommissions ||
      0;
    return sum + (typeof commission === 'number' ? commission : parseFloat(commission) || 0);
  }, 0) || 0;

  // Calculate pending commission
  const pendingCommission = brokerData?.reduce((sum, broker) => {
    const commission = broker.pendingCommission ||
      broker.pendingBrokerCommission ||
      broker.commissionPending ||
      broker.pendingCommissions ||
      0;
    return sum + (typeof commission === 'number' ? commission : parseFloat(commission) || 0);
  }, 0) || 0;

  // Format currency - Show full amount without shortening
  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
    // Show full amount with proper Indian number formatting
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen w-full bg-[#f8fafc] p-4 md:p-6"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center"
      >
        <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
          Super Broker Management
        </h1>
        <button
          onClick={() => navigate({ to: '/companybroker/addSuperBrocker' })}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-white transition-all hover:from-orange-600 hover:to-red-600"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Super Broker
        </button>
      </motion.div>

      {/* Statistics Cards */}
      {!isLoading && (
        <motion.div
          variants={itemVariants}
          className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <StatCard
            title="Total Super Brokers"
            value={totalSuperBrokers}
            icon={Users}
            iconColor="text-blue-500"
            bgColor="bg-blue-50"
          />
          <StatCard
            title="Active Super Brokers"
            value={activeSuperBrokers}
            icon={UserCheck}
            iconColor="text-emerald-500"
            bgColor="bg-emerald-50"
          />
          <StatCard
            title="Total Commission"
            value={formatCurrency(totalCommission.toFixed(2))}
            icon={DollarSign}
            iconColor="text-purple-500"
            bgColor="bg-purple-50"
          />
          <StatCard
            title="Paid Commission"
            value={
              formatCurrency(
                Number.isInteger(paidCommission)
                  ? paidCommission
                  : Number(paidCommission.toFixed(2))
              )
            }
            icon={CheckCircle}
            iconColor="text-green-500"
            bgColor="bg-green-50"
          />
          <StatCard
            title="Pending Commission"
            value={
              formatCurrency(
                Number.isInteger(pendingCommission)
                  ? pendingCommission
                  : Number(pendingCommission.toFixed(2))
              )
            }
            icon={Clock}
            iconColor="text-orange-500"
            bgColor="bg-orange-50"
          />
        </motion.div>
      )}

      {/* Table */}
      <motion.div variants={itemVariants}>
        <DisplaySuperBroker refreshTrigger={refreshTrigger} />
      </motion.div>
    </motion.div>
  );
};

export default SuperBrokerflow;