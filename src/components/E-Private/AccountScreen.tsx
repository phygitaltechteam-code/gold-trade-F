/*eslint-disable*/
import React, {useMemo, useState, useRef, useEffect} from 'react';
import {
  MdArrowBack,
  MdSettings,
  MdTrendingUp,
  MdSwapHoriz,
  MdDescription,
  MdSearch,
  MdTune,
  MdAccountBalanceWallet,
  MdSwapVert,
  MdPerson,
  MdSchedule,
  MdCancel,
  MdCheckCircle,
  MdDescription as MdDescIcon,
  MdClose,
  MdFilterList,
  MdPictureAsPdf,
  MdAttachMoney,
  MdCalendarToday,
  MdViewList,
  MdGridOn,
} from 'react-icons/md';
import {AccountScreenProps} from './type';
import {jsPDF} from 'jspdf';
import 'jspdf-autotable';
import {FaChevronDown, FaChevronUp} from 'react-icons/fa';

// Define filter types
type TransactionTypeFilter = 'ALL' | 'CREDIT' | 'DEBIT';
type StatusFilter = 'ALL' | 'COMPLETED' | 'PENDING' | 'REJECTED';
type DateFilter = 'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM';

interface FilterState {
  searchQuery: string;
  transactionType: TransactionTypeFilter;
  status: StatusFilter;
  dateRange: DateFilter;
  customStartDate?: string;
  customEndDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

const AccountScreen: React.FC<AccountScreenProps> = ({
  onNavigate,
  transactions = [],
  wallet,
  isLoading = false,
  error = null,
}) => {
  // Filter state
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    transactionType: 'ALL',
    status: 'ALL',
    dateRange: 'ALL',
  });

  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>(
    'desktop',
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('mobile');
      } else if (width >= 640 && width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get total balance
  const totalBalance = wallet?.eprivateAccount || 0;

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply search query filter
    if (filterState.searchQuery) {
      const query = filterState.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (transaction) =>
          transaction.particular?.toLowerCase().includes(query) ||
          transaction.beneficiary?.fullName?.toLowerCase().includes(query) ||
          transaction.beneficiary?.accountNumber
            ?.toLowerCase()
            .includes(query) ||
          transaction.amount.toString().includes(query) ||
          transaction.type?.toLowerCase().includes(query),
      );
    }

    // Apply transaction type filter
    if (filterState.transactionType !== 'ALL') {
      filtered = filtered.filter(
        (transaction) => transaction.type === filterState.transactionType,
      );
    }

    // Apply status filter
    if (filterState.status !== 'ALL') {
      filtered = filtered.filter((transaction) => {
        if (filterState.status === 'COMPLETED')
          return !transaction.isPending && !transaction.isRejected;
        if (filterState.status === 'PENDING') return transaction.isPending;
        if (filterState.status === 'REJECTED') return transaction.isRejected;
        return true;
      });
    }

    // Apply date range filter
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
        case 'CUSTOM':
          if (filterState.customStartDate) {
            startDate.setTime(new Date(filterState.customStartDate).getTime());
          } else {
            return filtered;
          }
          break;
      }

      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        return transactionDate >= startDate;
      });
    }

    // Apply amount range filter
    if (filterState.minAmount !== undefined) {
      filtered = filtered.filter(
        (transaction) => transaction.amount >= filterState.minAmount!,
      );
    }

    if (filterState.maxAmount !== undefined) {
      filtered = filtered.filter(
        (transaction) => transaction.amount <= filterState.maxAmount!,
      );
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [transactions, filterState]);

  // Determine how many transactions to show initially
  const getInitialTransactionCount = () => {
    if (screenSize === 'mobile') return 3;
    if (screenSize === 'tablet') return 5;
    return 7;
  };

  // Get limited transactions for initial view
  const limitedTransactions = useMemo(() => {
    const initialCount = getInitialTransactionCount();
    return showAllTransactions
      ? filteredTransactions
      : filteredTransactions.slice(0, initialCount);
  }, [filteredTransactions, showAllTransactions, screenSize]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    if (limitedTransactions.length === 0) return {};

    const groups: Record<string, typeof limitedTransactions> = {};

    limitedTransactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Reset hours for comparison
      const transactionDate = new Date(date);
      transactionDate.setHours(0, 0, 0, 0);
      const todayDate = new Date(today);
      todayDate.setHours(0, 0, 0, 0);
      const yesterdayDate = new Date(yesterday);
      yesterdayDate.setHours(0, 0, 0, 0);

      let groupKey: string;

      if (transactionDate.getTime() === todayDate.getTime()) {
        groupKey = 'Today';
      } else if (transactionDate.getTime() === yesterdayDate.getTime()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(transaction);
    });

    return groups;
  }, [limitedTransactions]);

  // Helper function to get icon based on transaction
  const getTransactionIcon = (transaction: any) => {
    const particular = transaction.particular?.toLowerCase() || '';

    if (particular.includes('sent money')) {
      return (
        <MdSwapVert
          className="text-red-600"
          size={screenSize === 'mobile' ? 18 : 20}
        />
      );
    }

    if (particular.includes('topup')) {
      return (
        <MdAccountBalanceWallet
          className="text-green-600"
          size={screenSize === 'mobile' ? 18 : 20}
        />
      );
    }

    if (transaction.beneficiary) {
      return (
        <MdPerson
          className="text-blue-600"
          size={screenSize === 'mobile' ? 18 : 20}
        />
      );
    }

    return (
      <MdAccountBalanceWallet
        className="text-slate-600"
        size={screenSize === 'mobile' ? 18 : 20}
      />
    );
  };

  // Helper function to get background class
  const getTransactionBgClass = (transaction: any) => {
    const particular = transaction.particular?.toLowerCase() || '';

    if (transaction.isPending) return 'bg-yellow-100';
    if (transaction.isRejected) return 'bg-red-100';

    if (particular.includes('sent money')) {
      return 'bg-red-100';
    }

    if (particular.includes('topup')) {
      return 'bg-green-100';
    }

    if (transaction.beneficiary) {
      return 'bg-blue-100';
    }

    return 'bg-slate-100';
  };

  // Helper function to get status badge
  const getStatusBadge = (transaction: any) => {
    if (transaction.isPending) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
          <MdSchedule size={10} />
          <span className={screenSize === 'mobile' ? 'xs:inline hidden' : ''}>
            Pending
          </span>
        </span>
      );
    }

    if (transaction.isRejected) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
          <MdCancel size={10} />
          <span className={screenSize === 'mobile' ? 'xs:inline hidden' : ''}>
            Rejected
          </span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
        <MdCheckCircle size={10} />
        <span className={screenSize === 'mobile' ? 'xs:inline hidden' : ''}>
          Completed
        </span>
      </span>
    );
  };

  // Helper to get transaction title
  const getTransactionTitle = (transaction: any) => {
    if (transaction.beneficiary) {
      return `Transfer to ${transaction.beneficiary.fullName}`;
    }

    if (transaction.particular?.includes('Sent money to')) {
      return transaction.particular;
    }

    if (transaction.particular?.includes('Topup wallet')) {
      return 'Wallet Top-up';
    }

    return transaction.particular || 'Transaction';
  };

  // Helper to get transaction subtitle
  const getTransactionSubtitle = (transaction: any) => {
    const date = new Date(transaction.createdAt);
    const timeString = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    if (transaction.beneficiary) {
      return `Account: ${transaction.beneficiary.accountNumber} • ${timeString}`;
    }

    if (transaction.rejectReason) {
      return `Reason: ${transaction.rejectReason.substring(0, 20)}... • ${timeString}`;
    }

    return `${transaction.type} • ${timeString}`;
  };

  // Generate PDF function
  const generatePDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('Account Statement', 105, 20, {align: 'center'});

    doc.setFontSize(12);
    doc.text(
      `Account: ${wallet?.id ? `CH${wallet.id.slice(0, 8)}...` : 'CH89...8842'}`,
      20,
      35,
    );
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 42);
    doc.text(`Total Balance: ${formatCurrency(totalBalance)}`, 20, 49);

    // Transactions table
    const tableData = filteredTransactions.map((transaction) => [
      new Date(transaction.createdAt).toLocaleDateString(),
      getTransactionTitle(transaction).substring(0, 30),
      transaction.beneficiary?.accountNumber || '-',
      transaction.type,
      formatCurrency(transaction.amount),
      transaction.isPending
        ? 'Pending'
        : transaction.isRejected
          ? 'Rejected'
          : 'Completed',
    ]);

    (doc as any).autoTable({
      startY: 60,
      head: [['Date', 'Description', 'Account', 'Type', 'Amount', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: {fillColor: [41, 128, 185]},
      margin: {top: 10},
      styles: {fontSize: 10},
      columnStyles: {
        0: {cellWidth: 30},
        1: {cellWidth: 50},
        2: {cellWidth: 40},
        3: {cellWidth: 25},
        4: {cellWidth: 30},
        5: {cellWidth: 25},
      },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(10);
    doc.text(
      `Total Transactions: ${filteredTransactions.length}`,
      20,
      finalY + 10,
    );
    doc.text(`Page 1 of 1`, 105, finalY + 10, {align: 'center'});

    // Save the PDF
    doc.save(`account-statement-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilterState({
      searchQuery: '',
      transactionType: 'ALL',
      status: 'ALL',
      dateRange: 'ALL',
    });
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return (
      filterState.searchQuery !== '' ||
      filterState.transactionType !== 'ALL' ||
      filterState.status !== 'ALL' ||
      filterState.dateRange !== 'ALL'
    );
  };

  // Toggle search bar
  const handleSearchToggle = () => {
    setShowSearchBar(!showSearchBar);
    if (!showSearchBar && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="text-slate-600">Loading transactions...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <MdCancel size={48} className="mb-4 text-red-500" />
        <p className="font-medium text-red-600">Error loading transactions</p>
        <p className="mt-2 text-center text-sm text-slate-500">
          {error.message || 'Please try again later'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      {/* Header - Compact */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100">
          <MdArrowBack size={22} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-base font-bold leading-tight text-slate-900">
            E Private Account
          </h2>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100">
          <MdSettings size={22} />
        </button>
      </header>

      {/* Balance Section - Compact */}
      <section className="flex flex-col items-center justify-center px-4 py-4">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
          Available Balance
        </p>
        <h1 className="mb-2 text-center text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {formatCurrency(totalBalance)}
        </h1>
        <div className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
          <MdTrendingUp className="text-emerald-600" size={14} />
          <span className="text-xs font-medium text-emerald-700">
            {filteredTransactions.length} of {transactions.length} transactions
          </span>
        </div>
      </section>

      {/* Quick Actions - Responsive */}
      <section className="mb-6 px-4">
        <div className="grid grid-cols-3 gap-3">
          <button className="group flex flex-col items-center gap-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-md transition-transform group-active:scale-95">
              <MdSwapHoriz size={22} />
            </div>
            <span className="text-xs font-semibold text-slate-700">
              Transfer
            </span>
          </button>

          <button
            onClick={() => onNavigate('statements')}
            className="group flex flex-col items-center gap-1"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-primary shadow-sm transition-transform group-active:scale-95">
              <MdDescription size={20} />
            </div>
            <span className="text-xs font-semibold text-slate-700">
              Statement
            </span>
          </button>

          <button
            onClick={() => setShowFilterModal(true)}
            className="group flex flex-col items-center gap-1"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-transform group-active:scale-95">
              <MdFilterList size={20} />
            </div>
            <span className="text-xs font-semibold text-slate-700">Filter</span>
          </button>
        </div>
      </section>

      {/* Transactions Container - Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="px-4 pb-4">
            {/* Transactions Header */}
            <div className="sticky top-0 z-10 mb-4 bg-white pb-3 pt-2">
              {!showSearchBar ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Transactions
                    </h3>
                    {hasActiveFilters() && (
                      <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-white">
                        {filteredTransactions.length}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleSearchToggle}
                      className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
                    >
                      <MdSearch size={20} />
                    </button>
                    {hasActiveFilters() && (
                      <button
                        onClick={clearAllFilters}
                        className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
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
                      placeholder="Search transactions..."
                      className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm focus:border-primary focus:outline-none"
                    />
                    {filterState.searchQuery && (
                      <button
                        onClick={() =>
                          setFilterState((prev) => ({...prev, searchQuery: ''}))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <MdClose size={18} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleSearchToggle}
                    className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
                  >
                    <MdClose size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters() && (
              <div className="mb-3 flex flex-wrap gap-2">
                {filterState.searchQuery && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    "{filterState.searchQuery}"
                    <button
                      onClick={() =>
                        setFilterState((prev) => ({...prev, searchQuery: ''}))
                      }
                      className="ml-1 hover:text-blue-600"
                    >
                      <MdClose size={10} />
                    </button>
                  </span>
                )}
                {filterState.transactionType !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                    {filterState.transactionType}
                    <button
                      onClick={() =>
                        setFilterState((prev) => ({
                          ...prev,
                          transactionType: 'ALL',
                        }))
                      }
                      className="ml-1 hover:text-purple-600"
                    >
                      <MdClose size={10} />
                    </button>
                  </span>
                )}
                {filterState.status !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                    {filterState.status === 'COMPLETED'
                      ? 'Completed'
                      : filterState.status === 'PENDING'
                        ? 'Pending'
                        : 'Rejected'}
                    <button
                      onClick={() =>
                        setFilterState((prev) => ({...prev, status: 'ALL'}))
                      }
                      className="ml-1 hover:text-amber-600"
                    >
                      <MdClose size={10} />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Transactions List */}
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <MdDescIcon size={40} className="mb-3 text-slate-300" />
                <p className="text-sm text-slate-500">No transactions found</p>
                {hasActiveFilters() && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white hover:bg-primary/90"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedTransactions).map(
                  ([dateLabel, dateTransactions]) => (
                    <div key={dateLabel} className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {dateLabel}
                      </h4>
                      <div className="space-y-2">
                        {dateTransactions.map((transaction) => {
                          const title = getTransactionTitle(transaction);
                          const subtitle = getTransactionSubtitle(transaction);
                          const amount =
                            transaction.type === 'CREDIT'
                              ? `+ ${formatCurrency(transaction.amount)}`
                              : `- ${formatCurrency(transaction.amount)}`;
                          const isPositive = transaction.type === 'CREDIT';
                          const icon = getTransactionIcon(transaction);
                          const bgClass = getTransactionBgClass(transaction);
                          const statusBadge = getStatusBadge(transaction);

                          return (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-3 hover:bg-slate-50"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${bgClass}`}
                                >
                                  {icon}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="truncate text-sm font-semibold text-slate-900">
                                      {title}
                                    </p>
                                    {statusBadge}
                                  </div>
                                  <p className="truncate text-xs text-slate-500">
                                    {subtitle}
                                  </p>
                                </div>
                              </div>
                              <div className="flex-shrink-0 pl-2">
                                <span
                                  className={`whitespace-nowrap text-sm font-bold ${
                                    isPositive
                                      ? 'text-emerald-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {screenSize === 'mobile' && amount.length > 12
                                    ? isPositive
                                      ? `+${formatCurrency(transaction.amount).replace('$', '')}`
                                      : `-${formatCurrency(transaction.amount).replace('$', '')}`
                                    : amount}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}

                {/* See More/Less Button */}
                {filteredTransactions.length > getInitialTransactionCount() && (
                  <div className="pt-4">
                    <button
                      onClick={() =>
                        setShowAllTransactions(!showAllTransactions)
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      {showAllTransactions ? (
                        <>
                          <FaChevronUp size={14} />
                          Show Less
                        </>
                      ) : (
                        <>
                          <FaChevronDown size={14} />
                          See More Transactions
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Modal - Responsive */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm sm:items-center sm:justify-center">
          <div
            className={`max-h-[85vh] w-full overflow-hidden bg-white ${
              screenSize === 'mobile'
                ? 'rounded-t-2xl'
                : 'sm:max-w-md sm:rounded-2xl'
            }`}
          >
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
                {/* Transaction Type Filter */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-slate-700">
                    Transaction Type
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      ['ALL', 'CREDIT', 'DEBIT'] as TransactionTypeFilter[]
                    ).map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          setFilterState((prev) => ({
                            ...prev,
                            transactionType: type,
                          }))
                        }
                        className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                          filterState.transactionType === type
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {type === 'ALL' ? 'All' : type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
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
                    ).map((status) => (
                      <button
                        key={status}
                        onClick={() =>
                          setFilterState((prev) => ({...prev, status}))
                        }
                        className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                          filterState.status === status
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {status === 'ALL'
                          ? 'All'
                          : status === 'COMPLETED'
                            ? 'Completed'
                            : status === 'PENDING'
                              ? 'Pending'
                              : 'Rejected'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-slate-700">
                    Date Range
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as DateFilter[]).map(
                      (range) => (
                        <button
                          key={range}
                          onClick={() =>
                            setFilterState((prev) => ({
                              ...prev,
                              dateRange: range,
                            }))
                          }
                          className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                            filterState.dateRange === range
                              ? 'bg-primary text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {range === 'ALL'
                            ? 'All Time'
                            : range === 'TODAY'
                              ? 'Today'
                              : range === 'WEEK'
                                ? '7 Days'
                                : '30 Days'}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Amount Range Filter */}
                <div>
                  <h4 className="mb-3 text-sm font-semibold text-slate-700">
                    Amount Range
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          $
                        </span>
                        <input
                          type="number"
                          value={filterState.minAmount || ''}
                          onChange={(e) =>
                            setFilterState((prev) => ({
                              ...prev,
                              minAmount: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            }))
                          }
                          placeholder="Min"
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-3 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          $
                        </span>
                        <input
                          type="number"
                          value={filterState.maxAmount || ''}
                          onChange={(e) =>
                            setFilterState((prev) => ({
                              ...prev,
                              maxAmount: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            }))
                          }
                          placeholder="Max"
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-3 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={clearAllFilters}
                  className="rounded-lg border-2 border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountScreen;
