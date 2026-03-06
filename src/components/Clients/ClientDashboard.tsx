import React, {useState} from 'react';
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
} from 'lucide-react';
import {Client, ClientStatus} from './types';
import {motion} from 'framer-motion';
import {useGetAllClients} from './mutationapi';

interface ClientDashboardProps {
  onSelectClient: (client: Client) => void;
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
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}
        >
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
      <span className="text-xs font-medium text-slate-400">{subtext}</span>
    </div>
  </div>
);

const StatusBadge = ({client}: {client: Client}) => {
  const isActive = client.user?.isActive;
  const isVerified = client.user?.isVerified;
  const isRejected = client.user?.isRejected;

  let status: ClientStatus = 'Pending Review';
  let styles = 'bg-amber-50 text-amber-600 border-amber-100';

  if (isActive && isVerified) {
    status = 'Active';
    styles = 'bg-emerald-50 text-emerald-600 border-emerald-100';
  } else if (isRejected) {
    status = 'Suspended';
    styles = 'bg-rose-50 text-rose-600 border-rose-100';
  }

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${styles}`}
    >
      {status}
    </span>
  );
};

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  onSelectClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kycFilter, setKycFilter] = useState<string>('all');

  const {data: clients = [], isLoading, error, refetch} = useGetAllClients();

  // Calculate stats
  const activeTraders = clients.filter(
    (c: Client) => c.user?.isActive && c.user?.isVerified,
  ).length;
  const pendingKyc = clients.filter(
    (c: Client) => !c.isKycCompleted && !c.user?.isRejected,
  ).length;
  const totalAUM = clients.reduce(
    (sum: number, c: Client) => sum + (c.wallets?.amount || 0),
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

    return matchesSearch && matchesStatus && matchesKyc;
  });

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount}`;
  };

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8 text-center">
        <p className="mb-4 text-red-500">Error loading clients</p>
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-orange-500 px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      className="mx-auto max-w-7xl px-6 py-8"
    >
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">
          Client Management
        </h1>
        {/* <div className="flex gap-3">
          <button 
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200">
            <Plus className="w-4 h-4" />
            Add New Client
          </button>
        </div> */}
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              Wallet Balance
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Min"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <input
                type="text"
                placeholder="Max"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-2xl border border-black/5 bg-white p-12 text-center shadow-sm">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-orange-500" />
          <p className="text-slate-500">Loading clients...</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && (
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-bottom border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Name
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Wallet Balance
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    KYC
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Joined
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredClients.map((client: Client) => (
                  <tr
                    key={client.id}
                    className="group cursor-pointer transition-colors hover:bg-slate-50/80"
                    onClick={() => onSelectClient(client)}
                  >
                    <td
                      className="px-6 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {client.photo ? (
                          <img
                            src={client.photo}
                            alt={client.user?.fullname}
                            className="h-8 w-8 rounded-full border border-slate-100 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 font-medium text-slate-600">
                            {client.user?.fullname?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {client.user?.fullname}
                          </div>
                          <div className="text-xs text-slate-400">
                            {client.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-medium text-slate-600">
                        ${client.wallets?.amount?.toLocaleString() || '0'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge client={client} />
                    </td>
                    <td className="px-6 py-4">
                      {client.isKycCompleted ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
                          Completed
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-600">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredClients.length === 0 && (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p className="text-slate-500">No clients found</p>
            </div>
          )}

          {/* Pagination */}
          {filteredClients.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-6 py-4">
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-500">
                  Showing <span className="font-medium text-slate-900">1</span>{' '}
                  to{' '}
                  <span className="font-medium text-slate-900">
                    {filteredClients.length}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-slate-900">
                    {clients.length}
                  </span>{' '}
                  results
                </span>
                <select className="rounded border border-slate-200 bg-white px-2 py-1 text-[10px] focus:outline-none">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button className="rounded border border-transparent p-1.5 text-slate-400 transition-all hover:border-slate-200 hover:bg-white hover:text-slate-600">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="rounded border border-orange-500 bg-orange-500 px-3 py-1 text-xs font-medium text-white">
                  1
                </button>
                <button className="rounded border border-transparent px-3 py-1 text-xs font-medium text-slate-600 transition-all hover:border-slate-200 hover:bg-white">
                  2
                </button>
                <button className="rounded border border-transparent px-3 py-1 text-xs font-medium text-slate-600 transition-all hover:border-slate-200 hover:bg-white">
                  3
                </button>
                <span className="px-2 text-slate-400">...</span>
                <button className="rounded border border-transparent px-3 py-1 text-xs font-medium text-slate-600 transition-all hover:border-slate-200 hover:bg-white">
                  10
                </button>
                <button className="rounded border border-transparent p-1.5 text-slate-400 transition-all hover:border-slate-200 hover:bg-white hover:text-slate-600">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
