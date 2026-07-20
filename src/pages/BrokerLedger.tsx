import React, {useState, useMemo} from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {useGetBrokerTransactionLedger} from '@/lib/react-query/transactionledger';
import { RefreshCcw } from 'lucide-react';
import { formatIndianCurrency } from '@/utils/formatIndianNumber';

const BrokerLedger = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const {data: transactionLedgerData,  refetch} = useGetBrokerTransactionLedger();

  // Format quantity/lot as "qty/lotSize"
  const formatQtyLot = (item) => {
    if (!item) return '-';
    const qty = item.qty || item.Qty || 0;
    const lotSize = item.lotSize || item.lotSize || 0;
    if (lotSize && lotSize !== qty) {
      return `${qty}/${lotSize}`;
    }
    return qty;
  };

  // Format P&L with proper sign
  const formatPnL = (item) => {
    const pnl = item.pnl || item['p&l'] || 0;
    if (pnl === 0) return '0';
    const sign = pnl > 0 ? '+' : '';
    return `${sign}${pnl}`;
  };

  // Format Date & Time onto two lines
  const renderDateTimeCell = (dt: any) => {
    if (!dt) return '-';
    try {
      const dateObj = new Date(dt);
      if (isNaN(dateObj.getTime())) return <span>{dt}</span>;

      const datePart = dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const timePart = dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      return (
        <div className="flex flex-col ">
          <span>{datePart}</span>
          <span className=" text-gray-500">{timePart.toLowerCase()}</span>
        </div>
      );
    } catch (e) {
      return <span>{dt}</span>;
    }
  };

  // Base columns - shows main information
  const baseColumns = [
    // {header: 'Date & Time', accessor: 'dateTime', render: renderDateTimeCell},
    {header: 'Trader Name', accessor: 'customerName'},
    {header: 'Script', accessor: 'script'},
    {header: 'Qty/Lot', accessor: (item) => formatQtyLot(item)},
    {header: 'Buy Price', accessor: 'buyPrice', render:(item:any)=>{return formatIndianCurrency(item?.buyPrice)}},
    {header: 'Sell Price', accessor: 'sellPrice', render:(item:any)=>{return formatIndianCurrency(item?.sellPrice)} },
    {header: 'P&L', accessor: (item:any) => formatIndianCurrency(item?.pnl)},
  
    // {header: 'Date & Time', accessor: 'dateTime', render: renderDateTimeCell},
    {header: 'Buy Time', accessor: 'buyTime', render: (item: any) => renderDateTimeCell(item.buyTime)},
    {header: 'Sell Time', accessor: 'sellTime', render: (item: any) => renderDateTimeCell(item.sellTime)},
    {header: 'Status', accessor: 'status'},
    ,{header: 'Broker Commission', accessor: (item:any) => formatIndianCurrency(item?.brokerCommission)},
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

  // Filter data by date and status
  const filterData = (data) => {
    if (!Array.isArray(data)) return [];
    if (!ledgerStartDate && !ledgerEndDate && !statusFilter) return data;

    return data.filter((item) => {
      // Status Filter
      if (statusFilter) {
        const itemStatus = item.status?.toUpperCase() || '';
        const filterVal = statusFilter.toUpperCase();
        if (filterVal === 'CLOSE' || filterVal === 'CLOSED') {
          if (itemStatus !== 'CLOSE' && itemStatus !== 'CLOSED') return false;
        } else if (itemStatus !== filterVal) {
          return false;
        }
      }

      // Date Filter
      const itemDate = item.dateTime?.split('T')[0] || item.dateTime?.split(' ')[0];
      if (itemDate) {
        if (ledgerStartDate && itemDate < ledgerStartDate) return false;
        if (ledgerEndDate && itemDate > ledgerEndDate) return false;
      }
      return true;
    });
  };

  const transactionData = getTransactionData();
  const filteredData = filterData(transactionData);

  return (
    <div className="mx-auto w-full p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-black dark:text-white">
          Transaction Ledger
        </h2>
      </div>

      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:justify-end">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded border border-stroke bg-transparent px-3 py-1 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
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
                className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
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
              paginationOff={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerLedger;