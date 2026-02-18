/* eslint-disable */
import React, {useMemo, useState, useRef, useEffect} from 'react';
import {
  MdArrowBack,
  MdSettings,
  MdTrendingUp,
  MdSwapHoriz,
  MdDescription,
  MdSearch,
  MdFilterList,
  MdAccountBalanceWallet,
  MdSwapVert,
  MdPerson,
  MdSchedule,
  MdCancel,
  MdCheckCircle,
  MdClose,
  MdChevronRight,
} from 'react-icons/md';
import {FaChevronDown, FaChevronUp} from 'react-icons/fa';
import {useNavigate} from '@tanstack/react-router';
import {AccountScreenProps} from './type';
import {jsPDF} from 'jspdf';
import 'jspdf-autotable';

// Define filter types (same as original)
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
  transactions = [],
  wallet,
  isLoading = false,
  error = null,
}) => {
  const navigate = useNavigate();

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

  // Navigate to transaction detail
  const handleTransactionClick = (transactionId: string) => {
    navigate({
      to: '/wallet/transferlist/$id',
      params: {id: transactionId},
    });
  };

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width >= 768 && width < 1024) {
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
    if (screenSize === 'mobile') return 5;
    if (screenSize === 'tablet') return 8;
    return 10;
  };

  // Check if we should show "See More" button
  const shouldShowSeeMore = useMemo(() => {
    const initialCount = getInitialTransactionCount();
    return filteredTransactions.length > initialCount;
  }, [filteredTransactions.length, screenSize]);

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

  // Helper to map transaction to the new item design
  const getTransactionItemProps = (transaction: any) => {
    const isCredit = transaction.type === 'CREDIT';
    const isPending = transaction.isPending;
    const isRejected = transaction.isRejected;

    // Determine icon and colors based on transaction type
    let Icon = MdAccountBalanceWallet;
    let iconBgClass = 'bg-slate-100';
    let colorClass = 'text-slate-600';
    let statusText = '';
    let badgeClass = '';

    const particular = transaction.particular?.toLowerCase() || '';
    if (particular.includes('sent money')) {
      Icon = MdSwapVert;
      iconBgClass = 'bg-red-100';
      colorClass = 'text-red-600';
    } else if (particular.includes('topup')) {
      Icon = MdAccountBalanceWallet;
      iconBgClass = 'bg-green-100';
      colorClass = 'text-green-600';
    } else if (transaction.beneficiary) {
      Icon = MdPerson;
      iconBgClass = 'bg-blue-100';
      colorClass = 'text-blue-600';
    }

    // Status badge
    if (isPending) {
      statusText = 'Pending';
      badgeClass = 'bg-yellow-100 text-yellow-800';
    } else if (isRejected) {
      statusText = 'Rejected';
      badgeClass = 'bg-red-100 text-red-800';
    } else {
      statusText = 'Approved';
      badgeClass = 'bg-green-100 text-green-800';
    }

    // Format date
    const date = new Date(transaction.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // Title
    let title = transaction.particular || 'Transaction';
    if (transaction.beneficiary) {
      title = `Transfer to ${transaction.beneficiary.fullName}`;
    }

    // Amount with sign
    const amountSign = isCredit ? '+' : '-';
    const amountColor = isCredit
      ? 'text-green-600 dark:text-green-400'
      : 'text-[#0d131c] dark:text-white';

    return {
      id: transaction.id,
      Icon,
      iconBgClass,
      colorClass,
      title,
      date: formattedDate,
      amount: transaction.amount,
      amountSign,
      amountColor,
      status: statusText,
      badgeClass,
      category: isCredit ? 'Credit' : 'Debit',
    };
  };

  // Generate PDF function (unchanged)
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
      getTransactionItemProps(transaction).title.substring(0, 30),
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-white">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="text-slate-600">Loading transactions...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
        <MdCancel size={48} className="mb-4 text-red-500" />
        <p className="font-medium text-red-600">Error loading transactions</p>
        <p className="mt-2 text-center text-sm text-slate-500">
          {error.message || 'Please try again later'}
        </p>
      </div>
    );
  }

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
            E Private Account
          </h2>
          <p className="text-xs text-slate-500">Available Balance</p>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100">
          {/* <MdSettings size={22} /> */}
        </button>
      </header>

      {/* Balance Section */}
      <section className="px-4 py-4">
        <h1 className="text-center text-2xl font-bold text-slate-900">
          {formatCurrency(totalBalance)}
        </h1>
        <div className="mt-2 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5">
            <MdTrendingUp className="text-blue-600" size={14} />
            <span className="text-xs font-medium text-blue-700">
              {filteredTransactions.length} transactions
            </span>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-4 px-4">
        <div className="grid grid-cols-3 gap-3">
          <button className="group flex flex-col items-center gap-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
              <MdSwapHoriz className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-700 sm:text-xs">
              Transfer
            </span>
          </button>

          <button
            onClick={() => navigate({to: '/eprivate/statement'})}
            className="group flex flex-col items-center gap-1"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-primary">
              <MdDescription className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-700 sm:text-xs">
              Statement
            </span>
          </button>

          <button
            onClick={() => setShowFilterModal(true)}
            className="group flex flex-col items-center gap-1"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600">
              <MdFilterList className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-medium text-slate-700 sm:text-xs">
              Filter
            </span>
          </button>
        </div>
      </section>

      {/* Transactions Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pb-20">
          {/* Search and Filter Bar */}
          <div className="sticky top-0 z-10 mb-4 bg-white pb-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Transactions</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleSearchToggle}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
                >
                  <MdSearch size={20} />
                </button>
                {hasActiveFilters() && (
                  <button
                    onClick={clearAllFilters}
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
                    placeholder="Search transactions..."
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

          {/* Active Filters */}
          {hasActiveFilters() && (
            <div className="mb-4 flex flex-wrap gap-2">
              {filterState.searchQuery && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  "{filterState.searchQuery}"
                  <button
                    onClick={() =>
                      setFilterState((prev) => ({...prev, searchQuery: ''}))
                    }
                    className="ml-1"
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
                    className="ml-1"
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
                    className="ml-1"
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
              <MdDescription size={48} className="mb-4 text-slate-300" />
              <p className="text-sm text-slate-500">No transactions found</p>
              {hasActiveFilters() && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {Object.entries(groupedTransactions).map(
                ([dateLabel, dateTransactions]) => (
                  <div key={dateLabel} className="mb-6">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {dateLabel}
                    </h4>
                    <div className="space-y-2">
                      {dateTransactions.map((transaction) => {
                        const item = getTransactionItemProps(transaction);

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleTransactionClick(item.id)}
                            className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-white p-3 transition-colors hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${item.iconBgClass} ${item.colorClass}`}
                              >
                                <item.Icon size={28} />
                              </div>
                              <div className="flex flex-col">
                                <p className="text-base font-semibold leading-tight text-[#0d131c] dark:text-white">
                                  {item.title}
                                </p>
                                <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                  {item.date}
                                </p>
                                {item.status && (
                                  <div className="mt-1">
                                    <span
                                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${item.badgeClass}`}
                                    >
                                      {item.status === 'Pending' && (
                                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
                                      )}
                                      {item.status === 'Approved' && (
                                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                      )}
                                      {item.status === 'Rejected' && (
                                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                      )}
                                      {item.status}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-end">
                              <div className="text-right">
                                <p
                                  className={`text-sm font-semibold sm:text-base ${item.amountColor}`}
                                >
                                  {item.amountSign}${item.amount.toFixed(2)}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 sm:text-xs">
                                  {item.category}
                                </p>
                              </div>

                              <div className="mt-1 flex items-center gap-0.5 text-[10px] text-slate-500 dark:text-slate-400 sm:mt-2 sm:gap-1 sm:text-xs">
                                <span>View</span>
                                <MdChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ),
              )}

              {/* Show More/Less Button */}
              {shouldShowSeeMore && (
                <div className="sticky bottom-4 mt-6">
                  <button
                    onClick={() => setShowAllTransactions(!showAllTransactions)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-lg"
                  >
                    {showAllTransactions ? (
                      <>
                        <FaChevronUp size={14} />
                        Show Less
                      </>
                    ) : (
                      <>
                        <FaChevronDown size={14} />
                        Show More Transactions
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
                            : 'bg-slate-100 text-slate-700'
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
                            : 'bg-slate-100 text-slate-700'
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
                              : 'bg-slate-100 text-slate-700'
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
              </div>
            </div>

            {/* Filter Actions */}
            <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={clearAllFilters}
                  className="rounded-lg border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="rounded-lg bg-primary py-3 text-sm font-semibold text-white"
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
