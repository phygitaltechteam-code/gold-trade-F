import React, {useState, useMemo} from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {useGetTransactionLedger} from '@/lib/react-query/transactionledger';
import { RefreshCcw } from 'lucide-react';
import { formatIndianNumber, formatIndianCurrency } from '@/utils/formatIndianNumber';

const TransactionLedger = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const {data: transactionLedgerData , refetch} = useGetTransactionLedger();

  // Format date and time
  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return 'N/A';
    try {
      const date = new Date(dateTime);
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

  // Format quantity/lot as "qty/lotSize"
  const formatQtyLot = (item) => {
    if (!item) return '-';
    const qty = item.qty || item.Qty || 0;
    const lotSize = item.lotSize || item.lotSize || 0;
    if (lotSize && lotSize !== qty) {
      return `${qty}/${lotSize}`;
    }
    return qty || '-';
  };

  // Format P&L with proper sign and color
  const formatPnL = (item) => {
    const pnl = item.pnl || item['p&l'] || 0;
    const sign = pnl > 0 ? '+' : '';
    return `${sign}${formatIndianCurrency(Math.abs(pnl))}`;
  };

  // Base columns - shows main information with proper formatting
  const baseColumns = [
    {
      header: 'Date & Time', 
      accessor: 'dateTime',
      render: (item: any) => <span>{formatDateTime(item.dateTime)}</span>
    },
    {
      header: 'Customer Name', 
      accessor: 'customerName',
      render: (item: any) => <span className="font-medium">{item.customerName || '-'}</span>
    },
    {
      header: 'Script', 
      accessor: 'script',
      render: (item: any) => <span>{item.script || '-'}</span>
    },
    {
      header: 'Qty/Lot', 
      accessor: (item) => formatQtyLot(item),
      render: (item: any) => <span>{formatQtyLot(item)}</span>
    },
    {
      header: 'Buy Price', 
      accessor: 'buyPrice',
      render: (item: any) => <span>{formatIndianCurrency(item.buyPrice)}</span>
    },
    {
      header: 'Sell Price', 
      accessor: 'sellPrice',
      render: (item: any) => <span>{formatIndianCurrency(item.sellPrice)}</span>
    },
    {
      header: 'Status', 
      accessor: 'status',
      render: (item: any) => {
        const status = item.status || 'Pending';
        const statusColor = status.toLowerCase() === 'closed' || status.toLowerCase() === 'close' 
          ? 'bg-green-100 text-green-700' 
          : status.toLowerCase() === 'open' 
            ? 'bg-yellow-100 text-yellow-700' 
            : 'bg-gray-100 text-gray-700';
        return (
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColor}`}>
            {status}
          </span>
        );
      }
    },
    {
      header: 'P&L', 
      accessor: (item) => formatPnL(item),
      render: (item: any) => {
        const pnl = item.pnl || item['p&l'] || 0;
        const isPositive = pnl > 0;
        const isNegative = pnl < 0;
        return (
          <span className={` ${isPositive ? 'text-green-600' : isNegative ? 'text-gray-900' : 'text-gray-900'}`}>
            {formatPnL(item)}
          </span>
        );
      }
    },
    {
      header: 'Buy Time', 
      accessor: 'buyTime',
      render: (item: any) => <span>{item.buyTime ? formatDateTime(item.buyTime) : '-'}</span>
    },
    {
      header: 'Sell Time', 
      accessor: 'sellTime',
      render: (item: any) => <span>{item.sellTime ? formatDateTime(item.sellTime) : '-'}</span>
    },
    {
      header: 'Admin Commission', 
      accessor: 'companyCommission',
      render: (item: any) => <span className="font-medium">{formatIndianCurrency(item.companyCommission)}</span>
    },
    {
      header: 'Super Broker Commission', 
      accessor: 'superBrokerCommission',
      render: (item: any) => <span className="font-medium">{formatIndianCurrency(item.superBrokerCommission)}</span>
    },
    {
      header: 'Broker Commission', 
      accessor: 'brokerCommission',
      render: (item: any) => <span className="font-medium">{formatIndianCurrency(item.brokerCommission)}</span>
    },
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

  return (
    <div className="mx-auto w-full p-4 md:p-6 bg-[#f8fafc]">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
          Transaction Ledger
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
              <button
                onClick={() => refetch()}
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