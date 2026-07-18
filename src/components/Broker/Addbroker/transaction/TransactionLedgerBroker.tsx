import React, {useState} from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';

const TransactionLedgerBroker = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');

  // Simplified view columns
  const baseColumns = [
    {header: 'Sr', accessor: 'sr'},
    {header: 'Date/Time', accessor: 'dateTime'},
    {header: 'Admin', accessor: 'admin'},
    {header: 'Transaction ID', accessor: 'transactionId'},
    {header: 'Stript', accessor: 'stript'},
    {header: 'Transaction Amount', accessor: 'transactionAmount'},
    {header: 'Status', accessor: 'status'},
  ];

  // Full detailed view columns
  const expandedColumns = [
    {header: 'Sr', accessor: 'sr'},
    {header: 'Date/Time', accessor: 'dateTime'},
    {header: 'Admin', accessor: 'admin'}, // NEW FIELD
    {header: 'Customer Name', accessor: 'customerName'},
    {header: 'Broker Name', accessor: 'brokerName'},
    {header: 'Transaction ID', accessor: 'transactionId'},
    {header: 'Stript', accessor: 'stript'},
    {header: 'Order Type', accessor: 'orderType'},
    {header: 'Holding Type', accessor: 'holdingType'},
    {header: 'Qty', accessor: 'qty'},
    {header: 'Price', accessor: 'price'},
    {header: 'Status', accessor: 'status'},
    {header: 'Transaction Amount', accessor: 'transactionAmount'},
    {header: 'Paid Amount', accessor: 'paidAmount'},
    {header: 'Margin Amount', accessor: 'marginAmount'},
    {header: 'Broker Commission', accessor: 'brokerCommission'},
    {header: 'Super Broker Commission', accessor: 'superBrokerCommission'},
    {header: 'Payment Status', accessor: 'paymentStatus'},
  ];

  const columns = isExpanded ? expandedColumns : baseColumns;

  return (
    <div className="mx-auto w-full p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
          Transaction Ledger
        </h2>
      </div>

      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Ledger Records
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-black dark:text-white">
                  From:
                </label>
                <input
                  type="date"
                  value={ledgerStartDate}
                  onChange={(e) => setLedgerStartDate(e.target.value)}
                  className="rounded border border-stroke bg-transparent px-3 py-1 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-black dark:text-white">
                  To:
                </label>
                <input
                  type="date"
                  value={ledgerEndDate}
                  onChange={(e) => setLedgerEndDate(e.target.value)}
                  className="rounded border border-stroke bg-transparent px-3 py-1 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>
              {(ledgerStartDate || ledgerEndDate) && (
                <button
                  onClick={() => {
                    setLedgerStartDate('');
                    setLedgerEndDate('');
                  }}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded px-3 py-1.5 text-sm font-medium transition-colors dark:bg-meta-4 dark:text-white dark:hover:bg-meta-3"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                {isExpanded ? 'View Less' : 'View More'}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <GenericTable
              data={[]}
              columns={columns}
              paginationOff={false} // Allow pagination if data gets large
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionLedgerBroker;
