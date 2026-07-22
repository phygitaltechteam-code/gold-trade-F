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
    return `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;
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

  console.log('Query Status - isLoading:', isLoading);
  console.log('Query Status - isError:', isError);
  console.log('Query Status - error:', error);
  console.log('Full API Response:', apiData);

  // Process commission history from API
  const commissionHistoryList = useMemo(() => {
    const history = apiData?.data?.history || apiData?.history || [];
    console.log('Commission History Raw:', history);
    return history.map((item: any, index: number) => ({
      sr: index + 1,
      id: item.id,
      amount: parseAmount(item.amount),
      type: item.type || 'TRANSFER',
      createdAt: item.createdAt,
      formattedCreatedAt: formatDateTime(item.createdAt),
      superBrokerId: item.superBrokerId,
      brokerId: item.brokerId,
      companyId: item.companyId,
    }));
  }, [apiData]);

  // Process paid history from API
  const paidHistoryList = useMemo(() => {
    const paidHistory = apiData?.data?.paidHistory || apiData?.paidHistory || [];
    console.log('Paid History Raw:', paidHistory);
    return paidHistory.map((item: any, index: number) => ({
      sr: index + 1,
      id: item.id,
      amount: parseAmount(item.amount),
      type: 'PAID',
      createdAt: item.createdAt,
      formattedCreatedAt: formatDateTime(item.createdAt),
      superBrokerId: item.superBrokerId,
      brokerId: item.brokerId,
    }));
  }, [apiData]);

  // Filter data by date range - shows all data when filters are empty
  const filteredCommissionList = useMemo(() => {
    if (!fromDate && !toDate) return commissionHistoryList;

    return commissionHistoryList.filter((item: any) => {
      if (!item.createdAt) return true;
      const itemDate = new Date(item.createdAt).toISOString().split('T')[0];

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
      if (!item.createdAt) return true;
      const itemDate = new Date(item.createdAt).toISOString().split('T')[0];

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

  // Calculate totals from filtered data
  const totalCommission = filteredCommissionList.reduce(
    (sum, item) => sum + parseAmount(item.amount),
    0,
  );
  const totalPaid = filteredPaidList.reduce(
    (sum, item) => sum + parseAmount(item.amount),
    0,
  );
  const pendingCommission = totalCommission - totalPaid;

  // Clear filters
  const clearFilters = () => {
    setFromDate('');
    setToDate('');
  };

  // Commission History Columns
  const commissionColumns = [
    { header: 'Date & Time', accessor: 'formattedCreatedAt' },
    {
      header: 'Type',
      accessor: 'type',
      render: (item: any) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${item.type === 'TRANSFER'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            : item.type === 'CREDIT'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
              : item.type === 'DEBIT'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
            }`}
        >
          {item.type}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (item: any) => {
        const amount = parseAmount(item.amount);
        const isCredit = item.type === 'CREDIT' || item.type === 'TRANSFER';
        const isDebit = item.type === 'DEBIT';
        return (
          <span
            className='text-gray-900'
          >
            {isCredit ? '+' : isDebit ? '-' : ''} {formatIndianCurrency(amount)}
          </span>
        );
      },
    },
  ];

  // Paid History Columns
  const paidColumns = [
    { header: 'Date & Time', accessor: 'formattedCreatedAt' },
    {
      header: 'Type',
      accessor: 'type',
      render: () => (
        <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900 dark:text-green-300">
          PAID
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (item: any) => {
        const amount = parseAmount(item.amount);
        return (
          <span className=" text-gray-900">
            {formatIndianCurrency(amount)}
          </span>
        );
      },
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
            Super Broker Commission History.
          </h1>
          <p className="text-sm text-slate-500">
            Track and manage generated commission records
          </p>
        </div>
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
              className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${activeTab === 'commission'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-bodydark2'
                }`}
            >
              Commission History ({filteredCommissionList.length})
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${activeTab === 'paid'
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