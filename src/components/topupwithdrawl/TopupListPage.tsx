import React, {useMemo, useState, useRef, useEffect} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {
  MdArrowBack,
  MdSettings,
  MdAccountBalanceWallet,
  MdAdd,
  MdSearch,
  MdFilterList,
  MdClose,
  MdSchedule,
  MdCancel,
  MdCheckCircle,
  MdAttachMoney,
  MdDescription as MdDescIcon,
} from 'react-icons/md';
import {FaChevronDown, FaChevronUp} from 'react-icons/fa';

// ---------- Types ----------
type StatusFilter = 'ALL' | 'COMPLETED' | 'PENDING' | 'REJECTED';
type DateFilter = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH';

interface TopupWithdrawal {
  id: string;
  amount: number;
  createdAt: string; // ISO date
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  reference?: string; // optional reference / description
  rejectReason?: string;
}

interface FilterState {
  searchQuery: string;
  status: StatusFilter;
  dateRange: DateFilter;
}

// ---------- Mock Data (replace with real API call) ----------
const mockTopupWithdrawals: TopupWithdrawal[] = [
  {
    id: '1',
    amount: 2500,
    createdAt: new Date().toISOString(),
    status: 'COMPLETED',
    reference: 'Top-up via credit card',
  },
  {
    id: '2',
    amount: 1200,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // yesterday
    status: 'PENDING',
    reference: 'Bank transfer',
  },
  {
    id: '3',
    amount: 800,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    status: 'REJECTED',
    reference: 'Debit card',
    rejectReason: 'Insufficient funds',
  },
  {
    id: '4',
    amount: 3500,
    createdAt: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
    status: 'COMPLETED',
    reference: 'Wallet top-up',
  },
  {
    id: '5',
    amount: 500,
    createdAt: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
    status: 'COMPLETED',
    reference: 'Cash deposit',
  },
];

