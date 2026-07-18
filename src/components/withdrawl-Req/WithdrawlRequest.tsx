import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Bell,
  Hourglass,
  CheckCircle2,
  TrendingDown,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Edit,
  Trash,
  RefreshCcw,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {
  useApproveWithdrawal,
  useGetWithdrawal,
  useRejectWithdrawal,
} from '@/lib/react-query/withdrawal';

// Simple Stat Card Component - Only title, value, and icon
const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-orange-500',
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor?: string;
}) => {
  // Map icon color to background color
  const getBgColor = () => {
    const colorMap: Record<string, string> = {
      'text-orange-500': 'bg-orange-50',
      'text-blue-500': 'bg-blue-50',
      'text-green-500': 'bg-green-50',
      'text-purple-500': 'bg-purple-50',
      'text-red-500': 'bg-red-50',
      'text-yellow-500': 'bg-yellow-50',
      'text-pink-500': 'bg-pink-50',
      'text-indigo-500': 'bg-indigo-50',
      'text-teal-500': 'bg-teal-50',
      'text-gray-500': 'bg-gray-50',
    };
    return colorMap[iconColor] || 'bg-gray-50';
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-stroke bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-orange-200 dark:border-strokedark dark:bg-boxdark md:p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
            {title}
          </p>
          <h4 className="mt-2 text-xl font-bold text-black dark:text-white md:text-2xl">
            {value}
          </h4>
        </div>
        <div className={`rounded-lg p-2 transition-colors group-hover:bg-orange-50 ${getBgColor()}`}>
          {Icon && <Icon className={`h-5 w-5 ${iconColor} md:h-6 md:w-6`} />}
        </div>
      </div>
    </div>
  );
};

// Types
interface WithdrawalRequest {
  id: string;
  requestId: string;
  date: string;
  time: string;
  client: {
    name: string;
    tier: string;
    avatar?: string;
    initials: string;
  };
  brokerName: string;
  brokerNumber: string;
  superBrokerName: string;
  superBrokerNumber: string;
  walletBalance: number;
  amount: number;
  withdrawType: string;
  detailAmount: number;
  paidAmount: number;
  paidDateTime: string;
  fee: number;
  bank: string;
  accountLast4: string;
  status: 'Pending' | 'Review' | 'On Hold' | 'Approved' | 'Rejected';
  isHighValue?: boolean;
}

