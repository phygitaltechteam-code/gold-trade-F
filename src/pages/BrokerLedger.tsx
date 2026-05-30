import React, {useState, useMemo} from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {useGetBrokerTransactionLedger} from '@/lib/react-query/transactionledger';

const BrokerLedger = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');
  const {data: transactionLedgerData} = useGetBrokerTransactionLedger();

  // Simplified view columns
  const baseColumns = [
    {header: 'Transaction Type', accessor: 'sr'},
    {header: 'Date/Time', accessor: 'dateTime'},
    {header: 'Transaction ID', accessor: 'transactionId'},
    {header: 'Stript', accessor: 'stript'},
    {header: 'Transaction Amount', accessor: 'transactionAmount'},
    {header: 'Status', accessor: 'status'},
  ];

  // Full detailed view columns
  const expandedColumns = [
    {header: 'Transaction Type', accessor: 'sr'},
    {header: 'Date/Time', accessor: 'dateTime'},
    {header: 'Customer Name', accessor: 'customerName'},
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
    {header: 'Payment Status', accessor: 'paymentStatus'},
  ];

  // Extract data array safely
  const getTransactionData = () => {
    if (!transactionLedgerData) return [];

    // Handle different possible data structures
    if (Array.isArray(transactionLedgerData)) return transactionLedgerData;
    if (
      transactionLedgerData.data &&
      Array.isArray(transactionLedgerData.data?.data)
    )
      return transactionLedgerData.data.data;
    if (
      transactionLedgerData.data?.transactions &&
      Array.isArray(transactionLedgerData.data?.transactions)
    )
      return transactionLedgerData.data.transactions;

    return [];
  };

  // Filter data by date range
  const filterDataByDate = (data) => {
    if (!Array.isArray(data)) return [];
    if (!ledgerStartDate && !ledgerEndDate) return data;

    return data.filter((item) => {
      const itemDate = item.dateTime?.split(' ')[0];
      if (!itemDate) return true;
      if (ledgerStartDate && itemDate < ledgerStartDate) return false;
      if (ledgerEndDate && itemDate > ledgerEndDate) return false;
      return true;
    });
  };

  const transactionData = getTransactionData();
  const filteredData = filterDataByDate(transactionData);
  const columns = isExpanded ? expandedColumns : baseColumns;

  return (
    <div className="mx-auto w-full p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-black dark:text-white">
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
              data={filteredData}
              columns={columns}
              paginationOff={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerLedger;
