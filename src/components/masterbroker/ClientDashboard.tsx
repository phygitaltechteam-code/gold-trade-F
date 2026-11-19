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
} from 'lucide-react';
import { Client } from './types';
import { motion } from 'framer-motion';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {
  useActivateCustomer,
  useGetMasterBrokerLimit,
  useGetMasterClients,
} from '@/lib/api/masterpanelapi/masterapi';

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
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
            trend > 0
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
  const { data: responseData, refetch, isLoading } = useGetMasterClients();
  const [customerFilter, setCustomerFilter] = useState('all');

  const { data: limit } = useGetMasterBrokerLimit();

  // Extract clients array from response - handle different response structures
  const clients = React.useMemo(() => {
    if (!responseData) return [];
    // If responseData is already an array
    if (Array.isArray(responseData)) return responseData;
    // If responseData has a data property that is an array
    if (responseData.data && Array.isArray(responseData.data)) return responseData.data;
    // If responseData has a data property with a data property (nested)
    if (responseData.data?.data && Array.isArray(responseData.data.data)) return responseData.data.data;
    // If responseData has a customers property
    if (responseData.customers && Array.isArray(responseData.customers)) return responseData.customers;
    // If responseData has a users property
    if (responseData.users && Array.isArray(responseData.users)) return responseData.users;
    // If responseData has a clients property
    if (responseData.clients && Array.isArray(responseData.clients)) return responseData.clients;
    return [];
  }, [responseData]);

  // Extract unique broker names for filter
  const brokers = Array.from(
    new Set(clients?.map((c: any) => c?.broker?.user?.fullname).filter(Boolean)),
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
    (sum: number, c: Client) => sum + (parseFloat(c.wallets?.amount) || 0),
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
    (sum: number, c: Client) => sum + (Number(c.assetUnderControl) || 0),
    0,
  );

  const totalMarginAmount = clients.reduce(
    (sum: number, c: Client) => sum + (Number(c.marginAmount) || 0),
    0,
  );

  const totalTrades = clients.reduce(
    (sum: number, c: Client) => sum + (Number(c.totalTrade) || 0),
    0,
  );

  const lastWalletBalance =
    clients.length > 0
      ? parseFloat(clients[clients.length - 1]?.wallets?.amount) || 0
      : 0;

  const filteredClients = clients.filter((client: Client) => {
    const matchesSearch =
      client.user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.user?.phoneNumber?.includes(searchTerm) ||
      client.CRN?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBroker =
      brokerFilter === 'all' || client?.broker?.user?.fullname === brokerFilter;

    const matchesSuperBroker =
      superBrokerFilter === 'all' ||
      client?.broker?.superBroker?.user?.fullname === superBrokerFilter;

    const matchesCustomer =
      customerFilter === 'all'
        ? true
        : customerFilter === 'active'
          ? client.user?.isActive && !client.isDemo
          : customerFilter === 'inactive'
            ? !client.user?.isActive && !client.isDemo
            : customerFilter === 'demo'
              ? client.isDemo
              : true;

    return (
      matchesSearch && matchesBroker && matchesSuperBroker && matchesCustomer
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
    navigate({ to: '/masterbroker/client-details/$id', params: { id: client.id } });
  };

  // Format number with Indian comma system
  const formatNumber = (num: number) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Format currency with Indian comma system and hide .00
  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return '₹0';

    // Check if the amount has decimal places
    const formatted = amount.toFixed(2);
    // If it ends with .00, return without decimal places
    if (formatted.endsWith('.00')) {
      return `₹${Math.round(amount).toLocaleString('en-IN')}`;
    }
    // Otherwise show with 2 decimal places with Indian comma system
    // Split into integer and decimal parts
    const parts = formatted.split('.');
    const integerPart = Number(parts[0]).toLocaleString('en-IN');
    const decimalPart = parts[1];
    return `₹${integerPart}.${decimalPart}`;
  };
  // Format currency for table (with 2 decimal places, hide .00)
  const formatTableCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return '₹0';
    const formatted = amount.toFixed(2);
    if (formatted.endsWith('.00')) {
      return `₹${Math.round(amount).toLocaleString('en-IN')}`;
    }
    return `₹${formatted}`;
  };

  // Get the selected client for PIN modal
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Columns with proper formatting
  const columns = [
    {
      header: 'Trader Name',
      accessor: 'user.fullname',
      render: (row: Client) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="whitespace-nowrap text-sm text-gray-900">
              {row.user?.fullname}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Wallet Balance',
      accessor: 'wallets.amount',
      render: (row: Client) => {
        const amount = parseFloat(row.wallets?.amount) || 0;
        return (
          <span className="whitespace-nowrap text-sm  text-gray-900">
            {formatTableCurrency(amount)}
          </span>
        );
      },
    },
    {
      header: 'Asset Under Control',
      accessor: 'assetUnderControl',
      render: (row: Client) => (
        <span className="whitespace-nowrap text-sm   text-gray-900">
          {formatTableCurrency(row.assetUnderControl || 0)}
        </span>
      ),
    },
    {
      header: 'Margin Amount',
      accessor: 'marginAmount',
      render: (row: Client) => (
        <span className="whitespace-nowrap text-sm text-gray-900">
          {formatTableCurrency(row.marginAmount || 0)}
        </span>
      ),
    },
    {
      header: 'Total Active Trade',
      accessor: 'totalActiveTrade',
      render: (row: Client) => (
        <span className="whitespace-nowrap text-sm text-gray-900">
          {row.totalActiveTrade || 0}
        </span>
      ),
    },
    {
      header: 'Total Trade',
      accessor: 'totalTrade',
      render: (row: Client) => (
        <span className="whitespace-nowrap text-sm text-gray-900">
          {formatTableCurrency(row.totalTrade || 0)}
        </span>
      ),
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-9xl mx-auto px-4 py-6 md:px-6 md:py-8"
    >
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 md:mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
          Trader Management
        </h1>

        <button
          onClick={() => {
            navigate({ to: '/masterbroker/add-client' });
          }}
          disabled={totalClients >= limit}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md transition-all ${
            totalClients >= limit
              ? 'bg-gray-400 cursor-not-allowed opacity-70'
              : 'bg-gradient-to-r from-orange-500 to-red-500 hover:scale-[1.02] hover:from-orange-600 hover:to-red-600'
          }`}
        >
          <Plus className="h-4 w-4" />
          {totalClients >= limit ? 'Add TraderLimit Reached' : 'Add Trader'}
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
        <StatCard
          title="Wallet Balance"
          value={formatCurrency(totalAUM)}
          icon={Briefcase}
          isLoading={isLoading}
        />
        <StatCard
          title="Assets Under Control"
          value={formatCurrency(assetUnderControll)}
          icon={Briefcase}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Margin Amount"
          value={formatCurrency(totalMarginAmount)}
          icon={Wallet}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Trades"
          value={formatNumber(totalTrades)}
          icon={DollarSign}
          isLoading={isLoading}
        />
      </div>

      {/* Optimized Filters */}
      <div className="mb-6 rounded-2xl border border-black/5 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name, Email, Phone or CRN..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 md:py-3 md:pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-56">
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 md:py-3"
            >
              <option value="all">All Trader</option>
              <option value="active">Active Trader</option>
              <option value="inactive">Inactive Trader</option>
              <option value="demo">Demo Trader</option>
            </select>
          </div>
        </div>
      </div>

      {/* Client Table */}
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
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                  selectedClient?.user?.isActive
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