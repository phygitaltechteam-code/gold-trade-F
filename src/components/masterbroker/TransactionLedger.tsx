import React, { useState, useMemo } from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import { useGetTransactionLedger } from '@/lib/api/masterpanelapi/masterapi';
import { RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  DollarSign,
  IndianRupee,
  Wallet,
  Clock,
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
      </div>
      <div className={`rounded-lg p-2 ${iconColor.replace('text', 'bg')}/10`}>
        {Icon && <Icon className={`h-5 w-5 ${iconColor} md:h-6 md:w-6`} />}
      </div>
    </div>
  </div>
);

const TransactionLedger = () => {
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data: transactionLedgerData, refetch, isLoading } = useGetTransactionLedger();

  // Calculate statistics from transaction data
  const calculateStats = (data) => {
    if (!data || !Array.isArray(data)) {
      return {
        activeTrades: 0,
        activeTradeAmount: 0,
        todaysPnL: 0,
        todaysCommission: 0,
      };
    }

    let activeTrades = 0;
    let activeTradeAmount = 0;
    let todaysPnL = 0;
    let todaysCommission = 0;

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    data.forEach((item) => {
      // Count active trades (status is not completed or closed)
      if (item.status && item.status.toLowerCase() !== 'completed' && item.status.toLowerCase() !== 'closed') {
        activeTrades++;
        // Calculate active trade amount (buy price * qty)
        const qty = item.qty || item.Qty || 0;
        const buyPrice = item.buyPrice || 0;
        activeTradeAmount += qty * buyPrice;
      }

      // Calculate today's P&L
      const itemDate = item.dateTime?.split('T')[0];
      if (itemDate === today) {
        const pnl = item.pnl || item['p&l'] || 0;
        todaysPnL += pnl;
      }

      // Calculate today's commission (assuming there's a commission field)
      const commission = item.commission || item.masterBrokerCommission || 0;
      if (itemDate === today) {
        todaysCommission += commission;
      }
    });

    return {
      activeTrades,
      activeTradeAmount,
      todaysPnL,
      todaysCommission,
    };
  };

  // Format quantity/lot as "qty/lotSize"
  const formatQtyLot = (item) => {
    if (!item) return '-';
    const qty = item.qty || item.Qty || 0;
    const lotSize = item.lotSize || item.lotSize || 0;
    if (lotSize && lotSize !== qty) {
      return `${qty}/${lotSize}`;
    }
    return qty;
  };

  // Format P&L with proper sign and color
  const formatPnL = (item) => {
    const pnl = item.pnl || item['p&l'] || 0;
    const sign = pnl > 0 ? '+' : '';
    return `${sign}${Number(pnl).toFixed(2)}`;
  };

  // All columns - showing all data (removed the View More toggle)
  const allColumns = [
    { header: 'Date & Time', accessor: 'dateTime' },
    { header: 'Trader Name', accessor: 'customerName' },
    { header: 'Script', accessor: 'script' },
    { header: 'Qty/Lot', accessor: (item) => formatQtyLot(item) },
    { header: 'Buy Price', accessor: 'buyPrice' },
    { header: 'Sell Price', accessor: 'sellPrice' },
    { header: 'Buy Time', accessor: 'buyTime' },
    { header: 'Sell Time', accessor: 'sellTime' },
    { header: 'Status', accessor: 'status' },
    { header: 'P&L', accessor: (item) => formatPnL(item) },
    { header: 'Master Broker Commission', accessor: 'masterBrokerCommission' },
  ];

  // Extract data array safely
  const getTransactionData = () => {
    if (!transactionLedgerData) return [];

    if (Array.isArray(transactionLedgerData)) return transactionLedgerData;
    if (
      transactionLedgerData.data &&
      Array.isArray(transactionLedgerData.data?.data)
    )
      return transactionLedgerData.data.data;
    if (
      transactionLedgerData.data?.transactions &&
      Array.isArray(transactionLedgerData.data?.transactions)
    )
      return transactionLedgerData.data.transactions;

    return [];
  };

  // Filter data by date and status
  const filterData = (data) => {
    if (!Array.isArray(data)) return [];
    if (!ledgerStartDate && !ledgerEndDate && !statusFilter) return data;

    return data.filter((item) => {
      // Status Filter
      if (statusFilter) {
        const itemStatus = item.status?.toUpperCase() || '';
        const filterVal = statusFilter.toUpperCase();
        if (filterVal === 'CLOSE' || filterVal === 'CLOSED') {
          if (itemStatus !== 'CLOSE' && itemStatus !== 'CLOSED') return false;
        } else if (itemStatus !== filterVal) {
          return false;
        }
      }

      // Date Filter
      const itemDate = item.dateTime?.split('T')[0] || item.dateTime?.split(' ')[0];
      if (itemDate) {
        if (ledgerStartDate && itemDate < ledgerStartDate) return false;
        if (ledgerEndDate && itemDate > ledgerEndDate) return false;
      }
      return true;
    });
  };

  const transactionData = getTransactionData();
  const filteredData = filterData(transactionData);

  // Calculate statistics
  const stats = calculateStats(transactionData);

  // Format currency with Indian comma system and hide .00
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';

    const formatted = Number(amount).toFixed(2);

    if (formatted.endsWith('.00')) {
      return `₹${Math.round(amount).toLocaleString('en-IN')}`;
    }

    // Split into integer and decimal parts and format integer with Indian commas
    const parts = formatted.split('.');
    const integerPart = Number(parts[0]).toLocaleString('en-IN');
    const decimalPart = parts[1];
    return `₹${integerPart}.${decimalPart}`;
  };

  // Helper function to format numbers
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-IN').format(num);
  };

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
              Transaction Ledger
            </h1>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={itemVariants}
          className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            title="Active Trades"
            value={formatNumber(stats.activeTrades)}
            icon={Activity}
            iconColor="text-blue-500"
          />
          <StatCard
            title="Active Trade Amount"
            value={formatCurrency(stats.activeTradeAmount)}
            icon={TrendingUp}
            iconColor="text-orange-500"
          />
          <StatCard
            title="Today's P&L"
            value={formatCurrency(stats.todaysPnL)}
            icon={DollarSign}
            iconColor={stats.todaysPnL >= 0 ? 'text-green-500' : 'text-red-500'}
          />
          <StatCard
            title="Today's Commission"
            value={formatCurrency(stats.todaysCommission)}
            icon={Wallet}
            iconColor="text-purple-500"
          />
        </motion.div>

        {/* Transaction Table */}
        <motion.div
          variants={itemVariants}
          className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
        >
          <div className="p-4">
            <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Ledger Records
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded border border-stroke bg-transparent px-3 py-1 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-black dark:text-white">
                    From:
                  </label>
                  <input
                    type="date"
                    value={ledgerStartDate}
                    onChange={(e) => setLedgerStartDate(e.target.value)}
                    className="rounded border border-stroke bg-transparent px-3 py-1 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-black dark:text-white">
                    To:
                  </label>
                  <input
                    type="date"
                    value={ledgerEndDate}
                    onChange={(e) => setLedgerEndDate(e.target.value)}
                    className="rounded border border-stroke bg-transparent px-3 py-1 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
                {(ledgerStartDate || ledgerEndDate || statusFilter) && (
                  <button
                    onClick={() => {
                      setLedgerStartDate('');
                      setLedgerEndDate('');
                      setStatusFilter('');
                    }}
                    className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded px-3 py-1.5 text-sm font-medium transition-colors dark:bg-meta-4 dark:text-white dark:hover:bg-meta-3"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => refetch()}
                  className="flex items-center gap-2 rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                >
                  <RefreshCcw size={20} />
                  Refresh
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <GenericTable
                data={filteredData}
                columns={allColumns}
                paginationOff={false}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TransactionLedger;