// Status Badge Component
const StatusBadge = ({ status }: { status: WithdrawalRequest['status'] }) => {
  const styles = {
    Pending: 'bg-orange-50 text-orange-600 border-orange-100',
    Review: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    'On Hold': 'bg-blue-50 text-blue-600 border-blue-100',
    Approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Rejected: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <span
      className={`inline-block whitespace-nowrap rounded-md border px-2 py-1 text-[10px] font-bold uppercase ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export default function WithdrawalRequest() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Pending');
  const { data: withdrawal, refetch } = useGetWithdrawal();
  const { mutateAsync: approve } = useApproveWithdrawal();
  const { mutateAsync: reject } = useRejectWithdrawal();
  console.log('withdrawallll', withdrawal);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<string | null>(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const itemsPerPage = 5;

  // Date filter states - Default to show all data (empty dates)
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Only show actions when on Pending tab
  const showActions = activeTab === 'Pending';

  // Format currency in Indian format
  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format number
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Date filtering logic - If no dates selected, show all data
  const filterByDate = (dateString: string) => {
    if (!fromDate || !toDate) return true; // Show all if no dates selected

    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);

    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);

    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    return date >= from && date <= to;
  };

  // Format date and time - Date above, Time below
  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return 'N/A';

    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return 'N/A';

    const formattedDate = date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const formattedTime = date.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return { date: formattedDate, time: formattedTime };
  };

  const MOCK_DATA: WithdrawalRequest[] =
    withdrawal?.map((item: any, index: number) => ({
      id: item.id,
      requestId: `REQ${String(index + 1).padStart(3, '0')}`,
      date: item.createdAt || new Date().toISOString().split('T')[0],
      time: item.createdAt || new Date().toISOString(),

      client: {
        name: item.customer?.user?.fullname || item.customerName || 'N/A',
        avatar: item.customer?.photo || '',
        initials:
          item.customer?.user?.fullname
            ?.split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase() || 'NA',
      },

      brokerName: item.brokerName || '-',
      brokerNumber: item.brokerId || '-',

      superBrokerName: item.superBrokerName || '-',
      superBrokerNumber: item.superBrokerId || '-',

      walletBalance: item.walletBalance || 0,
      amount: item.amount || 0,

      withdrawType: 'Bank Transfer',

      detailAmount: item.amount || 0,
      paidAmount: 0,
      paidDateTime: '-',

      fee: 0,

      bank: item.customer?.bank_Name || '-',
      accountLast4: '----',

      status:
        item.status === 'PENDING'
          ? 'Pending'
          : item.status === 'APPROVED'
            ? 'Approved'
            : item.status === 'REJECTED'
              ? 'Rejected'
              : 'Review',

      isHighValue: item.amount > 100000,
      customer: item.customer,
    })) || [];

  // Get date-filtered data for cards and tab counts
  const dateFilteredData = useMemo(() => {
    return MOCK_DATA?.filter((req) => {
      return filterByDate(req.date);
    });
  }, [MOCK_DATA, fromDate, toDate]);

  // Filter data based on active tab, search, and date
  const filteredData = useMemo(() => {
    return dateFilteredData?.filter((req) => {
      const matchesTab = activeTab === req.status;
      const matchesSearch =
        searchTerm === '' ||
        req.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.amount.toString().includes(searchTerm) ||
        req.bank.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [dateFilteredData, activeTab, searchTerm]);

  // Calculate period stats (Today, Week, Month) - based on date filtered data
  const getPeriodStats = (period: 'today' | 'week' | 'month') => {
    const now = new Date();
    const periodData = dateFilteredData?.filter((req) => {
      const reqDate = new Date(req.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      switch (period) {
        case 'today':
          return reqDate >= today;
        case 'week':
          return reqDate >= weekStart;
        case 'month':
          return reqDate >= monthStart;
        default:
          return true;
      }
    });

    const totalAmount = periodData?.reduce((sum, r) => sum + r.amount, 0) || 0;
    const count = periodData?.length || 0;

    return { totalAmount, count };
  };

  // Calculate stats - based on date filtered data
  const stats = useMemo(() => {
    // Total withdrawal amount (from date filtered data)
    const totalWithdrawalAmount = dateFilteredData?.reduce((sum, r) => sum + r.amount, 0) || 0;
    const totalCount = dateFilteredData?.length || 0;

    // Get period stats from date filtered data
    const todayStats = getPeriodStats('today');
    const weekStats = getPeriodStats('week');
    const monthStats = getPeriodStats('month');

    return {
      totalWithdrawalAmount,
      totalCount,
      todayStats,
      weekStats,
      monthStats,
    };
  }, [dateFilteredData]);

  // Get counts for each status - based on date filtered data
  const statusCounts = useMemo(() => {
    return {
      Pending: dateFilteredData?.filter((r) => r.status === 'Pending').length || 0,
      Review: dateFilteredData?.filter((r) => r.status === 'Review').length || 0,
      'On Hold': dateFilteredData?.filter((r) => r.status === 'On Hold').length || 0,
      Approved: dateFilteredData?.filter((r) => r.status === 'Approved').length || 0,
      Rejected: dateFilteredData?.filter((r) => r.status === 'Rejected').length || 0,
    };
  }, [dateFilteredData]);

  // Base columns - without Actions for Approved and Rejected tabs
  const baseColumns = [
    {
      header: 'Date',
      accessor: (row: WithdrawalRequest) => {
        const formatted = formatDateTime(row.date);
        return (
          <div>
            <div className="text-gray-600 text-sm">{formatted?.date || 'N/A'}</div>
            <div className="text-gray-400 text-xs">{formatted?.time || ''}</div>
          </div>
        );
      },
    },
    {
      header: 'Trader Name',
      accessor: (row: WithdrawalRequest) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="text-gray-900 text-sm font-semibold">
              {row?.client?.name}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: (row: WithdrawalRequest) => (
        <div className="text-center text-sm font-bold text-orange-500">
          {formatIndianCurrency(row.amount)}
        </div>
      ),
    },
    {
      header: 'Wallet Balance',
      accessor: (row: WithdrawalRequest) => (
        <div className="text-gray-900 text-sm text-center font-bold">
          {formatIndianCurrency(row.walletBalance)}
        </div>
      ),
    },

    {
      header: 'Status',
      accessor: (row: WithdrawalRequest) => <StatusBadge status={row.status} />,
    },
    // Actions column - only shown when on Pending tab
    ...(showActions ? [{
      header: 'Actions',
      accessor: (row: WithdrawalRequest) => (
        <div className="flex justify-left gap-2">
          <button
            onClick={() => handleReject(row.id)}
            className="text-gray-500 hover:bg-gray-100 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            Reject
          </button>
          <button
            onClick={() => handleApprove(row.id)}
            className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-orange-200 transition-all hover:bg-orange-600"
          >
            Approve
          </button>
        </div>
      ),
    }] : []),
  ];

  // Handle approve/reject
  const handleApprove = (id: string) => {
    setSelectedWithdrawalId(id);
    setShowApproveModal(true);
  };

  const handleReject = (id: string) => {
    setSelectedWithdrawalId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // Handle bulk actions
  const handleBulkApprove = () => {
    console.log('Approving:', selectedRequests);
    alert(`Approved ${selectedRequests.length} requests`);
    setSelectedRequests([]);
  };

  const handleBulkReject = () => {
    console.log('Rejecting:', selectedRequests);
    alert(`Rejected ${selectedRequests.length} requests`);
    setSelectedRequests([]);
  };

  // Stats Card data - Simple with only title, value, icon
  const statCards = [
    {
      title: "Total Withdrawal Amount",
      value: formatIndianCurrency(stats.totalWithdrawalAmount),
      icon: TrendingUp,
      iconColor: "text-orange-500",
    },
    {
      title: "Total Withdrawals",
      value: formatNumber(stats.totalCount),
      icon: DollarSign,
      iconColor: "text-green-500",
    },
    {
      title: "Today's Withdrawals",
      value: `${formatNumber(stats.todayStats.count)} withdrawals`,
      icon: Activity,
      iconColor: "text-blue-500",
    },
    {
      title: "This Month",
      value: formatIndianCurrency(stats.monthStats.totalAmount),
      icon: Users,
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="font-sans min-h-screen bg-[#F8F9FB] text-[#1A1D21]">
      <main className="mx-auto max-w-[2000px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              Withdrawal Requests
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex-1 sm:flex-none">
              <Search className="text-gray-400 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search ID, Client, Amount..."
                className="w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-4 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 sm:w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="text-gray-400 hover:text-gray-600 h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Period Summary Cards - Simple design */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              value={card.value}
              icon={card.icon}
              iconColor={card.iconColor}
            />
          ))}
        </div>

        {/* Bulk Actions - Show when items selected */}
        <AnimatePresence>
          {selectedRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3"
            >
              <span className="text-sm font-medium text-orange-700">
                {selectedRequests.length} request(s) selected
              </span>
              <button
                onClick={handleBulkApprove}
                className="rounded-lg bg-orange-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-orange-600"
              >
                Approve All
              </button>
              <button
                onClick={handleBulkReject}
                className="rounded-lg border border-orange-200 bg-white px-4 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-100"
              >
                Reject All
              </button>
              <button
                onClick={() => setSelectedRequests([])}
                className="ml-auto text-orange-400 hover:text-orange-600"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm">
          {/* Tabs & Controls with Date Filters on Right */}
          <div className="flex flex-col justify-between border-b border-stroke px-4 pt-4 sm:flex-row sm:items-center sm:px-6">
            <div className="flex gap-4 overflow-x-auto pb-4 sm:gap-8 sm:pb-0">
              {(['Pending', 'Approved', 'Rejected'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`relative whitespace-nowrap pb-2 text-xs font-medium transition-all sm:text-sm ${activeTab === tab
                    ? 'text-orange-500'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab}
                  <span
                    className={`ml-2 rounded-md px-1.5 py-0.5 text-[10px] ${tab === 'Pending'
                        ? 'bg-orange-50 text-orange-600'
                        : tab === 'Approved'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                  >
                    {statusCounts[tab] || 0}
                  </span>
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Date Filters - Clean From/To only */}
            <div className="mb-2 flex flex-wrap items-center gap-2 pb-4 sm:pb-0">
              <div className="flex items-center gap-2 bg-white rounded-lg border border-stroke px-3 py-2">
                <Calendar className="text-orange-500 h-4 w-4" />
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-600">From:</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="border-0 px-1 py-0.5 text-sm focus:outline-none focus:ring-0 w-32"
                    placeholder="Start date"
                  />
                </div>
                <span className="text-gray-400 text-sm font-medium">to</span>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-600">To:</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="border-0 px-1 py-0.5 text-sm focus:outline-none focus:ring-0 w-32"
                    placeholder="End date"
                  />
                </div>
                {(fromDate || toDate) && (
                  <button
                    onClick={() => {
                      setFromDate('');
                      setToDate('');
                    }}
                    className="text-gray-400 hover:text-gray-600 ml-1"
                    title="Clear date filter"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilter(!showMobileFilter)}
                className="hover:bg-gray-50 rounded-lg border border-stroke bg-white p-2 transition-colors sm:hidden"
              >
                <Filter className="text-gray-600 h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Mobile Filter Panel */}
          <AnimatePresence>
            {showMobileFilter && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-50/50 border-b border-stroke p-4 sm:hidden"
              >
                <h3 className="text-gray-400 mb-2 text-xs font-bold">
                  Quick Filters
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['High Value', 'Today', 'Yesterday'].map((filter) => (
                    <button
                      key={filter}
                      className="hover:bg-gray-50 rounded-full border border-stroke bg-white px-3 py-1 text-xs font-medium"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generic Table */}
          <GenericTable
            data={filteredData}
            columns={baseColumns}
            rowsPerPage={itemsPerPage}
            paginationOff={false}
          />
        </div>
      </main>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold">Approve Withdrawal</h2>
            <p className="mb-6 text-sm text-gray-600">
              Are you sure you want to approve this withdrawal request?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedWithdrawalId(null);
                }}
                className="rounded-lg border px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!selectedWithdrawalId) return;
                  try {
                    await approve(selectedWithdrawalId);
                    await queryClient.invalidateQueries({ queryKey: ['withdrawal'] });
                    setShowApproveModal(false);
                    setSelectedWithdrawalId(null);
                  } catch (error) {
                    console.error(error);
                  }
                }}
                className="rounded-lg bg-green-600 px-4 py-2 text-white"
              >
                Confirm Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold text-red-600">
              Reject Withdrawal
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Please enter a reason for rejection.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full rounded-lg border p-3"
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedWithdrawalId(null);
                  setRejectReason('');
                }}
                className="rounded-lg border px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!selectedWithdrawalId) return;
                  if (!rejectReason.trim()) {
                    alert('Please enter a rejection reason');
                    return;
                  }
                  try {
                    await reject({
                      id: selectedWithdrawalId,
                      reason: rejectReason,
                    });
                    await queryClient.invalidateQueries({ queryKey: ['withdrawal'] });
                    setShowRejectModal(false);
                    setSelectedWithdrawalId(null);
                    setRejectReason('');
                  } catch (error) {
                    console.error(error);
                  }
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-white"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}