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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {
  useApproveWithdrawal,
  useGetWithdrawal,
  useRejectWithdrawal,
} from '@/lib/react-query/withdrawal';

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

const MOCK_DATA: WithdrawalRequest[] = [
  {
    id: '1',
    requestId: '#W-94821',
    date: 'Today',
    time: '10:42 AM',
    client: { name: 'John Doe', tier: 'Gold Tier', initials: 'JD' },
    brokerName: 'Capital Brokerage',
    brokerNumber: 'BRK-00123',
    superBrokerName: 'Global Markets Group',
    superBrokerNumber: 'SBR-00456',
    walletBalance: 45000.0,
    amount: 15400.0,
    withdrawType: 'Bank Transfer',
    detailAmount: 15385.0,
    paidAmount: 15385.0,
    paidDateTime: '2024-01-15 14:30:00',
    fee: 15.0,
    bank: 'Chase Bank',
    accountLast4: '8821',
    status: 'Pending',
  },
  {
    id: '2',
    requestId: '#W-94820',
    date: 'Today',
    time: '09:15 AM',
    client: { name: 'Alice Smith', tier: 'Standard Tier', initials: 'AS' },
    brokerName: 'TradeCorp',
    brokerNumber: 'BRK-00456',
    superBrokerName: 'Alpha Financial',
    superBrokerNumber: 'SBR-00123',
    walletBalance: 12000.0,
    amount: 2100.0,
    withdrawType: 'Crypto Wallet',
    detailAmount: 2095.0,
    paidAmount: 2095.0,
    paidDateTime: '2024-01-15 11:20:00',
    fee: 5.0,
    bank: 'Wells Fargo',
    accountLast4: '4492',
    status: 'Pending',
  },
  {
    id: '3',
    requestId: '#W-94819',
    date: 'Today',
    time: '08:30 AM',
    client: {
      name: 'Marcus Chen',
      tier: 'Platinum Tier',
      initials: 'MC',
      avatar: 'https://picsum.photos/seed/marcus/40/40',
    },
    brokerName: 'Asia Wealth',
    brokerNumber: 'BRK-00789',
    superBrokerName: 'Global Markets Group',
    superBrokerNumber: 'SBR-00456',
    walletBalance: 250000.0,
    amount: 85000.0,
    withdrawType: 'Wire Transfer',
    detailAmount: 84950.0,
    paidAmount: 0,
    paidDateTime: 'Pending',
    fee: 50.0,
    bank: 'HSBC Global',
    accountLast4: '1102',
    status: 'Review',
    isHighValue: true,
  },
  {
    id: '4',
    requestId: '#W-94818',
    date: 'Yesterday',
    time: '11:55 PM',
    client: { name: 'Robert King', tier: 'Standard Tier', initials: 'RK' },
    brokerName: 'King Investments',
    brokerNumber: 'BRK-00999',
    superBrokerName: 'Alpha Financial',
    superBrokerNumber: 'SBR-00123',
    walletBalance: 3400.0,
    amount: 850.0,
    withdrawType: 'Bank Transfer',
    detailAmount: 848.0,
    paidAmount: 848.0,
    paidDateTime: '2024-01-14 09:45:00',
    fee: 2.0,
    bank: 'Bank of America',
    accountLast4: '9931',
    status: 'Pending',
  },
  {
    id: '5',
    requestId: '#W-94802',
    date: 'Yesterday',
    time: '04:20 PM',
    client: { name: 'Sarah Lee', tier: 'Silver Tier', initials: 'SL' },
    brokerName: 'TradeCorp',
    brokerNumber: 'BRK-00456',
    superBrokerName: 'Global Markets Group',
    superBrokerNumber: 'SBR-00456',
    walletBalance: 9800.0,
    amount: 4200.0,
    withdrawType: 'PayPal',
    detailAmount: 4196.0,
    paidAmount: 0,
    paidDateTime: 'Pending',
    fee: 4.0,
    bank: 'Citibank',
    accountLast4: '2381',
    status: 'On Hold',
  },
  {
    id: '6',
    requestId: '#W-94795',
    date: 'Yesterday',
    time: '02:10 PM',
    client: { name: 'David Brown', tier: 'Gold Tier', initials: 'DB' },
    brokerName: 'Capital Brokerage',
    brokerNumber: 'BRK-00123',
    superBrokerName: 'Alpha Financial',
    superBrokerNumber: 'SBR-00123',
    walletBalance: 65000.0,
    amount: 12500.0,
    withdrawType: 'Wire Transfer',
    detailAmount: 12488.0,
    paidAmount: 12488.0,
    paidDateTime: '2024-01-13 16:20:00',
    fee: 12.0,
    bank: 'Chase Bank',
    accountLast4: '5543',
    status: 'Approved',
  },
  {
    id: '7',
    requestId: '#W-94788',
    date: '2 days ago',
    time: '11:30 AM',
    client: { name: 'Emma Wilson', tier: 'Standard Tier', initials: 'EW' },
    brokerName: 'King Investments',
    brokerNumber: 'BRK-00999',
    superBrokerName: 'Global Markets Group',
    superBrokerNumber: 'SBR-00456',
    walletBalance: 8000.0,
    amount: 3200.0,
    withdrawType: 'Bank Transfer',
    detailAmount: 3197.0,
    paidAmount: 0,
    paidDateTime: 'Rejected',
    fee: 3.0,
    bank: 'Wells Fargo',
    accountLast4: '7789',
    status: 'Rejected',
  },
];

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
  const { data: withdrawal } = useGetWithdrawal();
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
  const [isExpanded, setIsExpanded] = useState(false); // View More/View Less state
  const itemsPerPage = 5;

  // const MOCK_DATA: WithdrawalRequest[] =
  //   withdrawal?.map((item: any, index: number) => ({
  //     id: item.id,
  //     requestId: `REQ${String(index + 1).padStart(3, '0')}`,

  //     date: 'Today',
  //     time: new Date(item.createdAt).toLocaleTimeString('en-IN', {
  //       hour: '2-digit',
  //       minute: '2-digit',
  //     }),

  //     client: {
  //       name: item.customer?.user?.fullname || 'N/A',
  //       avatar: item.customer?.photo || '',
  //       initials:
  //         item.customer?.user?.fullname
  //           ?.split(' ')
  //           .map((n: string) => n[0])
  //           .join('')
  //           .toUpperCase() || 'NA',
  //     },

  //     brokerName: '-',
  //     brokerNumber: '-',

  //     superBrokerName: '-',
  //     superBrokerNumber: '-',

  //     walletBalance: 0,

  //     amount: item.amount || 0,

  //     withdrawType: 'Bank Transfer',

  //     detailAmount: item.amount || 0,
  //     paidAmount: 0,
  //     paidDateTime: '-',

  //     fee: 0,

  //     bank: item.customer?.bank_Name || '-',
  //     accountLast4: '----',

  //     status:
  //       item.status === 'PENDING'
  //         ? 'Pending'
  //         : item.status === 'APPROVED'
  //           ? 'Approved'
  //           : item.status === 'REJECTED'
  //             ? 'Rejected'
  //             : 'Review',

  //     isHighValue: item.amount > 100000,

  //     customer: item.customer,
  //   })) || [];

  const MOCK_DATA: WithdrawalRequest[] =
    withdrawal?.map((item: any, index: number) => ({
      id: item.id,
      requestId: `REQ${String(index + 1).padStart(3, '0')}`,

      date: 'Today',
      time: new Date(item.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),

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

      walletBalance: 0,
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


  // Filter d
  // ata based on active tab and search
  const filteredData = useMemo(() => {
    return MOCK_DATA?.filter((req) => {
      // Tab filter
      const matchesTab = activeTab === req.status;

      // Search filter
      const matchesSearch =
        searchTerm === '' ||
        req.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.amount.toString().includes(searchTerm) ||
        req.bank.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchTerm]);

  // Calculate dynamic stats
  const stats = useMemo(() => {
    const pendingAmount = MOCK_DATA?.filter(
      (r) => r.status === 'Pending',
    ).reduce((sum, r) => sum + r.amount, 0);

    const processedToday = MOCK_DATA?.filter(
      (r) => r.date === 'Today' && r.status === 'Approved',
    ).length;

    const totalOutflow = MOCK_DATA?.reduce((sum, r) => sum + r.amount, 0);

    return {
      pendingCount: MOCK_DATA?.filter((r) => r.status === 'Pending').length,
      pendingAmount,
      processedToday,
      totalOutflow,
    };
  }, []);

  // Get counts for each status
  const statusCounts = useMemo(() => {
    return {
      Pending: MOCK_DATA?.filter((r) => r.status === 'Pending').length,
      Review: MOCK_DATA?.filter((r) => r.status === 'Review').length,
      'On Hold': MOCK_DATA?.filter((r) => r.status === 'On Hold').length,
      Approved: MOCK_DATA?.filter((r) => r.status === 'Approved').length,
      Rejected: MOCK_DATA?.filter((r) => r.status === 'Rejected').length,
    };
  }, []);

  // Base columns (View Less)
  const baseColumns = [
    {
      header: 'Request ID',
      accessor: (row: WithdrawalRequest) => (
        <span className="text-gray-900 text-sm font-bold">{row.requestId}</span>
      ),
    },
    {
      header: 'Client Name',
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
      header: 'Broker Number',
      accessor: (row: WithdrawalRequest) => (
        <span className="text-gray-600 text-sm">{row.brokerNumber}</span>
      ),
    },
    {
      header: 'Super Broker Number',
      accessor: (row: WithdrawalRequest) => (
        <span className="text-gray-600 text-sm">{row.superBrokerNumber}</span>
      ),
    },
    {
      header: 'Wallet Balance',
      accessor: (row: WithdrawalRequest) => (
        <div className="text-gray-900 text-right text-sm font-bold">
          ₹{row.walletBalance.toLocaleString('en-IN')}
        </div>
      ),
    },
    {
      header: 'Withdraw Amount',
      accessor: (row: WithdrawalRequest) => (
        <div className="text-right text-sm font-bold text-orange-500">
          ₹{row.amount.toLocaleString('en-IN')}
        </div>
      ),
    },
    {
      header: 'Withdraw Type',
      accessor: (row: WithdrawalRequest) => (
        <span className="bg-gray-100 rounded border border-slate-200 px-2 py-1 text-xs">
          {row.withdrawType}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: WithdrawalRequest) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: (row: WithdrawalRequest) => (
        <div className="flex items-center justify-end gap-2">
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
    },
  ];

  // Expanded columns (View More) - includes additional fields
  const expandedColumns = [
    {
      header: 'Request ID',
      accessor: (row: WithdrawalRequest) => (
        <span className="text-gray-900 text-sm font-bold">{row.requestId}</span>
      ),
    },
    {
      header: 'Client Name',
      accessor: (row: WithdrawalRequest) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="text-gray-900 text-sm font-semibold">
              {row.client.name}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Broker Name',
      accessor: (row: WithdrawalRequest) => (
        <div>
          <div className="text-gray-900 text-sm font-medium">
            {row.brokerName}
          </div>
          <div className="text-gray-400 text-xs">{row.brokerNumber}</div>
        </div>
      ),
    },
    {
      header: 'Super Broker Name',
      accessor: (row: WithdrawalRequest) => (
        <div>
          <div className="text-gray-900 text-sm font-medium">
            {row.superBrokerName}
          </div>
          <div className="text-gray-400 text-xs">{row.superBrokerNumber}</div>
        </div>
      ),
    },
    {
      header: 'Wallet Balance',
      accessor: (row: WithdrawalRequest) => (
        <div className="text-gray-900 text-right text-sm font-bold">
          ₹{row.walletBalance.toLocaleString('en-IN')}
        </div>
      ),
    },
    {
      header: 'Withdraw Amount',
      accessor: (row: WithdrawalRequest) => (
        <div className="text-right text-sm font-bold text-orange-500">
          ₹{row.amount.toLocaleString('en-IN')}
        </div>
      ),
    },
    {
      header: 'Withdraw Type',
      accessor: (row: WithdrawalRequest) => (
        <span className="bg-gray-100 rounded border border-slate-200 px-2 py-1 text-xs">
          {row.withdrawType}
        </span>
      ),
    },
    {
      header: 'Paid Amount',
      accessor: (row: WithdrawalRequest) => (
        <div className="text-right text-sm font-bold text-emerald-600">
          ₹{row.paidAmount.toLocaleString('en-IN')}
        </div>
      ),
    },
    {
      header: 'Paid Date/Time',
      accessor: (row: WithdrawalRequest) => (
        <span className="text-gray-600 text-sm">{row.paidDateTime}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: WithdrawalRequest) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: (row: WithdrawalRequest) => (
        <div className="flex items-center justify-end gap-2">
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
    },
  ];

  // Handle approve/reject
  // const handleApprove = (id: string) => {
  //   approve(id);
  // };

  const handleApprove = (id: string) => {
    setSelectedWithdrawalId(id);
    setShowApproveModal(true);
  };

  // const handleReject = (id: string) => {
  //   console.log('Rejecting:', id);
  //   alert(`Rejected request ${id}`);
  //   reject(id);

  // };

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

  const columns = isExpanded ? expandedColumns : baseColumns;

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

        {/* Summary Cards - Dynamic */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
          <SummaryCard
            title="Pending Review"
            value={stats?.pendingCount?.toString()}
            subValue={`₹${stats?.pendingAmount?.toLocaleString('en-IN')} total value`}
            icon={<Hourglass className="text-gray-500 h-5 w-5" />}
          />
          <SummaryCard
            title="Processed Today"
            value={stats?.processedToday?.toString()}
            subValue="+12% vs yesterday"
            subValueColor="text-emerald-500"
            icon={<CheckCircle2 className="text-gray-500 h-5 w-5" />}
          />
          <SummaryCard
            title="Liquidity Outflow"
            value={`₹${(stats?.totalOutflow / 100000).toFixed(1)}L`}
            subValue="Daily cap remaining: ₹3.8L"
            icon={<TrendingDown className="text-gray-500 h-5 w-5" />}
          />
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
          {/* Tabs & Controls */}
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
                  {statusCounts[tab] > 0 && (
                    <span
                      className={`ml-2 rounded-md px-1.5 py-0.5 text-[10px] ${tab === 'Pending'
                        ? 'bg-orange-50 text-orange-600'
                        : tab === 'Approved'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-red-600'
                        }`}
                    >
                      {statusCounts[tab]}
                    </span>
                  )}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="mb-2 flex items-center gap-2 pb-4 sm:pb-0">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilter(!showMobileFilter)}
                className="hover:bg-gray-50 rounded-lg border border-stroke bg-white p-2 transition-colors sm:hidden"
              >
                <Filter className="text-gray-600 h-4 w-4" />
              </button>

              {/* View More/View Less Button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                {isExpanded ? 'View Less' : 'View More'}
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
            columns={columns}
            rowsPerPage={itemsPerPage}
            paginationOff={false}
          />
        </div>
      </main>
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-semibold">
              Approve Withdrawal
            </h2>

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
                    await queryClient.invalidateQueries({ queryKey: ['withdrawal'] }); // Add this line
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
                    await queryClient.invalidateQueries({ queryKey: ['withdrawal'] }); // Add this line
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

function SummaryCard({
  title,
  value,
  subValue,
  subValueColor = 'text-gray-400',
  icon,
}: {
  title: string;
  value: string;
  subValue: string;
  subValueColor?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group flex items-start justify-between rounded-xl border border-stroke bg-white p-4 shadow-sm transition-colors hover:border-orange-200 sm:p-5 lg:p-6">
      <div>
        <p className="text-gray-400 mb-1 text-[10px] font-semibold uppercase tracking-wider sm:mb-2 sm:text-xs">
          {title}
        </p>
        <h3 className="text-gray-900 mb-1 text-xl font-bold sm:text-2xl lg:text-3xl">
          {value}
        </h3>
        <p className={`text-[9px] font-medium sm:text-xs ${subValueColor}`}>
          {subValue}
        </p>
      </div>
      <div className="bg-gray-50 rounded-lg p-1.5 transition-colors group-hover:bg-orange-50 sm:p-2">
        {icon}
      </div>
    </div>
  );
}
