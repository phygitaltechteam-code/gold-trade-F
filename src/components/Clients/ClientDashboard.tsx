import React, {useEffect, useState} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {useAuthContext} from '@/context/AuthContext';
import {
  Search,
  Download,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  Clock,
  Filter,
  Loader2,
  RefreshCw,
  EyeOff,
  Eye,
} from 'lucide-react';
import {Client, ClientStatus} from './types';
import {motion} from 'framer-motion';
import {useGetAllClients} from './mutationapi';
import {useActivateCustomer, useGetClients} from '@/lib/react-query/client';
import {useGetAllSuperBrocker} from '@/lib/react-query/superbrocker';
import GenericTable from '@/components/Forms/Table/GenericTable';

interface ClientDashboardProps {
  onSelectClient?: (client: Client) => void;
}

const StatCard = ({
  title,
  value,
  subtext,
  trend,
  icon: Icon,
  isLoading,
}: any) => (
  <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-start justify-between">
      <div className="text-sm font-medium uppercase tracking-wider text-slate-500">
        {title}
      </div>
      <div className="rounded-lg bg-slate-50 p-2">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
    </div>
    <div className="mb-2 text-3xl font-semibold text-slate-900">
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
      ) : (
        value
      )}
    </div>
    <div className="flex items-center gap-2">
      {trend && !isLoading && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            trend > 0
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-rose-50 text-rose-600'
          }`}
        >
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
      <span className="text-xs font-medium text-slate-400">{subtext}</span>
    </div>
  </div>
);

export const ClientDashboard: React.FC<ClientDashboardProps> = () => {
  const navigate = useNavigate();
  const {user} = useAuthContext();
  const isBroker = user?.role === 'BROKER';
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kycFilter, setKycFilter] = useState<string>('all');
  const [brokerFilter, setBrokerFilter] = useState<string>('all');
  const [superBrokerFilter, setSuperBrokerFilter] = useState<string>('all');
  const {mutateAsync: statusChange, isPending} = useActivateCustomer();
  const {data: allSuperBrocker} = useGetAllSuperBrocker();
  const {data: clients = [], refetch, isLoading} = useGetClients();

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

  const filteredClients = clients.filter((client: Client) => {
    const matchesSearch =
      client.user?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.user?.phoneNumber?.includes(searchTerm);

    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'active')
        matchesStatus = client.user?.isActive && client.user?.isVerified;
      else if (statusFilter === 'suspended')
        matchesStatus = client.user?.isRejected;
      else if (statusFilter === 'pending')
        matchesStatus = !client.isKycCompleted && !client.user?.isRejected;
    }

    let matchesKyc = true;
    if (kycFilter !== 'all') {
      matchesKyc = client.isKycCompleted === (kycFilter === 'completed');
    }

    const matchesBroker =
      brokerFilter === 'all' || client?.broker?.user?.fullname === brokerFilter;
    const matchesSuperBroker =
      superBrokerFilter === 'all' ||
      client?.broker?.superBroker?.user?.fullname === superBrokerFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesKyc &&
      matchesBroker &&
      matchesSuperBroker
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
    navigate({to: '/companybroker/clientdetail/$id', params: {id: client.id}});
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount}`;
  };

  // Get the selected client for PIN modal
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const columns = [
    {
      header: 'Client Name',
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
        const amount = parseFloat(row.wallets?.amount) || 0;
        return (
          <span className="whitespace-nowrap text-sm font-bold text-slate-900">
            ${amount.toLocaleString()}
          </span>
        );
      },
    },
    {
      header: 'Asset Under Control',
      accessor: 'wallets.blockedAmount',
      render: (row: Client) => {
        const amount = parseFloat(row.wallets?.blockedAmount) || 0;
        return (
          <span className="whitespace-nowrap text-sm font-bold text-slate-900">
            ${amount.toLocaleString()}
          </span>
        );
      },
    },
    {
      header: 'Margin Amount',
      accessor: 'marginAmount',
      render: (row: Client) => (
        <span className="whitespace-nowrap text-sm font-bold text-slate-900">
          $0.00
        </span>
      ),
    },
    {
      header: 'Total Active Trade',
      accessor: 'totalActiveTrade',
      render: (row: Client) => (
        <span className="whitespace-nowrap text-sm font-medium text-slate-600">
          {row._count?.trades || 0}
        </span>
      ),
    },
    {
      header: 'Total Trade',
      accessor: 'totalTrade',
      render: (row: Client) => {
        const amount = parseFloat(row.wallets?.amount) || 0;
        return (
          <span className="whitespace-nowrap text-sm font-bold text-orange-500">
            ${amount.toLocaleString()}
          </span>
        );
      },
    },
    {
      header: 'P&L',
      accessor: 'pnl',
      render: (row: Client) => {
       
        const pnl = 0; 
        const isProfit = pnl >= 0;
        return (
          <span
            className={`whitespace-nowrap text-sm font-bold ${
              isProfit ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isProfit ? '+' : ''}
            {pnl >= 0 ? `$${pnl.toLocaleString()}` : `-$${Math.abs(pnl).toLocaleString()}`}
          </span>
        );
      },
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
              <span className="ml-2 w-12 text-left text-[10px] font-bold uppercase text-slate-500">
                {isActive ? 'Active' : 'Inactive'}
              </span>
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
      className="max-w-9xl mx-auto px-6 py-8"
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          Client Management
        </h1>
        {isBroker && (
          <div className="flex gap-3">
            <button
              onClick={() => navigate({to: '/broker/addcustomer'})}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:from-orange-600 hover:to-red-600"
            >
              <Plus className="h-4 w-4" />
              Add Customer
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Active Traders"
          value={activeTraders.toLocaleString()}
          subtext={`${clients.length} total clients`}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          title="Pending KYC"
          value={pendingKyc.toString()}
          subtext="Requires attention"
          icon={Clock}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Assets (AUM)"
          value={formatCurrency(totalAUM)}
          subtext="Wallet balance"
          trend={5.3}
          icon={TrendingUp}
          isLoading={isLoading}
        />
      </div>

      {/* Filters & Search */}
      <div className="mb-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Name, Email or Phone..."
            className="w-full rounded-xl border border-slate-100 bg-slate-50 py-3 pl-12 pr-4 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Account Status
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending Review</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              KYC Verification
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Joined Date
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Broker
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
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

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Super Broker
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
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
