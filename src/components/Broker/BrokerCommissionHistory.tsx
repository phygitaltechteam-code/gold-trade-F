import React, { useState } from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';

const mockLedgerData = [
  {
    sr: 1,
    dateTime: '2026-05-18 10:30:15',
    customerName: 'Aarav Mehta',
    brokerName: 'Rajesh Kumar',
    transactionId: 'TXN-908123',
    stript: 'GOLD-2026',
    orderType: 'BUY',
    holdingType: 'DELIVERY',
    qty: 5,
    price: 61250,
    status: 'Completed',
    transactionAmount: 306250,
    totalAmount: 306500,
    paidAmount: 306500,
    marginAmount: 0,
    totalCommission: 7656,
    brokerCommission: 4593,
    superBrokerCommission: 3063,
    paymentStatus: 'Paid',
  },
  {
    sr: 2,
    dateTime: '2026-05-17 14:15:22',
    customerName: 'Isha Patel',
    brokerName: 'Rajesh Kumar',
    transactionId: 'TXN-908124',
    stript: 'SILVER-2026',
    orderType: 'BUY',
    holdingType: 'MARGIN',
    qty: 10,
    price: 74200,
    status: 'Completed',
    transactionAmount: 742000,
    totalAmount: 742500,
    paidAmount: 148500,
    marginAmount: 594000,
    totalCommission: 18550,
    brokerCommission: 11130,
    superBrokerCommission: 7420,
    paymentStatus: 'Pending',
  },
  {
    sr: 3,
    dateTime: '2026-05-15 11:45:10',
    customerName: 'Karan Singh',
    brokerName: 'Rajesh Kumar',
    transactionId: 'TXN-908125',
    stript: 'GOLD-2026',
    orderType: 'SELL',
    holdingType: 'INTRADAY',
    qty: 2,
    price: 61400,
    status: 'Completed',
    transactionAmount: 122800,
    totalAmount: 122900,
    paidAmount: 122900,
    marginAmount: 0,
    totalCommission: 3070,
    brokerCommission: 1842,
    superBrokerCommission: 1228,
    paymentStatus: 'Paid',
  },
  {
    sr: 4,
    dateTime: '2026-05-14 09:20:05',
    customerName: 'Rohan Sharma',
    brokerName: 'Rajesh Kumar',
    transactionId: 'TXN-908126',
    stript: 'GOLD-2026',
    orderType: 'BUY',
    holdingType: 'DELIVERY',
    qty: 8,
    price: 61100,
    status: 'Completed',
    transactionAmount: 488800,
    totalAmount: 489200,
    paidAmount: 489200,
    marginAmount: 0,
    totalCommission: 12220,
    brokerCommission: 7332,
    superBrokerCommission: 4888,
    paymentStatus: 'Paid',
  },
  {
    sr: 5,
    dateTime: '2026-05-12 16:35:40',
    customerName: 'Sneha Reddy',
    brokerName: 'Rajesh Kumar',
    transactionId: 'TXN-908127',
    stript: 'SILVER-2026',
    orderType: 'SELL',
    holdingType: 'DELIVERY',
    qty: 15,
    price: 74500,
    status: 'Completed',
    transactionAmount: 1117500,
    totalAmount: 1118250,
    paidAmount: 1118250,
    marginAmount: 0,
    totalCommission: 27938,
    brokerCommission: 16763,
    superBrokerCommission: 11175,
    paymentStatus: 'Pending',
  }
];

export default function BrokerCommissionHistory() {
  const [isLedgerExpanded, setIsLedgerExpanded] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const baseLedgerColumns = [
    { header: 'Sr', accessor: 'sr' },
    { header: 'Date/Time', accessor: 'dateTime' },
    { header: 'Transaction ID', accessor: 'transactionId' },
    { header: 'Stript', accessor: 'stript' },
    { header: 'Transaction Amount', accessor: 'transactionAmount' },
    { header: 'Broker Commission', accessor: 'brokerCommission' },
    { header: 'Status', accessor: 'status' },
  ];

  const expandedLedgerColumns = [
    { header: 'Sr', accessor: 'sr' },
    { header: 'Date/Time', accessor: 'dateTime' },
    { header: 'Customer Name', accessor: 'customerName' },
    { header: 'Broker Name', accessor: 'brokerName' },
    { header: 'Transaction ID', accessor: 'transactionId' },
    { header: 'Stript', accessor: 'stript' },
    { header: 'Order Type', accessor: 'orderType' },
    { header: 'Holding Type', accessor: 'holdingType'},
    { header: 'Qty' , accessor: 'qty'},
    { header: 'Price', accessor: 'price' },
    { header: 'Status', accessor: 'status' },
    { header: 'Transaction Amount', accessor: 'transactionAmount' },
    { header: 'Total Amount', accessor: 'totalAmount' },
    { header: 'Paid Amount', accessor: 'paidAmount' },
    { header: 'Margin Amount', accessor: 'marginAmount' },
    { header: 'Total Commission', accessor: 'totalCommission' },
    { header: 'Broker Commission', accessor: 'brokerCommission' },
    { header: 'Payment Status', accessor: 'paymentStatus' },
  ];

  const ledgerColumns = isLedgerExpanded ? expandedLedgerColumns : baseLedgerColumns;

  // Filter logic based on start and end dates
  const filteredData = mockLedgerData.filter((row) => {
    if (!startDate && !endDate) return true;
    const rowDate = row.dateTime.split(' ')[0];
    if (startDate && rowDate < startDate) return false;
    if (endDate && rowDate > endDate) return false;
    return true;
  });

  // Calculate totals for Stats Cards
  const totalBusiness = filteredData.reduce((sum, item) => sum + item.transactionAmount, 0);
  const totalCommission = filteredData.reduce((sum, item) => sum + item.brokerCommission, 0);
  const pendingCommission = filteredData
    .filter((item) => item.paymentStatus === 'Pending')
    .reduce((sum, item) => sum + item.brokerCommission, 0);

  return (
    <div className="w-full p-4 md:p-6 bg-[#f8fafc] min-h-screen">
      {/* Page Title */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Broker Commission History</h1>
          <p className="text-sm text-slate-500">Track and manage generated commission records</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col rounded-xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark hover:shadow-md transition-shadow">
          <span className="text-sm font-semibold text-gray-500">Total Business Volume</span>
          <h4 className="text-2xl font-bold text-slate-900 mt-2">
            ₹{totalBusiness.toLocaleString()}
          </h4>
        </div>
        <div className="flex flex-col rounded-xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark hover:shadow-md transition-shadow">
          <span className="text-sm font-semibold text-gray-500">Total Earned Commission</span>
          <h4 className="text-2xl font-bold text-green-500 mt-2">
            ₹{totalCommission.toLocaleString()}
          </h4>
        </div>
        <div className="flex flex-col rounded-xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark hover:shadow-md transition-shadow">
          <span className="text-sm font-semibold text-gray-500">Pending Commission payout</span>
          <h4 className="text-2xl font-bold text-orange-500 mt-2">
            ₹{pendingCommission.toLocaleString()}
          </h4>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h3 className="text-lg font-bold text-slate-900">Ledger Records</h3>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-orange-500 active:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-300 bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-orange-500 active:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsLedgerExpanded(!isLedgerExpanded)}
              className="rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-orange-600 hover:to-red-600 shadow-sm"
            >
              {isLedgerExpanded ? 'View Less Columns' : 'View All Columns'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <GenericTable
            data={filteredData}
            columns={ledgerColumns}
            paginationOff={true}
          />
        </div>
      </div>
    </div>
  );
}
