import React, {useState, useMemo} from 'react';
import {
  Search,
  Bell,
  Hourglass,
  CheckCircle2,
  TrendingDown,
  Filter,
  Download,
  Landmark,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';

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
  amount: number;
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
    client: {name: 'John Doe', tier: 'Gold Tier', initials: 'JD'},
    amount: 15400.0,
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
    client: {name: 'Alice Smith', tier: 'Standard Tier', initials: 'AS'},
    amount: 2100.0,
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
    amount: 85000.0,
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
    client: {name: 'Robert King', tier: 'Standard Tier', initials: 'RK'},
    amount: 850.0,
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
    client: {name: 'Sarah Lee', tier: 'Silver Tier', initials: 'SL'},
    amount: 4200.0,
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
    client: {name: 'David Brown', tier: 'Gold Tier', initials: 'DB'},
    amount: 12500.0,
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
    client: {name: 'Emma Wilson', tier: 'Standard Tier', initials: 'EW'},
    amount: 3200.0,
    fee: 3.0,
    bank: 'Wells Fargo',
    accountLast4: '7789',
    status: 'Rejected',
  },
];

export default function WithdrawalRequest() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const itemsPerPage = 5;

  // Filter data based on active tab and search
  const filteredData = useMemo(() => {
    return MOCK_DATA.filter((req) => {
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
    const pendingAmount = MOCK_DATA.filter(
      (r) => r.status === 'Pending',
    ).reduce((sum, r) => sum + r.amount, 0);

    const processedToday = MOCK_DATA.filter(
      (r) => r.date === 'Today' && r.status === 'Approved',
    ).length;

    const totalOutflow = MOCK_DATA.reduce((sum, r) => sum + r.amount, 0);

    return {
      pendingCount: MOCK_DATA.filter((r) => r.status === 'Pending').length,
      pendingAmount,
      processedToday,
      totalOutflow,
    };
  }, []);

  // Get counts for each status
  const statusCounts = useMemo(() => {
    return {
      Pending: MOCK_DATA.filter((r) => r.status === 'Pending').length,
      Review: MOCK_DATA.filter((r) => r.status === 'Review').length,
      'On Hold': MOCK_DATA.filter((r) => r.status === 'On Hold').length,
      Approved: MOCK_DATA.filter((r) => r.status === 'Approved').length,
      Rejected: MOCK_DATA.filter((r) => r.status === 'Rejected').length,
    };
  }, []);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset pagination when tab changes
  React.useEffect(() => {
    setCurrentPage(1);
    setSelectedRequests([]);
  }, [activeTab, searchTerm]);

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRequests.length === paginatedData.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(paginatedData.map((r) => r.id));
    }
  };

  // Handle single select
  const handleSelect = (id: string) => {
    setSelectedRequests((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  // Handle approve/reject
  const handleApprove = (id: string) => {
    console.log('Approving:', id);
    // Add your approve logic here
    alert(`Approved request ${id}`);
  };

  const handleReject = (id: string) => {
    console.log('Rejecting:', id);
    // Add your reject logic here
    alert(`Rejected request ${id}`);
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

  // Handle export
  const handleExport = () => {
    const dataToExport =
      selectedRequests.length > 0
        ? MOCK_DATA.filter((r) => selectedRequests.includes(r.id))
        : filteredData;

    const csvContent = [
      [
        'Request ID',
        'Date',
        'Time',
        'Client Name',
        'Tier',
        'Amount',
        'Fee',
        'Bank',
        'Account',
        'Status',
      ],
      ...dataToExport.map((req) => [
        req.requestId,
        req.date,
        req.time,
        req.client.name,
        req.client.tier,
        req.amount.toString(),
        req.fee.toString(),
        req.bank,
        req.accountLast4,
        req.status,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], {type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `withdrawals_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="font-sans min-h-screen bg-[#F8F9FB] text-[#1A1D21]">
      <main className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Withdrawal Requests
            </h1>
            <span className="text-gray-500 rounded-full border border-stroke bg-white px-2.5 py-0.5 text-[10px] font-medium shadow-sm sm:text-[11px]">
              Live Updates
            </span>
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
            <button className="hover:bg-gray-50 relative rounded-lg border border-stroke bg-white p-2 transition-colors">
              <Bell className="text-gray-600 h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500"></span>
            </button>
          </div>
        </div>

        {/* Summary Cards - Dynamic */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-6">
          <SummaryCard
            title="Pending Review"
            value={stats.pendingCount.toString()}
            subValue={`$${stats.pendingAmount.toLocaleString()} total value`}
            icon={<Hourglass className="text-gray-500 h-5 w-5" />}
          />
          <SummaryCard
            title="Processed Today"
            value={stats.processedToday.toString()}
            subValue="+12% vs yesterday"
            subValueColor="text-emerald-500"
            icon={<CheckCircle2 className="text-gray-500 h-5 w-5" />}
          />
          <SummaryCard
            title="Liquidity Outflow"
            value={`$${(stats.totalOutflow / 1000000).toFixed(1)}M`}
            subValue="Daily cap remaining: $3.8M"
            icon={<TrendingDown className="text-gray-500 h-5 w-5" />}
          />
        </div>

        {/* Bulk Actions - Show when items selected */}
        <AnimatePresence>
          {selectedRequests.length > 0 && (
            <motion.div
              initial={{opacity: 0, y: -20}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -20}}
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
              {(
                [
                  'Pending',
                  'Review',
                  'On Hold',
                  'Approved',
                  'Rejected',
                ] as const
              ).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`relative whitespace-nowrap pb-4 text-xs font-medium transition-all sm:text-sm ${
                    activeTab === tab
                      ? 'text-orange-500'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                  {statusCounts[tab] > 0 && (
                    <span
                      className={`ml-2 rounded-md px-1.5 py-0.5 text-[10px] ${
                        tab === 'Pending'
                          ? 'bg-orange-50 text-orange-600'
                          : tab === 'Review'
                            ? 'bg-purple-50 text-purple-600'
                            : tab === 'On Hold'
                              ? 'bg-gray-100 text-gray-600'
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

            <div className="flex items-center gap-2 pb-4 sm:pb-0">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilter(!showMobileFilter)}
                className="hover:bg-gray-50 rounded-lg border border-stroke bg-white p-2 transition-colors sm:hidden"
              >
                <Filter className="text-gray-600 h-4 w-4" />
              </button>

              <button
                onClick={handleExport}
                className="text-gray-600 hover:bg-gray-50 flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Mobile Filter Panel */}
          <AnimatePresence>
            {showMobileFilter && (
              <motion.div
                initial={{opacity: 0, height: 0}}
                animate={{opacity: 1, height: 'auto'}}
                exit={{opacity: 0, height: 0}}
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

          {/* Mobile Card View */}
          <div className="block divide-y divide-stroke lg:hidden">
            {paginatedData.length > 0 ? (
              paginatedData.map((req) => (
                <div key={req.id} className="hover:bg-gray-50/50 relative p-4">
                  {req.isHighValue && (
                    <div className="absolute bottom-0 left-0 top-0 w-1 bg-red-500" />
                  )}

                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(req.id)}
                        onChange={() => handleSelect(req.id)}
                        className="rounded border-stroke text-orange-500 focus:ring-orange-500"
                      />
                      <div>
                        <span className="text-sm font-bold">
                          {req.requestId}
                        </span>
                        <span className="text-gray-500 ml-2 text-[10px]">
                          {req.date}, {req.time}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  <div className="mb-3 flex items-center gap-3">
                    {req.client.avatar ? (
                      <img
                        src={req.client.avatar}
                        alt={req.client.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="bg-gray-100 text-gray-500 flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold">
                        {req.client.initials}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold">{req.client.name}</p>
                      <p className="text-gray-500 text-xs">{req.client.tier}</p>
                    </div>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-400 mb-1 text-[10px]">Amount</p>
                      <p className="text-sm font-bold">
                        $
                        {req.amount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-gray-400 text-[9px]">
                        Fee: ${req.fee.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1 text-[10px]">Bank</p>
                      <div className="flex items-center gap-1">
                        <Landmark className="text-gray-400 h-3 w-3" />
                        <span className="text-xs font-medium">{req.bank}</span>
                      </div>
                      <p className="text-gray-400 font-mono text-[9px]">
                        **** {req.accountLast4}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleReject(req.id)}
                      className="text-gray-500 hover:bg-gray-100 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-orange-200 transition-all hover:bg-orange-600"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 p-8 text-center">
                No {activeTab.toLowerCase()} requests found
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50/50 border-y border-stroke">
                  <th className="py-4 pl-6">
                    <input
                      type="checkbox"
                      checked={
                        selectedRequests.length === paginatedData.length &&
                        paginatedData.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-stroke text-orange-500 focus:ring-orange-500"
                    />
                  </th>
                  <th className="text-gray-400 px-4 py-4 text-[11px] font-semibold uppercase tracking-wider">
                    Request ID / Date
                  </th>
                  <th className="text-gray-400 px-4 py-4 text-[11px] font-semibold uppercase tracking-wider">
                    Client Details
                  </th>
                  <th className="text-gray-400 px-4 py-4 text-right text-[11px] font-semibold uppercase tracking-wider">
                    Amount (USD)
                  </th>
                  <th className="text-gray-400 px-4 py-4 text-[11px] font-semibold uppercase tracking-wider">
                    Bank Destination
                  </th>
                  <th className="text-gray-400 px-4 py-4 text-[11px] font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-gray-400 py-4 pr-6 text-right text-[11px] font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-gray-100 divide-y">
                {paginatedData.length > 0 ? (
                  paginatedData.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-gray-50/50 group relative transition-colors"
                    >
                      {req.isHighValue && (
                        <div className="absolute bottom-0 left-0 top-0 w-1 bg-red-500" />
                      )}
                      <td className="py-4 pl-6">
                        <input
                          type="checkbox"
                          checked={selectedRequests.includes(req.id)}
                          onChange={() => handleSelect(req.id)}
                          className="rounded border-stroke text-orange-500 focus:ring-orange-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-900 text-sm font-bold">
                            {req.requestId}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {req.date}, {req.time}
                          </span>
                          {req.isHighValue && (
                            <span className="mt-1 inline-flex items-center rounded bg-red-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-600">
                              High Value
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {req.client.avatar ? (
                            <img
                              src={req.client.avatar}
                              alt={req.client.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="bg-gray-100 text-gray-500 flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold">
                              {req.client.initials}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-gray-900 text-sm font-semibold">
                              {req.client.name}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {req.client.tier}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col">
                          <span className="text-gray-900 text-sm font-bold">
                            $
                            {req.amount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                          <span className="text-gray-400 text-xs italic">
                            Fee: ${req.fee.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Landmark className="text-gray-400 h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="text-gray-700 text-sm font-medium">
                              {req.bank}
                            </span>
                            <span className="text-gray-400 font-mono text-xs">
                              **** {req.accountLast4}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleReject(req.id)}
                            className="text-gray-500 hover:bg-gray-100 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-orange-200 transition-all hover:bg-orange-600"
                          >
                            Approve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-gray-400 px-6 py-8 text-center"
                    >
                      No {activeTab.toLowerCase()} requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination */}
          {filteredData.length > 0 && (
            <div className="bg-gray-50/30 flex flex-col items-center justify-between gap-3 border-t border-stroke px-4 py-3 sm:flex-row sm:px-6 sm:py-4">
              <p className="text-gray-500 order-2 text-[10px] sm:order-1 sm:text-xs">
                Showing{' '}
                <span className="text-gray-900 font-semibold">
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    filteredData.length,
                  )}
                </span>{' '}
                to{' '}
                <span className="text-gray-900 font-semibold">
                  {Math.min(currentPage * itemsPerPage, filteredData.length)}
                </span>{' '}
                of{' '}
                <span className="text-gray-900 font-semibold">
                  {filteredData.length}
                </span>{' '}
                {activeTab.toLowerCase()} requests
              </p>
              <div className="order-1 flex items-center gap-2 sm:order-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg border border-stroke bg-white p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-gray-600 text-xs font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="text-gray-600 hover:bg-gray-50 rounded-lg border border-stroke bg-white p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
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

function StatusBadge({status}: {status: WithdrawalRequest['status']}) {
  const styles = {
    Pending: 'bg-orange-50 text-orange-600 border-orange-100',
    Review: 'bg-purple-50 text-purple-600 border-purple-100',
    'On Hold': 'bg-gray-100 text-gray-600 border-stroke',
    Approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Rejected: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <span
      className={`inline-block whitespace-nowrap rounded-md border px-2 py-1 text-[9px] font-bold uppercase sm:text-[10px] ${styles[status]}`}
    >
      {status}
    </span>
  );
}
