// import React, {useState, useMemo} from 'react';
// import GenericTable from '@/components/Forms/Table/GenericTable';
// import {useGetSuperBrokerTransactionLedger} from '@/lib/react-query/transactionledger';

// const SuperBrokerTransactionLedger = () => {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [ledgerStartDate, setLedgerStartDate] = useState('');
//   const [ledgerEndDate, setLedgerEndDate] = useState('');
//   const {data: transactionLedgerData} = useGetSuperBrokerTransactionLedger();
//   console.log('Raw API Response:', transactionLedgerData);

//   // Simplified view columns
//   const baseColumns = [
//     // {header: 'Transaction Type', accessor: 'sr'},
//     {header: 'Date/Time', accessor: 'dateTime'},
//     // {header: 'Admin', accessor: 'admin'},
//     // {header: 'Transaction ID', accessor: 'transactionId'},
//     {header: 'Stript', accessor: 'stript'},
//     {header: 'Transaction Amount', accessor: 'transactionAmount'},
//     // {header: 'Status', accessor: 'status'},
//   ];

//   // Full detailed view columns
//   const expandedColumns = [
//     // {header: 'Transaction Type', accessor: 'sr'},
//     {header: 'Date/Time', accessor: 'dateTime'},
//     // {header: 'Admin', accessor: 'admin'},
//     {header: 'Customer Name', accessor: 'customerName'},
//     {header: 'Broker Name', accessor: 'brokerName'},
//     // {header: 'Transaction ID', accessor: 'transactionId'},
//     {header: 'Stript', accessor: 'stript'},
//     {header: 'Order Type', accessor: 'orderType'},
//     {header: 'Holding Type', accessor: 'holdingType'},
//     {header: 'Qty', accessor: 'qty'},
//     {header: 'Price', accessor: 'price'},
//     // {header: 'Status', accessor: 'status'},
//     {header: 'Transaction Amount', accessor: 'transactionAmount'},
//     {header: 'Paid Amount', accessor: 'paidAmount'},
//     {header: 'Margin Amount', accessor: 'marginAmount'},
//     {header: 'Broker Commission', accessor: 'brokerCommission'},
//     {header: 'Payment Status', accessor: 'paymentStatus'},
//   ];

//   // Extract data array safely
//   const getTransactionData = () => {
//     console.log('transactionLedgerData:', transactionLedgerData);
//     if (!transactionLedgerData) return [];

//     // Handle different possible data structures
//     if (Array.isArray(transactionLedgerData)) return transactionLedgerData;
//     if (
//       transactionLedgerData.data &&
//       Array.isArray(transactionLedgerData.data?.data)
//     )
//       return transactionLedgerData.data.data;
//     if (
//       transactionLedgerData.data?.transactions &&
//       Array.isArray(transactionLedgerData.data?.transactions)
//     )
//       return transactionLedgerData.data.transactions;

//     return [];
//   };

//   // Filter data by date range
//   const filterDataByDate = (data) => {
//     if (!Array.isArray(data)) return [];
//     if (!ledgerStartDate && !ledgerEndDate) return data;

//     return data.filter((item) => {
//       const itemDate = item.dateTime?.split(' ')[0];
//       if (!itemDate) return true;
//       if (ledgerStartDate && itemDate < ledgerStartDate) return false;
//       if (ledgerEndDate && itemDate > ledgerEndDate) return false;
//       return true;
//     });
//   };

//   const transactionData = getTransactionData();
//   console.log('Transaction Data:', transactionData);
//   const filteredData = filterDataByDate(transactionData);
//   console.log('Filtered Data:', filteredData);
//   const columns = isExpanded ? expandedColumns : baseColumns;

//   return (
//     <div className="mx-auto w-full p-4 md:p-6">
//       <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <h2 className="text-xl font-semibold text-black dark:text-white">
//           Transaction Ledger
//         </h2>
//       </div>

//       <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
//         <div className="">
//           <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
//             {/* <h3 className="text-lg font-semibold text-black dark:text-white">
//               Ledger Records
//             </h3> */}
//             <div className="flex flex-wrap items-center gap-3">
//               <div className="flex items-center gap-2">
//                 <label className="text-sm font-medium text-black dark:text-white">
//                   From:
//                 </label>
//                 <input
//                   type="date"
//                   value={ledgerStartDate}
//                   onChange={(e) => setLedgerStartDate(e.target.value)}
//                   className="rounded border border-stroke bg-transparent px-3 py-1 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
//                 />
//               </div>
//               <div className="flex items-center gap-2">
//                 <label className="text-sm font-medium text-black dark:text-white">
//                   To:
//                 </label>
//                 <input
//                   type="date"
//                   value={ledgerEndDate}
//                   onChange={(e) => setLedgerEndDate(e.target.value)}
//                   className="rounded border border-stroke bg-transparent px-3 py-1 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
//                 />
//               </div>
//               {(ledgerStartDate || ledgerEndDate) && (
//                 <button
//                   onClick={() => {
//                     setLedgerStartDate('');
//                     setLedgerEndDate('');
//                   }}
//                   className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded px-3 py-1.5 text-sm font-medium transition-colors dark:bg-meta-4 dark:text-white dark:hover:bg-meta-3"
//                 >
//                   Clear
//                 </button>
//               )}
//               <button
//                 onClick={() => setIsExpanded(!isExpanded)}
//                 className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
//               >
//                 {isExpanded ? 'View Less' : 'View More'}
//               </button>
//             </div>
//           </div>
//           <div className="overflow-x-auto">
//             <GenericTable
//               data={filteredData}
//               columns={columns}
//               paginationOff={false}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SuperBrokerTransactionLedger;

//Super Broker Transaction Ledger
import React, { useState } from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import { useGetSuperBrokerTransactionLedger } from '@/lib/react-query/transactionledger';
import { RefreshCcw } from 'lucide-react';

const SuperBrokerTransactionLedger = () => {
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');
  const { data: transactionLedgerResponse, isLoading, error, refetch } = useGetSuperBrokerTransactionLedger();
  console.log('Raw API Response:', transactionLedgerResponse);

  // Format Qty/Lot
  const formatQtyLot = (item) => {
    if (!item) return '-';
    const qty = item.qty ?? item.Qty ?? 0;
    const lotSize = item.lotSize ?? item.lotsize ?? 0;
    // If lotSize exists and is different from qty, show as "qty/lot"
    if (lotSize && lotSize !== qty) {
      return `${qty}/${lotSize}`;
    }
    // If only qty exists or they're the same, just show qty
    return qty;
  };

  // All columns - displaying all data (removed View More toggle)
  const allColumns = [
    { header: 'Date & Time', accessor: 'dateTime' },
    { header: 'Customer Name', accessor: 'customerName' },
    { header: 'Broker Name', accessor: 'brokerName' },
    { header: 'Script', accessor: 'script' },
    {
      header: 'Qty/Lot',
      accessor: (item) => formatQtyLot(item),
    },
    { header: 'Buy Price', accessor: 'buyPrice' },
    { header: 'Sell Price', accessor: 'sellPrice' },
    { header: 'Buy Time', accessor: 'buyTime' },
    { header: 'Sell Time', accessor: 'sellTime' },
    { header: 'Status', accessor: 'status' },
    { header: 'P&L', accessor: 'pnl' },
    { header: 'Super Broker Commission', accessor: 'superBrokerCommission' },
  ];

  // Extract data array safely from the response
  const getTransactionData = () => {
    console.log('transactionLedgerResponse:', transactionLedgerResponse);
    if (!transactionLedgerResponse) return [];

    // Response structure: data.data.data (as per your API response)
    if (transactionLedgerResponse?.data?.data && Array.isArray(transactionLedgerResponse.data.data)) {
      return transactionLedgerResponse.data.data;
    }

    return [];
  };

  // Filter data by date range
  const filterDataByDate = (data) => {
    if (!Array.isArray(data)) return [];
    if (!ledgerStartDate && !ledgerEndDate) return data;

    return data.filter((item) => {
      const itemDate = item.dateTime?.split('T')[0];
      if (!itemDate) return true;
      if (ledgerStartDate && itemDate < ledgerStartDate) return false;
      if (ledgerEndDate && itemDate > ledgerEndDate) return false;
      return true;
    });
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg font-semibold">Loading transaction data...</div>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center text-red-500">
          <div className="mb-2 text-lg font-semibold">Error loading data</div>
          <div>{error.message || 'Please try again later'}</div>
        </div>
      </div>
    );
  }

  const transactionData = getTransactionData();
  console.log('Transaction Data:', transactionData);

  const filteredData = filterDataByDate(transactionData);
  console.log('Filtered Data:', filteredData);

  return (
    <div className="mx-auto w-full p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          Transaction Ledger
        </h2>
        <div className="text-sm text-gray-500">
          Total Records: {filteredData.length}
        </div>
      </div>

      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="p-4">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
                  className="rounded bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-meta-4 dark:text-white dark:hover:bg-meta-3"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 rounded bg-orange-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                <RefreshCcw size={18} />
                Refresh
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <GenericTable
              data={filteredData}
              columns={allColumns}
              paginationOff={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperBrokerTransactionLedger;