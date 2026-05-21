import React, {useState} from 'react';
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
  const navigate = useNavigate();
  const {user} = useAuthContext();
  const isBroker = user?.role === 'BROKER';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kycFilter, setKycFilter] = useState<string>('all');
  const [brokerFilter, setBrokerFilter] = useState<string>('all');
  const [superBrokerFilter, setSuperBrokerFilter] = useState<string>('all');

  // Temporarily bypass API call because backend is not ready
  // const {data: clients = [], isLoading, error, refetch} = useGetAllClients();
  const isLoading = false;
  const error = null;
  const refetch = () => {};

  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      user: {
        fullname: 'Alex Vane',
        email: 'alex.vane@example.com',
        phoneNumber: '+1234567890',
        isActive: true,
        isVerified: true,
        isRejected: false,
      },
      address: '123 Main St',
      area: 'Kolkata',
      commission: '10%',
      aadharCardNumber: '1234567890',
      wallets: {amount: 45230.0},
      isKycCompleted: true,
      createdAt: new Date().toISOString(),
      photo: '',
      brokerName: 'Apex Broker',
      superBrokerName: 'Alpha Super',
    },
    {
      id: '2',
      user: {
        fullname: 'Jessica Stone',
        email: 'jessica.s@example.com',
        phoneNumber: '+1987654321',
        isActive: true,
        isVerified: true,
        isRejected: false,
      },
      wallets: {amount: 12050.0},
      isKycCompleted: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      photo: '',
      brokerName: 'Delta Broker',
      superBrokerName: 'Alpha Super',
    },
    {
      id: '3',
      user: {
        fullname: 'Michael Chen',
        email: 'm.chen@example.com',
        phoneNumber: '+1122334455',
        isActive: false,
        isVerified: false,
        isRejected: true,
      },
      wallets: {amount: 128900.5},
      isKycCompleted: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      photo: '',
      brokerName: 'Apex Broker',
      superBrokerName: 'Beta Super',
    },
    {
      id: '4',
      user: {
        fullname: 'Emma Larson',
        email: 'emma.l@example.com',
        phoneNumber: '+1555666777',
        isActive: false,
        isVerified: false,
        isRejected: false,
      },
      wallets: {amount: 0.0},
      isKycCompleted: false,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      photo: '',
      brokerName: 'Zeta Broker',
      superBrokerName: 'Beta Super',
    },
    {
      id: '5',
      user: {
        fullname: 'David Ross',
        email: 'd.ross@example.com',
        phoneNumber: '+1444333222',
        isActive: true,
        isVerified: true,
        isRejected: false,
      },
      wallets: {amount: 2500.0},
      isKycCompleted: true,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      photo: '',
      brokerName: 'Delta Broker',
      superBrokerName: 'Alpha Super',
    },
  ]);

  // Extract unique Brokers and Super Brokers from data dynamically
  const brokers = Array.from(
    new Set(clients.map((c: any) => c.brokerName).filter(Boolean)),
  );
  const superBrokers = Array.from(
    new Set(clients.map((c: any) => c.superBrokerName).filter(Boolean)),
  );

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

    const matchesBroker =
      brokerFilter === 'all' || client.brokerName === brokerFilter;
    const matchesSuperBroker =
      superBrokerFilter === 'all' ||
      client.superBrokerName === superBrokerFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesKyc &&
      matchesBroker &&
      matchesSuperBroker
    );
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
                  <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Sr
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Client Name
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Broker Name
                  </th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Super Broker Name
                  </th>
                  <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Wallet Balance
                  </th>
                  <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Asset Under Control
                  </th>
                  <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Margin Amount
                  </th>
                  <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total Active Trade
                  </th>
                  <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total Traid
                  </th>
                  <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredClients.map((client: Client, index: number) => (
                  <tr
                    key={client.id}
                    className="group cursor-pointer transition-colors hover:bg-slate-50/80"
                    onClick={() => onSelectClient(client)}
                  >
                    <td className="px-4 py-4 text-sm font-medium text-slate-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4">
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
                          <div className="whitespace-nowrap text-sm font-medium text-slate-900">
                            {client.user?.fullname}
                          </div>
                          <div className="text-xs text-slate-400">
                            {client.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-600">
                      {client.brokerName || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-600">
                      {client.superBrokerName || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="whitespace-nowrap text-sm font-bold text-slate-900">
                        ${client.wallets?.amount?.toLocaleString() || '0'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="whitespace-nowrap text-sm font-bold text-slate-900">
                        $0.00
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="whitespace-nowrap text-sm font-bold text-slate-900">
                        $0.00
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-slate-600">
                        0
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="whitespace-nowrap text-sm font-bold text-orange-500">
                        ${client.wallets?.amount?.toLocaleString() || '0'}
                      </span>
                    </td>
                    <td
                      className="px-4 py-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={client.user?.isActive || false}
                          onChange={() => {
                            setClients((prev) =>
                              prev.map((c) =>
                                c.id === client.id
                                  ? {
                                      ...c,
                                      user: {
                                        ...c.user,
                                        isActive: !c.user.isActive,
                                      },
                                    }
                                  : c,
                              ),
                            );
                          }}
                        />
                        <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div>
                        <span className="ml-2 w-12 text-left text-[10px] font-bold uppercase text-slate-500">
                          {client.user?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </td>
                    <td className="px-4 py-4 text-right">
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
