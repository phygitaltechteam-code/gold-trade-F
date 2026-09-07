import React, { useState, useEffect, useMemo } from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import { useGetTransactionLedger } from '@/lib/api/masterpanelapi/masterapi';
import { RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  DollarSign,
  IndianRupee,
  Wallet,
  Clock,
} from 'lucide-react';
import { formatIndianCurrency } from '@/utils/formatIndianNumber';
import { useAuthContext } from '@/context/AuthContext';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

// Stat Card Component
const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-orange-500',
  valueColor = 'text-black dark:text-white',
}: any) => (
  <div className="group relative overflow-hidden rounded-lg border border-stroke bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-strokedark dark:bg-boxdark md:p-5">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
          {title}
        </p>
        <h4 className={`mt-2 text-xl font-bold md:text-2xl ${valueColor}`}>
          {value}
        </h4>
      </div>
      <div className={`rounded-lg p-2 ${iconColor.replace('text', 'bg')}/10`}>
        {Icon && <Icon className={`h-5 w-5 ${iconColor} md:h-6 md:w-6`} />}
      </div>
    </div>
  </div>
);

const TransactionLedger = () => {
  const { user, token } = useAuthContext();
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data: transactionLedgerData, refetch, isLoading } = useGetTransactionLedger();

  // Local table state to hold and update live rows from WebSocket
  const [ledgerData, setLedgerData] = useState<any[]>([]);

  // Helper function to swap P&L sign (for Admin P&L card only)
  const swapPnLSign = (value: any) => {
    if (value === undefined || value === null) return 0;
    return -value;
  };

  // Calculate statistics from transaction data
  const calculateStats = (data: any[]) => {
    if (!data || !Array.isArray(data)) {
      return {
        activeTrades: 0,
        activeTradeAmount: 0,
        totalPnL: 0,
        todaysCommission: 0,
      };
    }

    let activeTrades = 0;
    let activeTradeAmount = 0;
    let totalPnL = 0;
    let todaysCommission = 0;

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    data.forEach((item) => {
      // Count active trades
      if (item.status && item.status.toLowerCase() !== 'completed' && item.status.toLowerCase() !== 'closed') {
        activeTrades++;
        const qty = item.qty || item.Qty || 0;
        const buyPrice = item.buyPrice || 0;
        activeTradeAmount += qty * buyPrice;
      }

      // Calculate total P&L (actual value - no swap)
      const pnl = extractPnL(item) || 0;
      totalPnL += pnl;

      // Calculate today's commission
      const itemDate = item.dateTime?.split('T')[0];
      const commission = item.commission || item.masterBrokerCommission || 0;
      if (itemDate === today) {
        todaysCommission += commission;
      }
    });

    return {
      activeTrades,
      activeTradeAmount,
      totalPnL,
      todaysCommission,
    };
  };

  // Format quantity/lot as "qty/lotSize"
  const formatQtyLot = (item: any) => {
    if (!item) return '-';
    const qty = item.qty || item.Qty || 0;
    const lotSize = item.lotSize || item.lotSize || 0;
    if (lotSize && lotSize !== qty) {
      return `${qty}/${lotSize}`;
    }
    return qty;
  };

  const extractPnL = (item: any) => {
    if (!item) return undefined;

    const rawPnl = item?.rawPnl !== undefined
      ? item.rawPnl
      : (item?.pnl !== undefined
        ? item.pnl
        : item?.['p&l']);

    if (rawPnl === null || rawPnl === undefined || rawPnl === '' || rawPnl === '-') {
      return undefined;
    }

    const clean = typeof rawPnl === 'string' ? rawPnl.replace(/[₹, ]/g, '') : rawPnl;
    const num = Number(clean);
    return isNaN(num) ? undefined : num;
  };

  // Format P&L with proper sign (+ / -), currency, no unnecessary .00, on one line
  const formatPnL = (item: any) => {
    const pnl = extractPnL(item);
    if (pnl === undefined || pnl === null || isNaN(pnl)) return '-';

    const sign = pnl > 0 ? '+' : pnl < 0 ? '-' : '';
    const absVal = Math.abs(pnl);
    const hasDecimal = absVal % 1 !== 0;

    const formattedNum = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: hasDecimal ? 2 : 0,
    }).format(absVal);

    return `${sign}₹${formattedNum}`;
  };

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
    if (transactionLedgerData.data && Array.isArray(transactionLedgerData.data))
      return transactionLedgerData.data;

    return [];
  };

  // Initialize local table state whenever HTTP API returns data
  useEffect(() => {
    const list = getTransactionData();
    if (list && list.length > 0) {
      setLedgerData(list);
    }
  }, [transactionLedgerData]);

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

  // WebSocket connection for Master Broker Ledger
  useEffect(() => {
    const userId = user?.id || (user as any)?._id || '';
    const baseWsUrl = getWsUrl();
    const tokenParam = token?.accessToken ? `&token=${encodeURIComponent(token.accessToken)}` : '';
    const wsUrl = `${baseWsUrl}?userId=${encodeURIComponent(userId)}&room=transaction_ledger${tokenParam}`;

    console.log('[MasterBrokerLedger WS] Connecting to:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[MasterBrokerLedger WS] Connection OPEN for room: transaction_ledger');
      try {
        ws.send(JSON.stringify({ type: 'JOIN_TRANSACTION_LEDGER', room: 'transaction_ledger', userId }));
      } catch (e) {
        console.error('[MasterBrokerLedger WS] Send join error:', e);
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
          console.log('[MasterBrokerLedger WS] Auto-refresh triggered via TRANSACTION_LEDGER_TRADE_CHANGED');
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
        console.error('[MasterBrokerLedger WS] Message parse error:', err);
      }
    };

    ws.onerror = (error) => {
      console.error('[MasterBrokerLedger WS] WebSocket Error:', error);
    };

    ws.onclose = (event) => {
      console.log('[MasterBrokerLedger WS] WebSocket Closed:', event.code, event.reason);
    };

    return () => {
      console.log('[MasterBrokerLedger WS] Disconnecting WebSocket');
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'LEAVE_TRANSACTION_LEDGER' }));
        }
        ws.close();
      } catch (_) {}
    };
  }, [user, token]);

  // All columns - showing actual P&L values (no swap)
  const allColumns = [
    { header: 'Date & Time', accessor: 'dateTime' },
    { header: 'Trader Name', accessor: 'customerName' },
    { header: 'Script', accessor: 'script' },
    { header: 'Qty/Lot', accessor: (item: any) => formatQtyLot(item) },
    { header: 'Buy Price', accessor: 'buyPrice' },
    { header: 'Sell Price', accessor: 'sellPrice' },
    { header: 'Buy Time', accessor: 'buyTime' },
    { header: 'Sell Time', accessor: 'sellTime' },
    { header: 'Status', accessor: 'status' },
    {
      header: 'P&L',
      accessor: (item: any) => formatPnL(item),
      render: (item: any) => {
        const pnl = extractPnL(item);
        if (pnl === undefined || pnl === null || isNaN(pnl)) {
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
    { header: 'Master Broker Commission', accessor: 'masterBrokerCommission' },
  ];

  // Filter data by date and status
  const filterData = (data: any[]) => {
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

  const filteredData = filterData(ledgerData);

  // Calculate statistics from live updated ledgerData
  const stats = calculateStats(ledgerData);

  // Format currency with Indian comma system and hide .00
  const formatCurrency = (amount: any) => {
    if (amount === undefined || amount === null) return '₹0';

    const formatted = Number(amount).toFixed(2);

    if (formatted.endsWith('.00')) {
      return `₹${Math.round(amount).toLocaleString('en-IN')}`;
    }

    const parts = formatted.split('.');
    const integerPart = Number(parts[0]).toLocaleString('en-IN');
    const decimalPart = parts[1];
    return `₹${integerPart}.${decimalPart}`;
  };

  // Format Admin P&L for card - SWAPPED value
  const formatAdminPnL = () => {
    const swappedValue = swapPnLSign(stats.totalPnL);
    const sign = swappedValue > 0 ? '+' : '';
    return `${sign}${formatIndianCurrency(swappedValue)}`;
  };

  // Helper function to format numbers
  const formatNumber = (num: any) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#f8fafc] p-4 md:p-6"
    >
      <div className="mx-auto max-w-[2000px]">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="mb-6 flex flex-col justify-between gap-4 md:mb-8 md:flex-row md:items-center"
        >
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
              Transaction Ledger
            </h1>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={itemVariants}
          className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            title="Active Trades"
            value={formatNumber(stats.activeTrades)}
            icon={Activity}
            iconColor="text-blue-500"
          />
          <StatCard
            title="Active Trade Amount"
            value={formatCurrency(stats.activeTradeAmount)}
            icon={TrendingUp}
            iconColor="text-orange-500"
          />
          <StatCard
            title="Admin P&L"
            value={formatAdminPnL()}
            icon={DollarSign}
          />
          <StatCard
            title="Today's Commission"
            value={formatCurrency(stats.todaysCommission)}
            icon={Wallet}
            iconColor="text-purple-500"
          />
        </motion.div>

        {/* Transaction Table */}
        <motion.div
          variants={itemVariants}
          className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
        >
          <div className="p-4">
            <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Ledger Records
              </h3>
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
                <button
                  onClick={() => refetch()}
                  className="rounded bg-orange-500 flex px-1 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 mr-2"
                >
                  <RefreshCcw size={20} />Refresh
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
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TransactionLedger;