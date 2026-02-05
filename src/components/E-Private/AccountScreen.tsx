/*eslint-disable*/
import React, {useMemo, useState, useRef, useEffect} from 'react';
import {
  MdArrowBack,
  MdSettings,
  MdTrendingUp,
  MdSwapHoriz,
  MdDescription,
  MdMoreHoriz,
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
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
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
            return filtered; // No custom date set
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
    if (isMobile) return 3;
    if (isTablet) return 4;
    return 5;
  };

  // Get limited transactions for initial view
  const limitedTransactions = useMemo(() => {
    const initialCount = getInitialTransactionCount();
    return showAllTransactions
      ? filteredTransactions
      : filteredTransactions.slice(0, initialCount);
  }, [filteredTransactions, showAllTransactions, isMobile, isTablet]);

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
        <div className="flex h-full w-full items-center justify-center">
          <MdSwapVert size={isMobile ? 20 : 24} className="text-red-600" />
        </div>
      );
    }

    if (particular.includes('topup')) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <MdAccountBalanceWallet
            size={isMobile ? 20 : 24}
            className="text-green-600"
          />
        </div>
      );
    }

    if (transaction.beneficiary) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <MdPerson size={isMobile ? 20 : 24} className="text-blue-600" />
        </div>
      );
    }

    return (
      <div className="flex h-full w-full items-center justify-center">
        <MdAccountBalanceWallet
          size={isMobile ? 20 : 24}
          className="text-slate-600"
        />
      </div>
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
          <span className={isMobile ? 'hidden sm:inline' : ''}>Pending</span>
        </span>
      );
    }

    if (transaction.isRejected) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
          <MdCancel size={10} />
          <span className={isMobile ? 'hidden sm:inline' : ''}>Rejected</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
        <MdCheckCircle size={10} />
        <span className={isMobile ? 'hidden sm:inline' : ''}>Completed</span>
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
    });

    if (transaction.beneficiary) {
      return `Account: ${transaction.beneficiary.accountNumber} • ${timeString}`;
    }

    if (transaction.rejectReason) {
      return `Reason: ${transaction.rejectReason.substring(0, 30)}... • ${timeString}`;
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
    <div className="bg-premium-pattern bg-pattern-size relative flex h-full min-h-screen flex-col bg-fixed">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white/80 p-4 backdrop-blur-md transition-colors duration-300">
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-200">
          <MdArrowBack size={24} />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold leading-tight text-slate-900">
            E Private Account
          </h2>
          <span className="text-xs font-medium text-slate-500">
            {wallet?.id ? `CH${wallet.id.slice(0, 8)}...` : 'CH89...8842'}
          </span>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-200">
          <MdSettings size={24} />
        </button>
      </header>

      {/* Balance Section */}
      <section className="flex flex-col items-center justify-center px-4 pb-8 pt-6">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">
          Available Balance
        </p>
        <h1 className="mb-3 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {formatCurrency(totalBalance)}
        </h1>
        <div className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1.5">
          <MdTrendingUp className="text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700">
            {filteredTransactions.length} of {transactions.length} transactions
            •{' '}
            {wallet?.pendingTopup && wallet.pendingTopup > 0
              ? `${formatCurrency(wallet.pendingTopup)} pending`
              : 'All clear'}
          </span>
        </div>
      </section>

      {/* Quick Actions - Responsive Grid */}
      <section className="mb-8 px-4 sm:px-6">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <button className="group flex flex-col items-center gap-1 sm:gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 transition-transform group-active:scale-95 sm:h-14 sm:w-14">
              <MdSwapHoriz size={isMobile ? 22 : 28} />
            </div>
            <span className="text-xs font-semibold text-slate-700 sm:text-sm">
              Transfer
            </span>
          </button>

          <button
            onClick={() => onNavigate('statements')}
            className="group flex flex-col items-center gap-1 sm:gap-2"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-primary shadow-sm transition-transform group-active:scale-95 sm:h-14 sm:w-14">
              <MdDescription size={isMobile ? 20 : 26} />
            </div>
            <span className="text-xs font-semibold text-slate-700 sm:text-sm">
              Statement
            </span>
          </button>

          <button
            onClick={() => setShowFilterModal(true)}
            className="group flex flex-col items-center gap-1 sm:gap-2"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-transform group-active:scale-95 sm:h-14 sm:w-14">
              <MdFilterList size={isMobile ? 20 : 28} />
            </div>
            <span className="text-xs font-semibold text-slate-700 sm:text-sm">
              {isMobile ? 'Filter' : 'Filter'}
            </span>
          </button>
        </div>
      </section>

      {/* Transactions Container */}
      <section className="flex flex-1 flex-col overflow-hidden rounded-t-[2rem] border-t border-slate-100 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.03)] sm:rounded-t-3xl">
        <div className="flex-1 p-4 pb-0 sm:p-6">
          {/* Transactions Header */}
          <div className="sticky top-0 z-10 mb-4 flex items-center justify-between bg-white pb-2 sm:mb-6">
            {!showSearchBar ? (
              <>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                    Transactions
                  </h3>
                  {hasActiveFilters() && (
                    <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-white">
                      {filteredTransactions.length}
                    </span>
                  )}
                </div>
                <div className="flex gap-1 sm:gap-2">
                  {hasActiveFilters() && !isMobile && (
                    <button
                      onClick={clearAllFilters}
                      className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={handleSearchToggle}
                    className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
                  >
                    <MdSearch size={isMobile ? 20 : 22} />
                  </button>
                  <button
                    onClick={() => setShowFilterModal(true)}
                    className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
                  >
                    <MdFilterList size={isMobile ? 20 : 22} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex w-full items-center gap-2">
                <div className="relative flex-1">
                  <MdSearch
                    className="absolute left-3 top-1/2 -translate-y-1/2 transform text-slate-400"
                    size={isMobile ? 18 : 20}
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
                    className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {filterState.searchQuery && (
                    <button
                      onClick={() =>
                        setFilterState((prev) => ({...prev, searchQuery: ''}))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 transform text-slate-400 hover:text-slate-600"
                    >
                      <MdClose size={isMobile ? 18 : 20} />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleSearchToggle}
                  className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
                >
                  <MdClose size={isMobile ? 20 : 22} />
                </button>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="mb-4 flex flex-wrap gap-2">
              {isMobile && (
                <button
                  onClick={clearAllFilters}
                  className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
                >
                  Clear All
                </button>
              )}
              {filterState.searchQuery && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-800">
                  "{filterState.searchQuery}"
                  <button
                    onClick={() =>
                      setFilterState((prev) => ({...prev, searchQuery: ''}))
                    }
                    className="ml-1 hover:text-blue-600"
                  >
                    <MdClose size={12} />
                  </button>
                </span>
              )}
              {filterState.transactionType !== 'ALL' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-800">
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
                    <MdClose size={12} />
                  </button>
                </span>
              )}
              {filterState.status !== 'ALL' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800">
                  {filterState.status}
                  <button
                    onClick={() =>
                      setFilterState((prev) => ({...prev, status: 'ALL'}))
                    }
                    className="ml-1 hover:text-amber-600"
                  >
                    <MdClose size={12} />
                  </button>
                </span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-4 pb-20 sm:gap-6 sm:pb-24">
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <MdDescIcon size={48} className="mb-4 text-slate-300" />
                <p className="text-slate-500">No transactions found</p>
                <p className="mt-1 text-center text-sm text-slate-400">
                  {hasActiveFilters()
                    ? 'Try changing your filters or search query'
                    : 'Your transaction history will appear here'}
                </p>
                {hasActiveFilters() && (
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {Object.entries(groupedTransactions).map(
                  ([dateLabel, dateTransactions]) => (
                    <div key={dateLabel}>
                      <h4 className="mb-3 pl-1 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:mb-4">
                        {dateLabel}
                      </h4>
                      <div className="flex flex-col gap-3 sm:gap-4">
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

                          return (
                            <TransactionItem
                              key={transaction.id}
                              title={title}
                              subtitle={subtitle}
                              amount={amount}
                              isPositive={isPositive}
                              icon={icon}
                              bgClass={bgClass}
                              statusBadge={getStatusBadge(transaction)}
                              isMobile={isMobile}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ),
                )}

                {/* See More/Less Button */}
                {filteredTransactions.length > getInitialTransactionCount() && (
                  <div className="pt-4 text-center">
                    <button
                      onClick={() =>
                        setShowAllTransactions(!showAllTransactions)
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
                    >
                      {showAllTransactions ? (
                        <>
                          <FaChevronUp size={18} />
                          Show Less
                        </>
                      ) : (
                        <>
                          <FaChevronDown size={18} />
                          See More Transactions
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Filter Modal - Responsive */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm sm:items-center sm:justify-center">
          <div
            className={`w-full ${isMobile ? 'h-[85vh]' : 'max-h-[85vh]'} ${isTablet ? 'max-w-2xl' : 'sm:max-w-md'} overflow-hidden rounded-t-3xl bg-white sm:rounded-2xl`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <MdFilterList size={24} className="text-primary" />
                <h3 className="text-xl font-bold text-slate-900">
                  Filter Transactions
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters() && (
                  <button
                    onClick={clearAllFilters}
                    className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-200"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="rounded-full p-2 hover:bg-slate-100"
                >
                  <MdClose size={24} />
                </button>
              </div>
            </div>

            <div
              className={`h-full overflow-y-auto ${isMobile ? 'p-4' : 'p-6'}`}
            >
              <div className="space-y-6 sm:space-y-8">
                {/* Transaction Type Filter */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 sm:mb-4">
                    <MdSwapVert />
                    Transaction Type
                  </h4>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                        className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors sm:px-4 sm:py-3 ${
                          filterState.transactionType === type
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {type === 'ALL' ? 'All Types' : type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 sm:mb-4">
                    <MdCheckCircle />
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
                        className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors sm:px-4 sm:py-3 ${
                          filterState.status === status
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {status === 'ALL'
                          ? 'All Status'
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
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 sm:mb-4">
                    <MdCalendarToday />
                    Date Range
                  </h4>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                          className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors sm:px-4 sm:py-3 ${
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
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 sm:mb-4">
                    <MdAttachMoney />
                    Amount Range
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500">
                        Min Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-slate-400">
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
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500">
                        Max Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-slate-400">
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
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={clearAllFilters}
                  className="rounded-xl border-2 border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:py-3.5"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 sm:py-3.5"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons for Mobile */}
      {isMobile && (
        <>
          <button
            onClick={generatePDF}
            className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30 transition-transform hover:scale-105"
          >
            <MdPictureAsPdf size={20} />
          </button>
          {hasActiveFilters() && (
            <button
              onClick={() => setShowFilterModal(true)}
              className="fixed bottom-32 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105"
            >
              <MdFilterList size={20} />
            </button>
          )}
        </>
      )}
    </div>
  );
};

const TransactionItem: React.FC<{
  title: string;
  subtitle: string;
  amount: string;
  icon: React.ReactNode;
  bgClass: string;
  isPositive?: boolean;
  statusBadge?: React.ReactNode;
  isMobile?: boolean;
}> = ({
  title,
  subtitle,
  amount,
  icon,
  bgClass,
  isPositive,
  statusBadge,
  isMobile,
}) => (
  <div className="group flex cursor-pointer items-center justify-between rounded-xl p-2 transition-colors hover:bg-slate-50 sm:p-3">
    <div className="flex items-center gap-3 sm:gap-4">
      <div
        className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-xl ${bgClass} flex items-center justify-center sm:h-12 sm:w-12 sm:rounded-2xl`}
      >
        {icon}
      </div>
      <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-slate-900 sm:text-base">
            {title}
          </span>
          {statusBadge}
        </div>
        <span className="truncate text-xs font-medium text-slate-500 sm:text-sm">
          {subtitle}
        </span>
      </div>
    </div>
    <div className="flex-shrink-0 pl-2">
      <span
        className={`whitespace-nowrap text-sm font-bold sm:text-base ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}
      >
        {isMobile && amount.length > 10
          ? amount.replace('+ ', '+').replace('- ', '-')
          : amount}
      </span>
    </div>
  </div>
);

export default AccountScreen;
