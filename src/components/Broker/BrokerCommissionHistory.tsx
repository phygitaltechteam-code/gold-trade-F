import React, { useState, useMemo } from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import { useGetBrokerHistory } from './setting/SBHistoryApi';
import { formatIndianCurrency } from '@/utils/formatIndianNumber';

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

export default function BrokerCommissionHistory() {
  const [activeTab, setActiveTab] = useState<'commission' | 'paid'>(
    'commission',
  );

  const {
    data: apiData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetBrokerHistory();

  console.log('Full API Response:', apiData);

  // Process commission history from API
  const commissionHistoryList = useMemo(() => {
    const history = apiData?.data?.commissionHistory || apiData?.commissionHistory || [];
    console.log('Commission History Raw:', history);
    return history.map((item: any, index: number) => ({
      sr: index + 1,
      id: item.id,
      date: item.date,
      commissionGenerated: item.commissionGenerated || 0,
      paidCommission: item.paidCommission || 0,
      pendingCommission: item.pendingCommission || 0,
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
      amount: item.amount || 0,
      formattedDate: item.date ? formatDateTime(item.date) : '-',
    }));
  }, [apiData]);

  // Get summary data
  const summary = apiData?.data?.summary || apiData?.summary || {};

  // Commission History Columns
  const commissionColumns = [

    {
      header: 'Date & Time',
      accessor: 'date',
      render: (item: any) => (
        <span className="text-sm">
          {item.formattedDate}
        </span>
      ),
    },
    {
      header: 'Generated Commission (₹)',
      accessor: 'commissionGenerated',
      render: (item: any) => (
        <span className="text-gray-900 text-sm font-semibold">
          {formatIndianCurrency(item.commissionGenerated)}
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
      header: 'Pending Commission (₹)',
      accessor: 'pendingCommission',
      render: (item: any) => (
        <span className="text-gray-900 text-sm font-semibold">
          {formatIndianCurrency(item.pendingCommission)}
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
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${item.status === 'PAID'
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
        <span className="text-sm">
          {item.formattedDate}
        </span>
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

  // Calculate totals from summary or list
  const totalCommission = summary.commissionGenerated ||
    commissionHistoryList.reduce((sum, item) => sum + item.commissionGenerated, 0);

  const totalPaid = summary.paidCommission ||
    commissionHistoryList.reduce((sum, item) => sum + item.paidCommission, 0);

  const pendingCommission = summary.pendingCommission ||
    commissionHistoryList.reduce((sum, item) => sum + item.pendingCommission, 0);

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-4 md:p-6">
      {/* Page Title */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Broker Commission History
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
          <span className="text-gray-500 text-sm font-semibold">
            Total Commission
          </span>
          <h4 className="mt-2 text-2xl font-bold text-black">
            {formatIndianCurrency(totalCommission)}
          </h4>
        </div>
        <div className="flex flex-col rounded-xl border border-stroke bg-white p-6 shadow-default transition-shadow hover:shadow-md dark:border-strokedark dark:bg-boxdark">
          <span className="text-gray-500 text-sm font-semibold">
            Total Paid
          </span>
          <h4 className="mt-2 text-2xl font-bold text-black">
            {formatIndianCurrency(totalPaid)}
          </h4>
        </div>
        <div className="flex flex-col rounded-xl border border-stroke bg-white p-6 shadow-default transition-shadow hover:shadow-md dark:border-strokedark dark:bg-boxdark">
          <span className="text-gray-500 text-sm font-semibold">
            Pending Commission
          </span>
          <h4 className="mt-2 text-2xl font-bold text-black">
            {formatIndianCurrency(pendingCommission)}
          </h4>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex border-b border-stroke dark:border-strokedark">
          <button
            onClick={() => setActiveTab('commission')}
            className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${activeTab === 'commission'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-bodydark2'
              }`}
          >
            Commission History ({commissionHistoryList.length})
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${activeTab === 'paid'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-bodydark2'
              }`}
          >
            Paid History ({paidHistoryList.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'commission' ? (
            commissionHistoryList.length > 0 ? (
              <div className="overflow-x-auto">
                <GenericTable
                  data={commissionHistoryList}
                  columns={commissionColumns}
                  paginationOff={true}
                  itemsPerPage={10}
                />
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-500">No commission history found</p>
              </div>
            )
          ) : paidHistoryList.length > 0 ? (
            <div className="overflow-x-auto">
              <GenericTable
                data={paidHistoryList}
                columns={paidColumns}
                paginationOff={true}
                itemsPerPage={10}
              />
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500">No paid history found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}