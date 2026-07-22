import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthContext } from '@/context/AuthContext';
import {
  Search,
  Plus,
  TrendingUp,
  Users,
  Loader2,
  EyeOff,
  Eye,
  Wallet,
  Briefcase,
  Activity,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { Client } from './types';
import { motion } from 'framer-motion';
import { useActivateCustomer, useGetClients } from '@/lib/react-query/client';
import { useGetAllSuperBrocker } from '@/lib/react-query/superbrocker';
import GenericTable from '@/components/Forms/Table/GenericTable';
import { formatIndianNumber, formatIndianCurrency } from '@/utils/formatIndianNumber';

interface ClientDashboardProps {
  onSelectClient?: (client: Client) => void;
}

const StatCard = ({ title, value, trend, icon: Icon, isLoading }: any) => (
  <div className="group relative overflow-hidden rounded-lg border border-stroke bg-white p-4 shadow-sm transition-all hover:shadow-md md:p-5">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
          {title}
        </p>

        <h4 className="mt-2 text-xl font-semibold text-black dark:text-white md:text-2xl">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-300 md:h-6 md:w-6" />
          ) : (
            value
          )}
        </h4>
      </div>

      <div className="rounded-lg bg-slate-50 p-2">
        {Icon && <Icon className="h-5 w-5 text-slate-400 md:h-6 md:w-6" />}
      </div>
    </div>

    {trend && !isLoading && (
      <div className="mt-2 flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${trend > 0
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-rose-50 text-rose-600'
            }`}
        >
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      </div>
    )}
  </div>
);

export const ClientDashboard: React.FC<ClientDashboardProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const isBroker = user?.role === 'BROKER';
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [brokerFilter, setBrokerFilter] = useState<string>('all');
  const [superBrokerFilter, setSuperBrokerFilter] = useState<string>('all');
  const { mutateAsync: statusChange, isPending } = useActivateCustomer();
  const { data: allSuperBrocker } = useGetAllSuperBrocker();
  const { data: clients = [], refetch, isLoading, isFetching } = useGetClients();
  const [customerFilter, setCustomerFilter] = useState("all");

  // Extract unique broker names for filter
  const brokers = Array.from(
    new Set(clients.map((c: any) => c?.broker?.user?.fullname).filter(Boolean)),
  );

  // Extract unique super broker names for filter
  const superBrokers = Array.from(
    new Set(
      clients
        .map((c: any) => c?.broker?.superBroker?.user?.fullname)
        .filter(Boolean),
    ),
  );

  // Calculate stats
  const totalClients = clients.length;
  const activeTraders = clients.filter(
    (c: Client) => c.user?.isActive && c.user?.isVerified,
  ).length;
  const pendingKyc = clients.filter(
    (c: Client) => !c.isKycCompleted && !c.user?.isRejected,
  ).length;
  const totalAUM = clients.reduce(
    (sum: number, c: Client) => {
      const balance = c.walletBalance !== undefined
        ? Number(c.walletBalance)
        : (typeof c.wallets?.amount === 'number'
          ? c.wallets.amount
          : parseFloat(c.wallets?.amount as string) || 0);
      return sum + balance;
    },
    0,
  );

  const totalDemoTraders = clients.filter(
    (c: Client) => c?.isDemo === true
  ).length;

  const totalWalletBalance = clients.reduce(
    (sum: number, c: Client) => sum + (Number(c.walletBalance) || 0),
    0,
  );

  const assetUnderControll = clients.reduce(
    (sum: number, c: Client) => sum + (Number(c.assetUnderControll) || 0),
    0,
  )

  const totalMarginAmount = clients.reduce(
    (sum: number, c: Client) => sum + (Number(c.marginAmount) || 0),
    0,
  )

  const totalTrades = clients.reduce(
    (sum: number, c: Client) => sum + (Number(c.totalTrade) || 0),
    0,
  )

  // Total active trades count
  const totalActiveTrades = clients.reduce(
    (sum: number, c: Client) => sum + (c.totalActiveTrade || c._count?.trades || 0),
    0,
  );

  // Total business generated
  const totalBusiness = clients.reduce(
    (sum: number, c: Client) => sum + (Number(c.totalTrade) || 0),
    0,
  );

  // Last wallet balance (latest client's wallet)
  const lastWalletBalance =
    clients.length > 0
      ? (clients[clients.length - 1]?.walletBalance !== undefined
        ? Number(clients[clients.length - 1]?.walletBalance)
        : (typeof clients[clients.length - 1]?.wallets?.amount === 'number'
          ? (clients[clients.length - 1]?.wallets?.amount as number)
          : parseFloat(clients[clients.length - 1]?.wallets?.amount as string) || 0))
      : 0;

  const filteredClients = clients.filter((client: Client) => {
    const matchesSearch =
      client.user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.user?.phoneNumber?.includes(searchTerm) ||
      client.CRN?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBroker =
      brokerFilter === "all" ||
      client?.broker?.user?.fullname === brokerFilter;

    const matchesSuperBroker =
      superBrokerFilter === "all" ||
      client?.broker?.superBroker?.user?.fullname === superBrokerFilter;

const matchesCustomer =
  customerFilter === "all"
    ? true
    : customerFilter === "active"
      ? client.user?.isActive === true && client.isDemo !== true  // Exclude demo
      : customerFilter === "inactive"
        ? client.user?.isActive === false && client.isDemo !== true  // Exclude demo
        : customerFilter === "demo"
          ? client.isDemo === true
          : true;

    return (
      matchesSearch &&
      matchesBroker &&
      matchesSuperBroker &&
      matchesCustomer
    );
  });

  const handleToggleClick = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClientId(client.id);
    setShowPinModal(true);
    setPin('');
    setShowPin(false);
  };

  const handleConfirm = async () => {
    if (!pin) {
      alert('Please enter PIN');
      return;
    }

    if (pin.length < 4) {
      alert('PIN must be at least 4 digits');
      return;
    }

    try {
      await statusChange({
        id: selectedClientId!,
        pin: pin,
      });
      await refetch();
      setShowPinModal(false);
      setPin('');
      setShowPin(false);
      setSelectedClientId(null);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRowClick = (client: Client) => {
    navigate({ to: '/companybroker/clientdetail/$id', params: { id: client.id } });
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  // Get the selected client for PIN modal
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Updated columns with proper formatting
  const columns = [
    {
      header: 'Trader Name',
      accessor: 'user.fullname',
      render: (row: Client) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="whitespace-nowrap text-sm font-medium text-slate-900">
              {row.user?.fullname}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Broker Name',
      accessor: 'broker.user.fullname',
      render: (row: Client) => (
        <span className="whitespace-nowrap text-sm font-medium text-slate-600">
          {row?.broker?.user?.fullname || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Super Broker Name',
      accessor: 'broker.superBroker.user.fullname',
      render: (row: Client) => (
        <span className="whitespace-nowrap text-sm font-medium text-slate-600">
          {row?.broker?.superBroker?.user?.fullname || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Wallet Balance',
      accessor: 'wallets.amount',
      render: (row: Client) => {
        const amount = row.walletBalance !== undefined
          ? Number(row.walletBalance)
          : (typeof row.wallets?.amount === 'number'
            ? row.wallets.amount
            : parseFloat(row.wallets?.amount as string) || 0);
        return (
          <span className="whitespace-nowrap text-sm text-gray-900 font-medium">
            {formatIndianCurrency(amount)}
          </span>
        );
      },
    },
    {
      header: 'Asset Under Control',
      accessor: 'wallets.blockedAmount',
      render: (row: Client) => {
        const amount = row.assetUnderControl !== undefined
          ? Number(row.assetUnderControl)
          : (typeof row.wallets?.blockedAmount === 'number'
            ? row.wallets.blockedAmount
            : parseFloat(row.wallets?.blockedAmount as string) || 0);
        return (
          <span className="whitespace-nowrap text-sm text-gray-900 font-medium">
            {formatIndianCurrency(amount)}
          </span>
        );
      },
    },
    {
      header: 'Margin Amount',
      accessor: 'marginAmount',
      render: (row: Client) => {
        const amount = row.marginAmount !== undefined ? Number(row.marginAmount) : 0;
        return (
          <span className="whitespace-nowrap text-sm text-gray-900 font-medium">
            {formatIndianCurrency(amount)}
          </span>
        );
      },
    },
    {
      header: 'Total Active Trade',
      accessor: 'totalActiveTrade',
      render: (row: Client) => (
        <span className="whitespace-nowrap text-sm font-medium text-slate-600">
          {row.totalActiveTrade !== undefined ? row.totalActiveTrade : (row._count?.trades || 0)}
        </span>
      ),
    },
    {
      header: 'Total Trade',
      accessor: 'totalTrade',
      render: (row: Client) => {
        const amount = row.totalTrade !== undefined ? Number(row.totalTrade) : (parseFloat(row.wallets?.amount as string) || 0);
        return (
          <span className="whitespace-nowrap text-sm text-gray-900 font-medium">
            {formatIndianCurrency(amount)}
          </span>
        );
      },
    },
    {
      header: 'Demo Account',
      accessor: 'isDemo',
      render: (row: Client) => (
        <div className="pointer-events-none">
          <input
            type="checkbox"
            checked={!!row.isDemo}
            readOnly
            disabled
            className="h-4 w-4 accent-orange-500"
          />
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'user.isActive',
      render: (row: Client) => {
        const isActive = row.user?.isActive === true;
        return (
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={isActive}
                onChange={(e) => handleToggleClick(row, e)}
                disabled={isPending}
              />
              <div className="relative h-5 w-9 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-4 peer-disabled:opacity-50" />
            </label>
          </div>
        );
      },
    },
  ];

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      className="max-w-9xl mx-auto px-4 py-6 md:px-6 md:py-8 bg-[#f8fafc]"
    >
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 md:mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
          Trader Management
        </h1>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate({ to: '/companybroker/companyaddcustomer' })}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:from-orange-600 hover:to-red-600"
          >
            <Plus className="h-4 w-4" />
            Add Trader
          </button>
        </div>
      </div>

      {/* Stats Cards Grid - Updated with proper formatting */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
        <StatCard
          title="Wallet Balance"
          value={formatIndianCurrency(totalWalletBalance)}
          icon={Briefcase}
          isLoading={isLoading}
        />
        <StatCard
          title="Assets Under Control"
          value={formatIndianCurrency(assetUnderControll)}
          icon={Briefcase}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Margin Amount"
          value={formatIndianCurrency(totalMarginAmount)}
          icon={Wallet}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Trades"
          value={formatIndianNumber(totalTrades)}
          icon={DollarSign}
          isLoading={isLoading}
        />
      </div>

      {/* Optimized Filters - Search + 2 Dropdowns in one line */}
      <div className="mb-6 rounded-2xl border border-black/5 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Name, Email, Phone or CRN..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 md:py-3 md:pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Broker Filter */}
          <div className="w-full md:w-64">
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 md:py-3"
              value={brokerFilter}
              onChange={(e) => setBrokerFilter(e.target.value)}
            >
              <option value="all">All Brokers</option>
              {brokers.map((broker: any) => (
                <option key={broker} value={broker}>
                  {broker}
                </option>
              ))}
            </select>
          </div>

          {/* Super Broker Filter */}
          <div className="w-full md:w-64">
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 md:py-3"
              value={superBrokerFilter}
              onChange={(e) => setSuperBrokerFilter(e.target.value)}
            >
              <option value="all">All Super Brokers</option>
              {superBrokers.map((sb: any) => (
                <option key={sb} value={sb}>
                  {sb}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-56">
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 md:py-3"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
            >
              <option value="all">All Customers({totalClients})</option>
              <option value="active">Active Customers({activeTraders})</option>
              <option value="inactive">Inactive Customers({pendingKyc})</option>
              <option value="demo">Demo Customers({totalDemoTraders})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Client Table - Updated columns with proper formatting */}
      <GenericTable
        columns={columns}
        data={filteredClients}
        onRowClick={handleRowClick}
        clickable={true}
        rowsPerPage={10}
      />

      {/* PIN Modal */}
      {showPinModal && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              {selectedClient?.user?.isActive ? 'Deactivate' : 'Activate'}{' '}
              Client
            </h2>
            <p className="mb-4 text-sm text-slate-600">
              {selectedClient?.user?.isActive
                ? `Are you sure you want to deactivate ${selectedClient?.user?.fullname}?`
                : `Are you sure you want to activate ${selectedClient?.user?.fullname}?`}
            </p>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Enter Security PIN to confirm:
            </p>

            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                placeholder="Enter Security PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="border-gray-300 w-full rounded-lg border px-4 py-2 pr-10 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirm();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPin('');
                  setSelectedClientId(null);
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${selectedClient?.user?.isActive
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                  } disabled:opacity-50`}
              >
                {isPending ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};