// ---------- Component ----------
const TopupListPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [withdrawals, setWithdrawals] =
    useState<TopupWithdrawal[]>(mockTopupWithdrawals);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Filter state
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    status: 'ALL',
    dateRange: 'ALL',
  });

  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>(
    'desktop',
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Screen size detection
  useEffect(() => {
    const checkSize = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  // Format currency
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

  // Total amount of top‑up withdrawals (completed)
  const totalTopupAmount = useMemo(
    () =>
      withdrawals
        .filter((w) => w.status === 'COMPLETED')
        .reduce((sum, w) => sum + w.amount, 0),
    [withdrawals],
  );

  // ---------- Filtering ----------
  const filteredWithdrawals = useMemo(() => {
    let filtered = [...withdrawals];

    // Search query (reference or amount)
    if (filterState.searchQuery) {
      const q = filterState.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.reference?.toLowerCase().includes(q) ||
          w.amount.toString().includes(q) ||
          w.id.toLowerCase().includes(q),
      );
    }

    // Status
    if (filterState.status !== 'ALL') {
      filtered = filtered.filter((w) => w.status === filterState.status);
    }

    // Date range
    if (filterState.dateRange !== 'ALL') {
      const now = new Date();
      const startDate = new Date();
      switch (filterState.dateRange) {
        case 'TODAY':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'WEEK':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'MONTH':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      filtered = filtered.filter((w) => new Date(w.createdAt) >= startDate);
    }

    // Sort: newest first
    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [withdrawals, filterState]);

  // Pagination limits per screen size
  const getInitialCount = () => {
    if (screenSize === 'mobile') return 5;
    if (screenSize === 'tablet') return 8;
    return 10;
  };

  const shouldShowSeeMore = filteredWithdrawals.length > getInitialCount();
  const displayedWithdrawals = showAll
    ? filteredWithdrawals
    : filteredWithdrawals.slice(0, getInitialCount());

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, TopupWithdrawal[]> = {};
    displayedWithdrawals.forEach((w) => {
      const date = new Date(w.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const wDate = new Date(date);
      wDate.setHours(0, 0, 0, 0);

      let key: string;
      if (wDate.getTime() === today.getTime()) key = 'Today';
      else if (wDate.getTime() === yesterday.getTime()) key = 'Yesterday';
      else
        key = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

      if (!groups[key]) groups[key] = [];
      groups[key].push(w);
    });
    return groups;
  }, [displayedWithdrawals]);

  // ---------- UI Helpers ----------
  const getStatusBadge = (status: TopupWithdrawal['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
            <MdSchedule size={10} />
            <span className={screenSize === 'mobile' ? 'hidden sm:inline' : ''}>
              Pending
            </span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
            <MdCancel size={10} />
            <span className={screenSize === 'mobile' ? 'hidden sm:inline' : ''}>
              Rejected
            </span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
            <MdCheckCircle size={10} />
            <span className={screenSize === 'mobile' ? 'hidden sm:inline' : ''}>
              Completed
            </span>
          </span>
        );
    }
  };

  const getTitle = (w: TopupWithdrawal) => w.reference || 'Top‑up Withdrawal';
  const getSubtitle = (w: TopupWithdrawal) => {
    const time = new Date(w.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return w.rejectReason
      ? `Reason: ${w.rejectReason.slice(0, 20)}… • ${time}`
      : `Ref: ${w.id.slice(0, 8)} • ${time}`;
  };

  const getIcon = () => (
    <MdAccountBalanceWallet
      className="text-green-600"
      size={screenSize === 'mobile' ? 18 : 20}
    />
  );

  const getBgClass = (status: TopupWithdrawal['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100';
      case 'REJECTED':
        return 'bg-red-100';
      default:
        return 'bg-green-100';
    }
  };

  // Filter actions
  const clearFilters = () =>
    setFilterState({searchQuery: '', status: 'ALL', dateRange: 'ALL'});
  const hasActiveFilters = () =>
    filterState.searchQuery !== '' ||
    filterState.status !== 'ALL' ||
    filterState.dateRange !== 'ALL';

  const toggleSearch = () => {
    setShowSearchBar(!showSearchBar);
    if (!showSearchBar) setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  // Loading / Error states
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        <p className="text-slate-600">Loading top‑up withdrawals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
        <MdCancel size={48} className="mb-4 text-red-500" />
        <p className="font-medium text-red-600">Error loading data</p>
        <p className="mt-2 text-center text-sm text-slate-500">
          {error.message}
        </p>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <button
          onClick={() => navigate({to: '/dashboard'})}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
        >
          <MdArrowBack size={22} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-base font-bold text-slate-900">
            Top‑up Withdrawals
          </h2>
          <p className="text-xs text-slate-500">Total completed</p>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100">
          <MdSettings size={22} />
        </button>
      </header>

      {/* Balance Summary */}
      <section className="px-4 py-4">
        <h1 className="text-center text-2xl font-bold text-slate-900">
          {formatCurrency(totalTopupAmount)}
        </h1>
        <div className="mt-2 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5">
            <MdAttachMoney className="text-blue-600" size={14} />
            <span className="text-xs font-medium text-blue-700">
              {filteredWithdrawals.length} withdrawals
            </span>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-4 px-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate({to: '/topupwithdrawl/walletwithdrawl'})}
            className="group flex flex-col items-center gap-1"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-sm">
              <MdAdd size={20} />
            </div>
            <span className="text-xs font-medium text-slate-700">
              New Withdrawal
            </span>
          </button>
          <button
            onClick={() => setShowFilterModal(true)}
            className="group flex flex-col items-center gap-1"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600">
              <MdFilterList size={20} />
            </div>
            <span className="text-xs font-medium text-slate-700">Filter</span>
          </button>
        </div>
      </section>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pb-20">
          {/* Search header */}
          <div className="sticky top-0 z-10 mb-4 bg-white pb-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Withdrawals</h3>
              <div className="flex gap-2">
                <button
                  onClick={toggleSearch}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                >
                  <MdSearch size={20} />
                </button>
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {showSearchBar && (
              <div className="mt-3">
                <div className="relative">
                  <MdSearch
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={filterState.searchQuery}
                    onChange={(e) =>
                      setFilterState((prev) => ({
                        ...prev,
                        searchQuery: e.target.value,
                      }))
                    }
                    placeholder="Search by reference or amount"
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm"
                  />
                  {filterState.searchQuery && (
                    <button
                      onClick={() =>
                        setFilterState((prev) => ({...prev, searchQuery: ''}))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      <MdClose size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active filter chips */}
          {hasActiveFilters() && (
            <div className="mb-4 flex flex-wrap gap-2">
              {filterState.searchQuery && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  “{filterState.searchQuery}”
                  <button
                    onClick={() =>
                      setFilterState((prev) => ({...prev, searchQuery: ''}))
                    }
                  >
                    <MdClose size={10} />
                  </button>
                </span>
              )}
              {filterState.status !== 'ALL' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                  {filterState.status}
                  <button
                    onClick={() =>
                      setFilterState((prev) => ({...prev, status: 'ALL'}))
                    }
                  >
                    <MdClose size={10} />
                  </button>
                </span>
              )}
              {filterState.dateRange !== 'ALL' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                  {filterState.dateRange === 'TODAY'
                    ? 'Today'
                    : filterState.dateRange === 'WEEK'
                      ? '7 days'
                      : '30 days'}
                  <button
                    onClick={() =>
                      setFilterState((prev) => ({...prev, dateRange: 'ALL'}))
                    }
                  >
                    <MdClose size={10} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Empty state */}
          {filteredWithdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MdDescIcon size={48} className="mb-4 text-slate-300" />
              <p className="text-sm text-slate-500">No withdrawals found</p>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Grouped list */}
              {Object.entries(grouped).map(([dateLabel, items]) => (
                <div key={dateLabel} className="mb-6">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {dateLabel}
                  </h4>
                  <div className="space-y-2">
                    {items.map((w) => (
                      <div
                        key={w.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${getBgClass(w.status)}`}
                          >
                            {getIcon()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {getTitle(w)}
                              </p>
                              {getStatusBadge(w.status)}
                            </div>
                            <p className="truncate text-xs text-slate-500">
                              {getSubtitle(w)}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 pl-2">
                          <span className="whitespace-nowrap text-sm font-bold text-red-600">
                            - {formatCurrency(w.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Show more / less */}
              {shouldShowSeeMore && (
                <div className="sticky bottom-4 mt-6">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-lg"
                  >
                    {showAll ? (
                      <>
                        <FaChevronUp size={14} /> Show Less
                      </>
                    ) : (
                      <>
                        <FaChevronDown size={14} /> Show More Withdrawals
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full overflow-hidden rounded-t-2xl bg-white">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <MdFilterList size={20} className="text-primary" />
                <h3 className="text-lg font-bold text-slate-900">Filter</h3>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="rounded-full p-2 hover:bg-slate-100"
              >
                <MdClose size={20} />
              </button>
            </div>

            <div className="h-full overflow-y-auto p-4">
              <div className="space-y-6">
                {/* Status filter */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-slate-700">
                    Status
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        'ALL',
                        'COMPLETED',
                        'PENDING',
                        'REJECTED',
                      ] as StatusFilter[]
                    ).map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          setFilterState((prev) => ({...prev, status: s}))
                        }
                        className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                          filterState.status === s
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {s === 'ALL' ? 'All' : s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date range filter */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-slate-700">
                    Date Range
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as DateFilter[]).map(
                      (d) => (
                        <button
                          key={d}
                          onClick={() =>
                            setFilterState((prev) => ({...prev, dateRange: d}))
                          }
                          className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                            filterState.dateRange === d
                              ? 'bg-primary text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {d === 'ALL'
                            ? 'All time'
                            : d === 'TODAY'
                              ? 'Today'
                              : d === 'WEEK'
                                ? '7 days'
                                : '30 days'}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={clearFilters}
                  className="rounded-lg border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="rounded-lg bg-primary py-3 text-sm font-semibold text-white"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopupListPage;
