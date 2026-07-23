import React, { useState, useMemo, useEffect } from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import { useGetSuperBrokerHistory } from './SBHistoryApi';
import { formatIndianCurrency } from '@/utils/formatIndianNumber';
import { Filter } from 'lucide-react';

// Format date function
const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
  } catch (error) {
    return 'N/A';
  }
};

// Helper function to safely parse amount
const parseAmount = (amount: any): number => {
  if (typeof amount === 'number') return amount;
  if (typeof amount === 'string') {
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export default function SuperBrokerCommissionHistory() {
  const [activeTab, setActiveTab] = useState<'commission' | 'paid'>('commission');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const {
    data: apiData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSuperBrokerHistory();

  console.log('Full API Response:', apiData);

  // Process commission history from API - Updated structure
  const commissionHistoryList = useMemo(() => {
    const history = apiData?.data?.commissionHistory || apiData?.commissionHistory || [];
    console.log('Commission History Raw:', history);
    return history.map((item: any, index: number) => ({
      sr: index + 1,
      id: item.id,
      date: item.date,
      commissionGenerated: parseAmount(item.commissionGenerated),
      pendingCommission: parseAmount(item.pendingCommission),
      paidCommission: parseAmount(item.paidCommission),
      paidDate: item.paidDate || null,
      status: item.status || 'PENDING',
      formattedDate: item.date ? formatDateTime(item.date) : '-',
      formattedPaidDate: item.paidDate ? formatDateTime(item.paidDate) : '-',
    }));
  }, [apiData]);

  // Process paid history from API
  const paidHistoryList = useMemo(() => {
    const paidHistory = apiData?.data?.paidHistory || apiData?.paidHistory || [];
    console.log('Paid History Raw:', paidHistory);
    return paidHistory.map((item: any, index: number) => ({
      sr: index + 1,
      id: item.id,
      date: item.date,
      amount: parseAmount(item.amount),
      formattedDate: item.date ? formatDateTime(item.date) : '-',
    }));
  }, [apiData]);

  // Get summary data
  const summary = apiData?.data?.summary || apiData?.summary || {};

  // Filter data by date range - shows all data when filters are empty
  const filteredCommissionList = useMemo(() => {
    if (!fromDate && !toDate) return commissionHistoryList;

    return commissionHistoryList.filter((item: any) => {
      if (!item.date) return true;
      const itemDate = new Date(item.date).toISOString().split('T')[0];

      if (fromDate && toDate) {
        return itemDate >= fromDate && itemDate <= toDate;
      }
      if (fromDate) {
        return itemDate >= fromDate;
      }
      if (toDate) {
        return itemDate <= toDate;
      }
      return true;
    });
  }, [commissionHistoryList, fromDate, toDate]);

  const filteredPaidList = useMemo(() => {
    if (!fromDate && !toDate) return paidHistoryList;

    return paidHistoryList.filter((item: any) => {
      if (!item.date) return true;
      const itemDate = new Date(item.date).toISOString().split('T')[0];

      if (fromDate && toDate) {
        return itemDate >= fromDate && itemDate <= toDate;
      }
      if (fromDate) {
        return itemDate >= fromDate;
      }
      if (toDate) {
        return itemDate <= toDate;
      }
      return true;
    });
  }, [paidHistoryList, fromDate, toDate]);

  // Calculate totals from summary or filtered data
  const totalCommission = summary.commissionGenerated || 
    filteredCommissionList.reduce((sum, item) => sum + item.commissionGenerated, 0);
  
  const totalPaid = summary.paidCommission || 
    filteredCommissionList.reduce((sum, item) => sum + item.paidCommission, 0);
  
  const pendingCommission = summary.pendingCommission || 
    filteredCommissionList.reduce((sum, item) => sum + item.pendingCommission, 0);

  // Clear filters
  const clearFilters = () => {
    setFromDate('');
    setToDate('');
  };

  // Commission History Columns - Updated
  const commissionColumns = [
    {
      header: 'Date & Time',
      accessor: 'date',
      render: (item: any) => (
        <span className="text-sm">{item.formattedDate}</span>
      ),
    },
    {
      header: 'Commission (₹)',
      accessor: 'commissionGenerated',
      render: (item: any) => (
        <span className="text-gray-900 text-sm font-semibold">
          {formatIndianCurrency(item.commissionGenerated)}
        </span>
      ),
    },
    {
      header: 'Pending Commission (₹)',
      accessor: 'pendingCommission',
      render: (item: any) => (
        <span className="text-gray-900 text-sm font-semibold">
          {formatIndianCurrency(item.pendingCommission)}
        </span>
      ),
    },
    {
      header: 'Paid Commission (₹)',
      accessor: 'paidCommission',
      render: (item: any) => (
        <span className="text-gray-900 text-sm font-semibold">
          {formatIndianCurrency(item.paidCommission)}
        </span>
      ),
    },
    {
      header: 'Paid Date',
      accessor: 'paidDate',
      render: (item: any) => (
        <span className="text-sm">
          {item.formattedPaidDate}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item: any) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            item.status === 'PAID'
              ? 'bg-green-100 text-green-700'
              : item.status === 'PENDING'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
          }`}
        >
          {item.status || 'PENDING'}
        </span>
      ),
    },
  ];

  // Paid History Columns
  const paidColumns = [
    {
      header: 'Date & Time',
      accessor: 'date',
      render: (item: any) => (
        <span className="text-sm">{item.formattedDate}</span>
      ),
    },
    {
      header: 'Amount (₹)',
      accessor: 'amount',
      render: (item: any) => (
        <span className="text-gray-900 text-sm font-semibold">
          {formatIndianCurrency(item.amount)}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">
            Error loading data: {error?.message || 'Something went wrong'}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-4 md:p-6">
      {/* Page Title */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Super Broker Commission History
          </h1>
          <p className="text-sm text-slate-500">
            Track and manage generated commission records
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col rounded-xl border border-stroke bg-white p-6 shadow-default transition-shadow hover:shadow-md dark:border-strokedark dark:bg-boxdark">
          <span className="text-sm font-semibold text-black dark:text-white">
            Total Commission
          </span>
          <h4 className="mt-2 text-2xl font-bold text-black dark:text-white">
            {formatIndianCurrency(totalCommission)}
          </h4>
        </div>
        <div className="flex flex-col rounded-xl border border-stroke bg-white p-6 shadow-default transition-shadow hover:shadow-md dark:border-strokedark dark:bg-boxdark">
          <span className="text-sm font-semibold text-black dark:text-white">
            Total Paid
          </span>
          <h4 className="mt-2 text-2xl font-bold text-black dark:text-white">
            {formatIndianCurrency(totalPaid)}
          </h4>
        </div>
        <div className="flex flex-col rounded-xl border border-stroke bg-white p-6 shadow-default transition-shadow hover:shadow-md dark:border-strokedark dark:bg-boxdark">
          <span className="text-sm font-semibold text-black dark:text-white">
            Pending Commission
          </span>
          <h4 className="mt-2 text-2xl font-bold text-black dark:text-white">
            {formatIndianCurrency(pendingCommission)}
          </h4>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center justify-between border-b border-stroke px-4 py-2 dark:border-strokedark">
          <div className="flex">
            <button
              onClick={() => setActiveTab('commission')}
              className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${
                activeTab === 'commission'
                  ? 'border-b-2 border-orange-500 text-orange-500'
                  : 'text-bodydark2'
              }`}
            >
              Commission History ({filteredCommissionList.length})
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${
                activeTab === 'paid'
                  ? 'border-b-2 border-orange-500 text-orange-500'
                  : 'text-bodydark2'
              }`}
            >
              Paid History ({filteredPaidList.length})
            </button>
          </div>

          {/* Date Filter - From/To */}
          <div className="flex flex-wrap items-center gap-3 py-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-black dark:text-white">
                From:
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded border border-stroke bg-transparent px-3 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-black dark:text-white">
                To:
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded border border-stroke bg-transparent px-3 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
            </div>

            {/* Clear Filters Button - Shows when filters are applied */}
            {(fromDate || toDate) && (
              <button
                onClick={clearFilters}
                className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Clear
              </button>
            )}

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="rounded-lg border border-stroke bg-white p-2 transition-colors hover:bg-gray-50 sm:hidden"
            >
              <Filter className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Filter - Expanded */}
        {showMobileFilter && (
          <div className="border-b border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-gray-800 sm:hidden">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-black dark:text-white">
                  From:
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="flex-1 rounded border border-stroke bg-transparent px-3 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-black dark:text-white">
                  To:
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="flex-1 rounded border border-stroke bg-transparent px-3 py-1 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              {(fromDate || toDate) && (
                <button
                  onClick={clearFilters}
                  className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        <div className="p-6">
          {activeTab === 'commission' ? (
            <div className="overflow-x-auto">
              <GenericTable
                data={filteredCommissionList}
                columns={commissionColumns}
                paginationOff={true}
                itemsPerPage={10}
                emptyMessage="No commission history found"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <GenericTable
                data={filteredPaidList}
                columns={paidColumns}
                paginationOff={true}
                itemsPerPage={10}
                emptyMessage="No paid history found"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}