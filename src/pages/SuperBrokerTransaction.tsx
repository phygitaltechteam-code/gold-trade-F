import React, { useState, useEffect, useMemo } from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import { useGetSuperBrokerTransactionLedger } from '@/lib/react-query/transactionledger';
import { RefreshCcw } from 'lucide-react';
import { formatIndianCurrency } from '@/utils/formatIndianNumber';
import { useAuthContext } from '@/context/AuthContext';

const SuperBrokerTransactionLedger = () => {
  const { user, token } = useAuthContext();
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data: transactionLedgerResponse, isLoading, error, refetch } = useGetSuperBrokerTransactionLedger();

  // Local table state to hold and update live rows from WebSocket
  const [ledgerData, setLedgerData] = useState<any[]>([]);

  // Format Qty/Lot
  const formatQtyLot = (item: any) => {
    if (!item) return '-';
    const qty = item.qty ?? item.Qty ?? 0;
    const lotSize = item.lotSize ?? item.lotsize ?? 0;
    if (lotSize && lotSize !== qty) {
      return `${qty}/${lotSize}`;
    }
    return qty;
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

  // Simplified view columns
  const baseColumns = [
    { header: 'Date & Time', accessor: 'dateTime' },
    { header: 'Customer Name', accessor: 'customerName' },
    { header: 'Script', accessor: 'script' },
    {
      header: 'Qty/Lot',
      accessor: (item: any) => formatQtyLot(item),
    },
    { header: 'Buy Price', accessor: 'buyPrice', render: (item: any) => formatIndianCurrency(item?.buyPrice) },
    { header: 'Sell Price', accessor: 'sellPrice', render: (item: any) => formatIndianCurrency(item?.sellPrice) },
    { header: 'Buy Time', accessor: 'buyTime' },
    { header: 'Sell Time', accessor: 'sellTime' },
    { header: 'Broker Name', accessor: 'brokerName' },
    {
      header: 'Qty/Lot',
      accessor: (item: any) => formatQtyLot(item),
    },
    { header: 'Status', accessor: 'status' },
    {
      header: 'P&L',
      accessor: (item: any) => formatPnL(item),
      render: (item: any) => {
        const rawPnl = item?.pnl !== undefined ? item?.pnl : item?.['p&l'];
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
      },
    },
    {
      header: 'Super Broker Commission',
      accessor: 'superBrokerCommission',
      render: (item: any) => formatIndianCurrency(item?.superBrokerCommission),
    },
  ];

  // Extract data array safely from the response
  const getTransactionData = () => {
    if (!transactionLedgerResponse) return [];

    if (transactionLedgerResponse?.data?.data && Array.isArray(transactionLedgerResponse.data.data)) {
      return transactionLedgerResponse.data.data;
    }
    if (transactionLedgerResponse?.data?.transactions && Array.isArray(transactionLedgerResponse.data.transactions)) {
      return transactionLedgerResponse.data.transactions;
    }
    if (Array.isArray(transactionLedgerResponse)) {
      return transactionLedgerResponse;
    }

    return [];
  };

  // Sync data to local state
  useEffect(() => {
    const list = getTransactionData();
    if (list && list.length > 0) {
      setLedgerData(list);
    }
  }, [transactionLedgerResponse]);

  // Compute WebSocket URL
  const getWsUrl = () => {
    const envWs = import.meta.env.VITE_WS_URL;
    if (envWs) return envWs;
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://192.168.29.227:5677';
    try {
      const url = new URL(serverUrl);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${url.host}`;
    } catch {
      return 'ws://192.168.29.227:5677';
    }
  };

  // WebSocket connection for Super Broker Ledger
  useEffect(() => {
    const superBrokerId = user?.id || (user as any)?._id || user?.roleId || '';
    const baseWsUrl = getWsUrl();
    const tokenParam = token?.accessToken ? `&token=${encodeURIComponent(token.accessToken)}` : '';
    const wsUrl = `${baseWsUrl}?room=transaction_ledger&superBrokerId=${encodeURIComponent(superBrokerId)}${tokenParam}`;

    console.log('[SuperBrokerLedger WS] Connecting to:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[SuperBrokerLedger WS] Connection OPEN for room: transaction_ledger');
      try {
        ws.send(JSON.stringify({ type: 'JOIN_TRANSACTION_LEDGER', superBrokerId }));
      } catch (e) {
        console.error('[SuperBrokerLedger WS] Send join error:', e);
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
          console.log('[SuperBrokerLedger WS] Auto-refresh triggered via TRANSACTION_LEDGER_TRADE_CHANGED');
          refetch();
          return;
        }

        if (
          message.type === 'TRANSACTION_LEDGER_LIVE_UPDATE' ||
          message.type === 'TRANSACTION_LEDGER_OPEN_TRADES' ||
          message.type === 'OPEN_TRADES' ||
          message.type === 'LEDGER_UPDATE' ||
          Array.isArray(message.data) ||
          Array.isArray(message)
        ) {
          const liveOpenTrades = Array.isArray(message.data)
            ? message.data
            : Array.isArray(message)
            ? message
            : message.trades || [message.data || message];

          // Fast lookup Map matching primarily by orderId
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
              const liveUpdate =
                (row.orderId && openTradeMap.get(String(row.orderId))) ||
                (row.tradeId && openTradeMap.get(String(row.tradeId))) ||
                (row.transactionId && openTradeMap.get(String(row.transactionId))) ||
                (row._id && openTradeMap.get(String(row._id))) ||
                (row.id && openTradeMap.get(String(row.id))) ||
                null;

              if (liveUpdate) {
                if (row.status?.toString().toLowerCase() === 'open') {
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
        console.error('[SuperBrokerLedger WS] Message parse error:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('[SuperBrokerLedger WS] WebSocket Error:', error);
    };

    ws.onclose = (event) => {
      console.log('[SuperBrokerLedger WS] WebSocket Closed:', event.code, event.reason);
    };

    return () => {
      console.log('[SuperBrokerLedger WS] Disconnecting WebSocket');
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'LEAVE_TRANSACTION_LEDGER' }));
        }
        ws.close();
      } catch (_) {}
    };
  }, [user, token]);

  // Filter data by date range
  const filterDataByDate = (data: any[]) => {
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
          <div>{(error as any)?.message || 'Please try again later'}</div>
        </div>
      </div>
    );
  }

  const filteredData = filterDataByDate(ledgerData);

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
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:justify-end ">
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
              columns={baseColumns}
              paginationOff={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperBrokerTransactionLedger;