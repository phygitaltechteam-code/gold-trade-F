
import React, {useState, useMemo} from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {useGetTransactionLedger} from '@/lib/react-query/transactionledger';
import { RefreshCcw } from 'lucide-react';

const TransactionLedger = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const {data: transactionLedgerData , refetch} = useGetTransactionLedger();

  // Format quantity/lot as "qty/lotSize"
  const formatQtyLot = (item) => {
    if (!item) return '-';
    const qty = item.qty || item.Qty || 0;
    const lotSize = item.lotSize || item.lotSize || 0;
    // If lotSize exists and is different from qty, show as "qty/lot"
    if (lotSize && lotSize !== qty) {
      return `${qty}/${lotSize}`;
    }
    // If only qty exists or they're the same, just show qty
    return qty;
  };

  // Format P&L with proper sign and color
 // Format P&L with proper sign and color
const formatPnL = (item) => {
  const pnl = item.pnl || item['p&l'] || 0;
  const sign = pnl > 0 ? '+' : '';
  // ✅ Fix: Show only 2 decimal places
  return `${sign}${Number(pnl).toFixed(2)}`;
};

  // Base columns - shows main information
  const baseColumns = [
    {header: 'Date & Time', accessor: 'dateTime'},
    {header: 'Customer Name', accessor: 'customerName'},
    {header: 'Script', accessor: 'script'},
    {header: 'Qty/Lot', accessor: (item) => formatQtyLot(item)},
    {header: 'Buy Price', accessor: 'buyPrice'},
    {header: 'Sell Price', accessor: 'sellPrice'},
    {header: 'Status', accessor: 'status'},
    {header: 'P&L', accessor: (item) => formatPnL(item)},
  // ];

  // // Full detailed view columns
  // const expandedColumns = [
    {header: 'Buy Time', accessor: 'buyTime'},
    {header: 'Sell Time', accessor: 'sellTime'},
    {header: 'Admin Commission', accessor: 'companyCommission'},
    {header: 'Super Broker Commission', accessor: 'superBrokerCommission'},
    {header: 'Broker Commission', accessor: 'brokerCommission'},
  ];

  // Extract data array safely
  const getTransactionData = () => {
    if (!transactionLedgerData) return [];

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

  // Filter data by date range and status
  const filterData = (data) => {
    if (!Array.isArray(data)) return [];
    
    return data.filter((item) => {
      // 1. Filter by Status
      if (statusFilter) {
        const itemStatus = item.status?.toLowerCase() || '';
        const filterVal = statusFilter.toLowerCase();
        if (filterVal === 'close' || filterVal === 'closed') {
          if (itemStatus !== 'close' && itemStatus !== 'closed') return false;
        } else if (itemStatus !== filterVal) {
          return false;
        }
      }
      
      // 2. Filter by Date
      if (ledgerStartDate || ledgerEndDate) {
        const itemDate = item.dateTime?.split('T')[0];
        if (itemDate) {
          if (ledgerStartDate && itemDate < ledgerStartDate) return false;
          if (ledgerEndDate && itemDate > ledgerEndDate) return false;
        }
      }
      
      return true;
    });
  };

  const transactionData = getTransactionData();
  const filteredData = filterData(transactionData);
  // const columns = isExpanded ? expandedColumns : baseColumns;

  return (
    <div className="mx-auto w-full p-4 md:p-6 bg-[#f8fafc]">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
          Transaction Ledger.
        </h2>
      </div>

      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h3 className="text-lg font-semibold text-black dark:text-white m-2">
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
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-black dark:text-white">
                  Status:
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded border border-stroke bg-transparent px-3 py-1.5 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="">All</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              {(ledgerStartDate || ledgerEndDate || statusFilter) && (
                <button
                  onClick={() => {
                    setLedgerStartDate('');
                    setLedgerEndDate('');
                    setStatusFilter('');
                  }}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded px-3 py-1.5 text-sm font-medium transition-colors dark:bg-meta-4 dark:text-white dark:hover:bg-meta-3"
                >
                  Clear
                </button>
              )}
              {/* <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 mr-2"
              >
                {isExpanded ? 'View Less' : 'View More'}
              </button> */}
               <button
                onClick={() =>refetch() }
                className="rounded bg-orange-500 flex px-1 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 mr-2"
              >
                <RefreshCcw size={20}/>Refresh
              </button>
              
            </div>
          </div>
          <div className="overflow-x-auto">
            <GenericTable
              data={filteredData}
              columns={baseColumns}
              // paginationOff={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionLedger;