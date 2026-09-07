import React, {useState, useEffect, useMemo} from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {useGetTransactionLedger} from '@/lib/react-query/transactionledger';
import { RefreshCcw } from 'lucide-react';
import { formatIndianNumber, formatIndianCurrency } from '@/utils/formatIndianNumber';
import { useAuthContext } from '@/context/AuthContext';

const TransactionLedger = () => {
  const { user, token } = useAuthContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const {data: transactionLedgerData, refetch} = useGetTransactionLedger();

  // Local table state to hold and update live rows from WebSocket
  const [ledgerData, setLedgerData] = useState<any[]>([]);

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
  const formatQtyLot = (item: any) => {
    if (!item) return '-';
    const qty = item.qty || item.Qty || 0;
    const lotSize = item.lotSize || item.lotSize || 0;
    if (lotSize && lotSize !== qty) {
      return `${qty}/${lotSize}`;
    }
    return qty || '-';
  };

  // Format P&L with proper sign (+ / -), currency, no unnecessary .00, on one line
  const formatPnL = (item: any) => {
    const rawPnl = item?.pnl !== undefined ? item?.pnl : item?.['p&l'];
    if (rawPnl === null || rawPnl === undefined || rawPnl === '') return '-';
    const pnl = Number(rawPnl);
    if (isNaN(pnl)) return '-';

    const sign = pnl > 0 ? '+' : pnl < 0 ? '-' : '';
    const absVal = Math.abs(pnl);
    const hasDecimal = absVal % 1 !== 0;

    const formattedNum = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: hasDecimal ? 2 : 0,
    }).format(absVal);

    return `${sign}₹${formattedNum}`;
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
      accessor: (item: any) => formatQtyLot(item),
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
      render: (item: any) => <span>{item.status || '-'}</span>,
    },
    {
      header: 'P&L', 
      accessor: (item: any) => formatPnL(item),
      render: (item: any) => {
        const rawPnl = item?.pnl !== undefined ? item?.pnl : item?.['p&l'];
        const orderId = item?.orderId || item?.tradeId || item?.transactionId || item?._id || item?.id;
        const status = item?.status || 'OPEN';
        if (orderId && rawPnl !== undefined && item?.status?.toString().toUpperCase() === 'OPEN') {
          console.log('orderId:', orderId, 'P&L:', rawPnl, 'status:', status);
        }
        if (rawPnl === null || rawPnl === undefined || rawPnl === '') {
          return <span>-</span>;
        }
        const pnl = Number(rawPnl);
        if (isNaN(pnl)) {
          return <span>-</span>;
        }
        const isPositive = pnl > 0;
        const isNegative = pnl < 0;
        return (
          <span
            className={`font-semibold whitespace-nowrap inline-block ${
              isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-900'
            }`}
          >
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

  // Helper to extract data array safely from HTTP response
  const extractTransactionData = (resData: any) => {
    if (!resData) return [];
    if (Array.isArray(resData)) return resData;
    if (resData.data && Array.isArray(resData.data?.data)) return resData.data.data;
    if (resData.data?.transactions && Array.isArray(resData.data?.transactions))
      return resData.data.transactions;
    if (resData.data && Array.isArray(resData.data)) return resData.data;
    return [];
  };

  // Step 1: Initialize local table state whenever HTTP API returns data
  useEffect(() => {
    const list = extractTransactionData(transactionLedgerData);
    if (list && list.length > 0) {
      console.log('[TransactionLedger] Loaded HTTP API data:', list.length, 'records');
      setLedgerData(list);
    }
  }, [transactionLedgerData]);

  // Compute WebSocket URL
  const getWsUrl = () => {
    const envWs = import.meta.env.VITE_WS_URL;
    if (envWs) {
      try {
        const u = new URL(envWs);
        return `${u.protocol}//${u.host}`;
      } catch {
        return envWs;
      }
    }
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://192.168.29.227:5677';
    try {
      const url = new URL(serverUrl);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${url.host}`;
    } catch {
      return 'ws://192.168.29.227:5677';
    }
  };

  // Step 2, 3 & 4: WebSocket connection for Transaction Ledger
  useEffect(() => {
    const userId = user?.id || (user as any)?._id || '';
    const baseWsUrl = getWsUrl();
    const tokenParam = token?.accessToken ? `&token=${encodeURIComponent(token.accessToken)}` : '';
    const wsUrl = `${baseWsUrl}?userId=${encodeURIComponent(userId)}&room=transaction_ledger${tokenParam}`;

    console.log('[TransactionLedger WS] Connecting to:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[TransactionLedger WS] Connection OPEN for room: transaction_ledger');
      // Send join room message if backend supports it
      try {
        ws.send(JSON.stringify({ type: 'JOIN_TRANSACTION_LEDGER', room: 'transaction_ledger', userId }));
      } catch (e) {
        console.error('[TransactionLedger WS] Send join error:', e);
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // Auto-refresh when trade is executed, modified, or closed/squared off
        if (
          message.type === 'TRANSACTION_LEDGER_TRADE_CHANGED' ||
          message.action === 'REFRESH_TABLE'
        ) {
          console.log('[TransactionLedger WS] Auto-refresh triggered via TRANSACTION_LEDGER_TRADE_CHANGED');
          refetch();
          return;
        }

        const isKnownType =
          message.type === 'TRANSACTION_LEDGER_LIVE_UPDATE' ||
          message.type === 'TRANSACTION_LEDGER_OPEN_TRADES' ||
          message.type === 'OPEN_TRADES' ||
          message.type === 'LEDGER_UPDATE' ||
          Array.isArray(message.data) ||
          Array.isArray(message);

        if (isKnownType) {
          const liveOpenTrades = Array.isArray(message.data)
            ? message.data
            : Array.isArray(message)
            ? message
            : message.trades || [message.data || message];

          // Fast lookup Map matching primarily by orderId (with fallback to tradeId/transactionId)
          const openTradeMap = new Map();
          liveOpenTrades.forEach((t: any) => {
            if (!t) return;
            const orderId = t.orderId || t.tradeId || t.transactionId || t.id || t._id;
            const pnl = t.pnl !== undefined ? t.pnl : t['p&l'];
            const status = t.status || 'OPEN';
            if (orderId && pnl !== undefined) {
              console.log('orderId:', orderId, 'P&L:', pnl, 'status:', status);
            }
            if (t.orderId) openTradeMap.set(String(t.orderId), t);
            if (t.tradeId) openTradeMap.set(String(t.tradeId), t);
            if (t.transactionId) openTradeMap.set(String(t.transactionId), t);
            if (t._id) openTradeMap.set(String(t._id), t);
            if (t.id) openTradeMap.set(String(t.id), t);
          });

          // Update matching open orders with live PnL and live prices
          setLedgerData((prevData) => {
            const updatedRows = prevData.map((row: any) => {
              // Multi-key matching across orderId, tradeId, transactionId
              const liveUpdate =
                (row.orderId && openTradeMap.get(String(row.orderId))) ||
                (row.tradeId && openTradeMap.get(String(row.tradeId))) ||
                (row.transactionId && openTradeMap.get(String(row.transactionId))) ||
                (row._id && openTradeMap.get(String(row._id))) ||
                (row.id && openTradeMap.get(String(row.id))) ||
                null;

              if (liveUpdate) {
                // If trade is OPEN, update live PnL and live depth/market prices
                if (row.status?.toString().toUpperCase() === 'OPEN') {
                  const newPnl = liveUpdate.pnl !== undefined ? liveUpdate.pnl : liveUpdate['p&l'];
                  const matchedId = row.orderId || liveUpdate.orderId || row.tradeId || liveUpdate.tradeId || row.transactionId;
                  const newStatus = liveUpdate.status || row.status || 'OPEN';
                  console.log('orderId:', matchedId, 'P&L:', newPnl, 'status:', newStatus);

                  const isBuy = (row.sr || row.side || '').toString().toUpperCase() === 'BUY';
                  const newBuyPrice = liveUpdate.buyPrice !== undefined && liveUpdate.buyPrice !== null
                    ? liveUpdate.buyPrice
                    : (isBuy ? (row.buyPrice ?? row.price) : (liveUpdate.currentPrice ?? row.buyPrice));

                  const newSellPrice = liveUpdate.sellPrice !== undefined && liveUpdate.sellPrice !== null
                    ? liveUpdate.sellPrice
                    : (!isBuy ? (row.sellPrice ?? row.price) : (liveUpdate.currentPrice ?? row.sellPrice));

                  return {
                    ...row,
                    currentPrice: liveUpdate.currentPrice ?? row.currentPrice,
                    buyPrice: newBuyPrice,
                    sellPrice: newSellPrice,
                    pnl: newPnl,
                    'p&l': newPnl,
                    status: liveUpdate.status || row.status,
                  };
                }
              }
              return row;
            });

            // Prepend new open trade if not already in ledgerData
            const existingKeys = new Set(
              prevData.map((r: any) => String(r.orderId || r.tradeId || r.transactionId || r._id || r.id || ''))
            );
            const newOpenTrades: any[] = [];
            liveOpenTrades.forEach((t: any) => {
              const key = String(t.orderId || t.tradeId || t.transactionId || t._id || t.id || '');
              if (key && !existingKeys.has(key) && t.status?.toString().toUpperCase() === 'OPEN') {
                const newPnl = t.pnl !== undefined ? t.pnl : t['p&l'];
                const status = t.status || 'OPEN';
                console.log('orderId:', t.orderId || key, 'P&L:', newPnl, 'status:', status);
                newOpenTrades.push({
                  ...t,
                  pnl: newPnl,
                  'p&l': newPnl,
                });
                existingKeys.add(key);
              }
            });

            if (newOpenTrades.length > 0) {
              return [...newOpenTrades, ...updatedRows];
            }
            return updatedRows;
          });
        }
      } catch (err) {
        console.error('[TransactionLedger WS] Message parse error:', err, event.data);
      }
    };

    ws.onerror = (error) => {
      console.error('[TransactionLedger WS] WebSocket Error:', error);
    };

    ws.onclose = (event) => {
      console.log('[TransactionLedger WS] WebSocket Closed:', event.code, event.reason);
    };

    // Step 4: Disconnect when user leaves the Transaction Ledger page
    return () => {
      console.log('[TransactionLedger WS] Cleaning up & disconnecting WebSocket for Transaction Ledger');
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'LEAVE_TRANSACTION_LEDGER' }));
        }
        ws.close();
      } catch (_) {}
    };
  }, [user, token]);

  // Filter data by date range and status
  const filterData = (data: any[]) => {
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

  const filteredData = filterData(ledgerData);

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