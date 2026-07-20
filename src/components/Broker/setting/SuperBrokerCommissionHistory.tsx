import React, {useState, useMemo} from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {useGetSuperBrokerHistory} from './SBHistoryApi';

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

export default function SuperBrokerCommissionHistory() {
  const [activeTab, setActiveTab] = useState<'commission' | 'paid'>(
    'commission',
  );

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
    // Check different possible data structures
    const history = apiData?.data?.history || apiData?.history || [];
    console.log('Commission History Raw:', history);
    return history.map((item: any, index: number) => ({
      sr: index + 1,
      id: item.id,
      amount: item.amount,
      type: item.type || 'TRANSFER',
      createdAt: formatDateTime(item.createdAt),
      superBrokerId: item.superBrokerId,
      brokerId: item.brokerId,
      companyId: item.companyId,
    }));
  }, [apiData]);

  // Process paid history from API
  const paidHistoryList = useMemo(() => {
    const paidHistory =
      apiData?.data?.paidHistory || apiData?.paidHistory || [];
    console.log('Paid History Raw:', paidHistory);
    return paidHistory.map((item: any, index: number) => ({
      sr: index + 1,
      id: item.id,
      amount: item.amount,
      type: 'PAID',
      createdAt: formatDateTime(item.createdAt),
      superBrokerId: item.superBrokerId,
      brokerId: item.brokerId,
    }));
  }, [apiData]);

  // Commission History Columns
  const commissionColumns = [
    {header: 'Date & Time', accessor: 'createdAt'},
    {
      header: 'Type',
      accessor: 'type',
      render: (item: any) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            item.type === 'TRANSFER'
              ? ' text-black-800  dark:text-black-300'
              : item.type === 'CREDIT'
                ? ' text-black -800 dark:text-black-300'
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
      render: (item: any) => (
        <span
          className={`${
            item.type === 'CREDIT' || item.type === 'TRANSFER'
              ? 'text-black'
              : item.type === 'DEBIT'
                ? 'text-red-600'
                : 'text-blue-600'
          }`}
        >
          {item.type === 'CREDIT' || item.type === 'TRANSFER'
            ? '+'
            : item.type === 'DEBIT'
              ? '-'
              : ''}{' '}
          ₹{parseFloat(item.amount).toLocaleString('en-IN')}
        </span>
      ),
    },
  ];

  // Paid History Columns
  const paidColumns = [
    {header: 'Date & Time', accessor: 'createdAt'},
    {
      header: 'Type',
      accessor: 'type',
      render: () => (
        <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold text-black dark:bg-green-900 dark:text-green-300">
          PAID
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (item: any) => (
        <span className="font-semibold text-black">
          ₹{parseFloat(item.amount).toLocaleString('en-IN')}
        </span>
      ),
    },
  ];

  // Calculate totals from API data
  const totalCommission = commissionHistoryList.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0,
  );
  const totalPaid = paidHistoryList.reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0,
  );
  const pendingCommission = totalCommission - totalPaid;

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
          <span className="text-gray-500 text-sm font-semibold">
            Total Commission
          </span>
          <h4 className="mt-2 text-2xl font-bold text-black">
            ₹{totalCommission.toLocaleString()}
          </h4>
        </div>
        <div className="flex flex-col rounded-xl border border-stroke bg-white p-6 shadow-default transition-shadow hover:shadow-md dark:border-strokedark dark:bg-boxdark">
          <span className="text-gray-500 text-sm font-semibold">
            Total Paid
          </span>
          <h4 className="mt-2 text-2xl font-bold text-black">
            ₹{totalPaid.toLocaleString()}
          </h4>
        </div>
        <div className="flex flex-col rounded-xl border border-stroke bg-white p-6 shadow-default transition-shadow hover:shadow-md dark:border-strokedark dark:bg-boxdark">
          <span className="text-gray-500 text-sm font-semibold">
            Pending Commission
          </span>
          <h4 className="mt-2 text-2xl font-bold text-black">
            ₹{pendingCommission.toLocaleString()}
          </h4>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex border-b border-stroke dark:border-strokedark">
          <button
            onClick={() => setActiveTab('commission')}
            className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${
              activeTab === 'commission'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-bodydark2'
            }`}
          >
            Commission History ({commissionHistoryList.length})
          </button>
          <button
            onClick={() => setActiveTab('paid')}
            className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${
              activeTab === 'paid'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-bodydark2'
            }`}
          >
            Paid History ({paidHistoryList.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'commission' ? (
            <div className="overflow-x-auto">
              <GenericTable
                data={commissionHistoryList}
                columns={commissionColumns}
                paginationOff={true}
                itemsPerPage={10}
                emptyMessage="No commission history found"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <GenericTable
                data={paidHistoryList}
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
