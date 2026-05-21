import React, {useState} from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';

const mockPaymentData = [
  {
    sr: 1,
    date: '2026-05-15',
    commissionGenerated: 18550,
    paidAmount: 0,
    paidDate: '-',
    status: 'Pending',
  },
  {
    sr: 2,
    date: '2026-05-10',
    commissionGenerated: 12450,
    paidAmount: 12450,
    paidDate: '2026-05-12',
    status: 'Paid',
  },
  {
    sr: 3,
    date: '2026-05-01',
    commissionGenerated: 9800,
    paidAmount: 9800,
    paidDate: '2026-05-03',
    status: 'Paid',
  },
  {
    sr: 4,
    date: '2026-04-15',
    commissionGenerated: 15600,
    paidAmount: 15600,
    paidDate: '2026-04-17',
    status: 'Paid',
  },
  {
    sr: 5,
    date: '2026-04-01',
    commissionGenerated: 11200,
    paidAmount: 11200,
    paidDate: '2026-04-04',
    status: 'Paid',
  },
];

export default function BrokerPaymentHistory() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const paymentColumns = [
    {header: 'Sr', accessor: 'sr'},
    {header: 'Date', accessor: 'date'},
    {
      header: 'Commission Generated',
      accessor: 'commissionGenerated',
      render: (item: any) => `₹${item.commissionGenerated.toLocaleString()}`,
    },
    {
      header: 'Paid Amount',
      accessor: 'paidAmount',
      render: (item: any) => `₹${item.paidAmount.toLocaleString()}`,
    },
    {header: 'Paid Date', accessor: 'paidDate'},
    {
      header: 'Status',
      accessor: 'status',
      render: (item: any) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            item.status === 'Paid'
              ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
              : 'border border-amber-100 bg-amber-50 text-amber-600'
          }`}
        >
          {item.status}
        </span>
      ),
    },
  ];

  // Filtering Logic
  const filteredData = mockPaymentData.filter((row) => {
    if (statusFilter !== 'ALL' && row.status !== statusFilter) return false;
    if (startDate && row.date < startDate) return false;
    if (endDate && row.date > endDate) return false;
    return true;
  });

  // Calculate totals
  const totalGenerated = filteredData.reduce(
    (sum, item) => sum + item.commissionGenerated,
    0,
  );
  const totalSettled = filteredData.reduce(
    (sum, item) => sum + item.paidAmount,
    0,
  );
  const totalPending = filteredData
    .filter((item) => item.status === 'Pending')
    .reduce((sum, item) => sum + item.commissionGenerated, 0);

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] p-4 md:p-6">
      {/* Title */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Broker Payment History
          </h1>
          <p className="text-sm text-slate-500">
            View and track commission payouts and settlements
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col rounded-xl border border-stroke bg-white p-6 shadow-default transition-shadow hover:shadow-md dark:border-strokedark dark:bg-boxdark">
          <span className="text-gray-500 text-sm font-semibold">
            Total Generated Commission
          </span>
          <h4 className="mt-2 text-2xl font-bold text-slate-900">
            ₹{totalGenerated.toLocaleString()}
          </h4>
        </div>
        <div className="flex flex-col rounded-xl border border-stroke bg-white p-6 shadow-default transition-shadow hover:shadow-md dark:border-strokedark dark:bg-boxdark">
          <span className="text-gray-500 text-sm font-semibold">
            Total Settled Amount
          </span>
          <h4 className="mt-2 text-2xl font-bold text-emerald-600">
            ₹{totalSettled.toLocaleString()}
          </h4>
        </div>
        <div className="flex flex-col rounded-xl border border-stroke bg-white p-6 shadow-default transition-shadow hover:shadow-md dark:border-strokedark dark:bg-boxdark">
          <span className="text-gray-500 text-sm font-semibold">
            Unsettled Balance
          </span>
          <h4 className="mt-2 text-2xl font-bold text-orange-500">
            ₹{totalPending.toLocaleString()}
          </h4>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <h3 className="text-lg font-bold text-slate-900">Payment Payouts</h3>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">
                Status:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 active:border-orange-500"
              >
                <option value="ALL">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">
                From:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 active:border-orange-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500 active:border-orange-500"
              />
            </div>
            {(startDate || endDate || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setStatusFilter('ALL');
                }}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <GenericTable
            data={filteredData}
            columns={paymentColumns}
            paginationOff={true}
          />
        </div>
      </div>
    </div>
  );
}
