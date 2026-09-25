import React, { useState, useEffect, useMemo } from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import { useGetTransactionLedger } from '@/lib/react-query/transactionledger';
import {
  RefreshCcw,
  XCircle,
  RotateCcw,
  Pencil,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { formatIndianNumber, formatIndianCurrency } from '@/utils/formatIndianNumber';
import { useAuthContext } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  useClosePosition,
  useReverseEntry,
  useEditEntry,
  useDeleteEntry,
} from '@/lib/api/masterpanelapi/ledgerActionApi';

const TransactionLedger = () => {
  const { user, token } = useAuthContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data: transactionLedgerData, refetch } = useGetTransactionLedger();

  // Action Mutations
  const closePositionMutation = useClosePosition();
  const reverseEntryMutation = useReverseEntry();
  const editEntryMutation = useEditEntry();
  const deleteEntryMutation = useDeleteEntry();

  // Action Modal States
  const [closeItem, setCloseItem] = useState<any | null>(null);
  const [reverseItem, setReverseItem] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);

  // Inline Row Edit State (No popup)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingRowData, setEditingRowData] = useState({
    qty: '',
    buyPrice: '',
    sellPrice: '',
  });

  // Local table state to hold and update live rows from WebSocket
  const [ledgerData, setLedgerData] = useState<any[]>([]);

  // Helper to extract Order / Trade ID safely
  const getOrderId = (item: any) =>
    item?.orderId || item?.sellOrderId || item?.buyOrderId || item?.tradeId || item?.transactionId || item?._id || item?.id;

  const isSameOrder = (row: any, targetId: string | number) => {
    const t = String(targetId);
    return (
      String(row?.orderId || '') === t ||
      String(row?.sellOrderId || '') === t ||
      String(row?.buyOrderId || '') === t ||
      String(row?.tradeId || '') === t ||
      String(row?.transactionId || '') === t ||
      String(row?._id || '') === t ||
      String(row?.id || '') === t
    );
  };

  const handleOpenCloseModal = (item: any) => {
    setCloseItem(item);
  };

  const handleConfirmClose = async () => {
    if (!closeItem) return;
    const orderId = getOrderId(closeItem);
    if (!orderId) {
      toast.error('Order ID not found for this entry');
      return;
    }
    // Optimistically update status to CLOSED immediately
    setLedgerData((prev) =>
      prev.map((item) => (isSameOrder(item, orderId) ? { ...item, status: 'CLOSED' } : item))
    );
    setCloseItem(null);
    try {
      await closePositionMutation.mutateAsync({ orderId, role: user?.role });
      await refetch();
    } catch (err) {
      refetch();
    }
  };

  // Helper to extract the last used order ID and type (BUY vs SELL) for a closed position
  const getLastUsedOrderDetails = (item: any) => {
    const fallbackOrderId =
      item?.orderId || item?.tradeId || item?.transactionId || item?._id || item?.id;
    const buyOrderId = item?.buyOrderId ?? item?.buyId;
    const sellOrderId = item?.sellOrderId ?? item?.sellId;

    // Case 1: When both buy and sell order IDs exist
    if (buyOrderId && sellOrderId) {
      const buyTime = item?.buyTime || item?.buyDate || item?.buyCreatedAt;
      const sellTime = item?.sellTime || item?.sellDate || item?.sellCreatedAt;

      if (buyTime && sellTime) {
        const buyTimestamp = new Date(buyTime).getTime();
        const sellTimestamp = new Date(sellTime).getTime();
        if (!isNaN(buyTimestamp) && !isNaN(sellTimestamp)) {
          if (sellTimestamp > buyTimestamp) {
            return { lastOrderId: sellOrderId, isSell: true, isBuy: false };
          } else if (buyTimestamp > sellTimestamp) {
            return { lastOrderId: buyOrderId, isSell: false, isBuy: true };
          }
        }
      }

      if (item?.closingOrderId) {
        if (String(item.closingOrderId) === String(sellOrderId)) {
          return { lastOrderId: sellOrderId, isSell: true, isBuy: false };
        }
        if (String(item.closingOrderId) === String(buyOrderId)) {
          return { lastOrderId: buyOrderId, isSell: false, isBuy: true };
        }
      }

      const rawType = String(
        item?.type || item?.tradeType || item?.orderType || item?.openingType || ''
      ).toUpperCase();
      if (rawType === 'BUY') {
        // Opened with BUY, closed with SELL -> last order was SELL
        return { lastOrderId: sellOrderId, isSell: true, isBuy: false };
      }
      if (rawType === 'SELL') {
        // Opened with SELL, closed with BUY -> last order was BUY
        return { lastOrderId: buyOrderId, isSell: false, isBuy: true };
      }

      // Default fallback for dual orders: sellOrderId
      return { lastOrderId: sellOrderId, isSell: true, isBuy: false };
    }

    // Case 2: Only sellOrderId exists
    if (sellOrderId) {
      return { lastOrderId: sellOrderId, isSell: true, isBuy: false };
    }

    // Case 3: Only buyOrderId exists
    if (buyOrderId) {
      return { lastOrderId: buyOrderId, isSell: false, isBuy: true };
    }

    const isSell =
      String(item?.type || item?.tradeType || '').toUpperCase() === 'SELL';
    return { lastOrderId: fallbackOrderId, isSell, isBuy: !isSell };
  };

  const handleOpenReverseModal = (item: any) => {
    setReverseItem(item);
  };

  const handleConfirmReverse = async () => {
    if (!reverseItem) return;
    const { lastOrderId, isSell, isBuy } = getLastUsedOrderDetails(reverseItem);
    const orderId = lastOrderId || getOrderId(reverseItem);
    if (!orderId) {
      toast.error('Order ID not found for this entry');
      return;
    }

    const payload: any = {
      orderId,
    };

    if (isSell) {
      payload.sellOrderId = orderId;
      payload.sellId = orderId;
    } else if (isBuy) {
      payload.buyOrderId = orderId;
      payload.buyId = orderId;
    }

    setReverseItem(null);
    try {
      await reverseEntryMutation.mutateAsync({
        orderId,
        payload,
        role: user?.role,
      });
      await refetch();
    } catch (err) {
      refetch();
    }
  };

  const handleStartInlineEdit = (item: any) => {
    const orderId = getOrderId(item);
    if (!orderId) return;
    setEditingOrderId(String(orderId));
    setEditingRowData({
      qty: String(item?.qty || item?.Qty || '1'),
      buyPrice: String(item?.buyPrice ?? item?.price ?? ''),
      sellPrice: String(item?.sellPrice ?? item?.price ?? ''),
    });
  };

  const handleCancelInlineEdit = () => {
    setEditingOrderId(null);
  };

  const handleSaveInlineEdit = async (item: any) => {
    const orderId = getOrderId(item);
    if (!orderId) {
      toast.error('Order ID not found for this entry');
      return;
    }

    const buyOrderId = item?.buyOrderId;
    const sellOrderId = item?.sellOrderId;

    const hasExistingBuyPrice =
      !!buyOrderId ||
      (item?.buyPrice !== undefined && item?.buyPrice !== null && item?.buyPrice !== '' && item?.buyPrice !== '-' && Number(item?.buyPrice) > 0) ||
      String(item?.type || item?.tradeType || '').toUpperCase() === 'BUY' ||
      String(item?.status || '').toUpperCase() === 'CLOSED' ||
      String(item?.status || '').toUpperCase() === 'CLOSE';

    const hasExistingSellPrice =
      !!sellOrderId ||
      (item?.sellPrice !== undefined && item?.sellPrice !== null && item?.sellPrice !== '' && item?.sellPrice !== '-' && Number(item?.sellPrice) > 0) ||
      String(item?.type || item?.tradeType || '').toUpperCase() === 'SELL' ||
      String(item?.status || '').toUpperCase() === 'CLOSED' ||
      String(item?.status || '').toUpperCase() === 'CLOSE';

    const buyPriceVal =
      hasExistingBuyPrice && editingRowData.buyPrice !== ''
        ? Number(editingRowData.buyPrice)
        : hasExistingBuyPrice && item?.buyPrice !== undefined && item?.buyPrice !== null && item?.buyPrice !== '' && item?.buyPrice !== '-'
        ? Number(item.buyPrice)
        : undefined;

    const sellPriceVal =
      hasExistingSellPrice && editingRowData.sellPrice !== ''
        ? Number(editingRowData.sellPrice)
        : hasExistingSellPrice && item?.sellPrice !== undefined && item?.sellPrice !== null && item?.sellPrice !== '' && item?.sellPrice !== '-'
        ? Number(item.sellPrice)
        : undefined;

    const qtyVal =
      editingRowData.qty !== ''
        ? Number(editingRowData.qty) || editingRowData.qty
        : item?.qty || item?.Qty;

    const hasBuy = buyPriceVal !== undefined && !isNaN(buyPriceVal);
    const hasSell = sellPriceVal !== undefined && !isNaN(sellPriceVal);

    let updateType: 'buy' | 'sell' | 'both' = 'both';
    if (hasBuy && !hasSell) {
      updateType = 'buy';
    } else if (!hasBuy && hasSell) {
      updateType = 'sell';
    } else {
      updateType = 'both';
    }

    const dataPayload: any = {
      updateType,
      newBuyPrice: hasBuy ? buyPriceVal : undefined,
      newSellPrice: hasSell ? sellPriceVal : undefined,
      newPrice: hasBuy ? buyPriceVal : hasSell ? sellPriceVal : undefined,
      buyPrice: hasBuy ? buyPriceVal : undefined,
      sellPrice: hasSell ? sellPriceVal : undefined,
      qty: qtyVal,
      newQty: qtyVal,
    };

    if (updateType === 'buy') {
      const bId = buyOrderId || orderId;
      dataPayload.buyOrderId = bId;
      dataPayload.buyId = bId;
    } else if (updateType === 'sell') {
      const sId = sellOrderId || orderId;
      dataPayload.sellOrderId = sId;
      dataPayload.sellId = sId;
    } else if (updateType === 'both') {
      const bId = buyOrderId || orderId;
      const sId = sellOrderId || orderId;
      if (bId) {
        dataPayload.buyOrderId = bId;
        dataPayload.buyId = bId;
      }
      if (sId) {
        dataPayload.sellOrderId = sId;
        dataPayload.sellId = sId;
      }
    }

    // Optimistically update table row
    setLedgerData((prev) =>
      prev.map((row) => {
        if (isSameOrder(row, orderId)) {
          return {
            ...row,
            buyPrice: hasBuy ? buyPriceVal : row.buyPrice,
            sellPrice: hasSell ? sellPriceVal : row.sellPrice,
            qty: qtyVal,
            Qty: qtyVal,
          };
        }
        return row;
      })
    );
    setEditingOrderId(null);

    try {
      await editEntryMutation.mutateAsync({
        orderId,
        data: dataPayload,
        role: user?.role,
      });
      await refetch();
    } catch (err) {
      refetch();
    }
  };

  const handleOpenDeleteModal = (item: any) => {
    setDeleteItem(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    const orderId = getOrderId(deleteItem);
    if (!orderId) {
      toast.error('Order ID not found for this entry');
      return;
    }

    const buyOrderId = deleteItem?.buyOrderId !== undefined ? deleteItem.buyOrderId : (String(deleteItem?.type || '').toUpperCase() === 'BUY' ? orderId : null);
    const sellOrderId = deleteItem?.sellOrderId !== undefined ? deleteItem.sellOrderId : (String(deleteItem?.type || '').toUpperCase() === 'SELL' ? orderId : null);

    const payload: any = {
      orderId,
      buyOrderId,
      sellOrderId,
    };

    // Optimistically remove from table immediately
    setLedgerData((prev) => prev.filter((item) => !isSameOrder(item, orderId)));
    setDeleteItem(null);
    try {
      await deleteEntryMutation.mutateAsync({
        orderId,
        payload,
        role: user?.role,
      });
      await refetch();
    } catch (err) {
      refetch();
    }
  };

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
      render: (item: any) => {
        const orderId = getOrderId(item);
        const hasExistingBuyPrice =
          (item?.buyPrice !== undefined && item?.buyPrice !== null && item?.buyPrice !== '' && item?.buyPrice !== '-' && Number(item?.buyPrice) > 0) ||
          String(item?.type || item?.tradeType || '').toUpperCase() === 'BUY' ||
          String(item?.status || '').toUpperCase() === 'CLOSED' ||
          String(item?.status || '').toUpperCase() === 'CLOSE';

        if (editingOrderId === String(orderId) && hasExistingBuyPrice) {
          return (
            <input
              type="number"
              step="any"
              value={editingRowData.buyPrice}
              onChange={(e) =>
                setEditingRowData((prev) => ({ ...prev, buyPrice: e.target.value }))
              }
              className="w-24 rounded border border-primary bg-white px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary dark:border-strokedark dark:bg-form-input dark:text-white"
              onClick={(e) => e.stopPropagation()}
            />
          );
        }
        return <span>{item.buyPrice !== undefined && item.buyPrice !== null ? formatIndianCurrency(item.buyPrice) : '-'}</span>;
      },
    },
    {
      header: 'Sell Price',
      accessor: 'sellPrice',
      render: (item: any) => {
        const orderId = getOrderId(item);
        const hasExistingSellPrice =
          (item?.sellPrice !== undefined && item?.sellPrice !== null && item?.sellPrice !== '' && item?.sellPrice !== '-' && Number(item?.sellPrice) > 0) ||
          String(item?.type || item?.tradeType || '').toUpperCase() === 'SELL' ||
          String(item?.status || '').toUpperCase() === 'CLOSED' ||
          String(item?.status || '').toUpperCase() === 'CLOSE';

        if (editingOrderId === String(orderId) && hasExistingSellPrice) {
          return (
            <input
              type="number"
              step="any"
              value={editingRowData.sellPrice}
              onChange={(e) =>
                setEditingRowData((prev) => ({ ...prev, sellPrice: e.target.value }))
              }
              className="w-24 rounded border border-primary bg-white px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary dark:border-strokedark dark:bg-form-input dark:text-white"
              onClick={(e) => e.stopPropagation()}
            />
          );
        }
        return <span>{item.sellPrice !== undefined && item.sellPrice !== null ? formatIndianCurrency(item.sellPrice) : '-'}</span>;
      },
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
            className={`font-semibold whitespace-nowrap inline-block ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-900'
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
    {
      header: 'Action',
      accessor: 'action',
      render: (item: any) => {
        const itemStatus = String(item?.status || '').toUpperCase();
        const isOpen = itemStatus === 'OPEN';
        const isClosed = itemStatus === 'CLOSED' || itemStatus === 'CLOSE';
        const orderId = getOrderId(item);

        if (!isOpen && !isClosed) {
          return <span className="text-gray-400 dark:text-gray-600">-</span>;
        }

        // Inline Row Editing Active
        if (editingOrderId === String(orderId)) {
          return (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveInlineEdit(item);
                }}
                disabled={editEntryMutation.isPending}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-100 hover:scale-105 active:scale-95 dark:bg-emerald-900/30 dark:text-emerald-400"
                title="Save Rate"
              >
                {editEntryMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelInlineEdit();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:scale-105 active:scale-95 dark:bg-slate-800 dark:text-slate-300"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {/* 1. Close Position - Only available for OPEN trades */}
            {isOpen && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenCloseModal(item);
                }}
                className="group relative flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-all hover:bg-rose-100 hover:scale-105 active:scale-95 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40"
                title="Close Position"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}

            {/* 2. Entry Reverse - Only available for CLOSED trades */}
            {isClosed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenReverseModal(item);
                }}
                className="group relative flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition-all hover:bg-amber-100 hover:scale-105 active:scale-95 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40"
                title="Entry Reverse"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}

            {/* 3. Inline Edit Rates - Available for OPEN & CLOSED trades */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleStartInlineEdit(item);
              }}
              className="group relative flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all hover:bg-blue-100 hover:scale-105 active:scale-95 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
              title="Edit Buying & Selling Rate (Inline)"
            >
              <Pencil className="h-4 w-4" />
            </button>

            {/* 4. Entry Delete - Available for OPEN & CLOSED trades */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDeleteModal(item);
              }}
              className="group relative flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-all hover:bg-red-100 hover:scale-105 active:scale-95 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
              title="Entry Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
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
    if (Array.isArray(list)) {
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
    const companyId = user?.id || (user as any)?._id || user?.roleId || '';
    const baseWsUrl = getWsUrl();
    const tokenParam = token?.accessToken ? `&token=${encodeURIComponent(token.accessToken)}` : '';
    const wsUrl = `${baseWsUrl}?room=transaction_ledger&companyId=${encodeURIComponent(companyId)}${tokenParam}`;

    console.log('[TransactionLedger WS] Connecting to:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[TransactionLedger WS] Connection OPEN for room: transaction_ledger');
      // Send join room message as per backend spec
      try {
        ws.send(JSON.stringify({ type: 'JOIN_TRANSACTION_LEDGER', companyId }));
      } catch (e) {
        console.error('[TransactionLedger WS] Send join error:', e);
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        console.log('📥 [TransactionLedger WS Message Received]:', message.type || message.action || 'Data', message);

        // Auto-refresh when trade is executed, modified, or closed/squared off
        if (
          message.type === 'TRANSACTION_LEDGER_TRADE_CHANGED' ||
          message.action === 'REFRESH_TABLE'
        ) {
          console.log('🔄 [TransactionLedger WS] Auto-refresh triggered via TRANSACTION_LEDGER_TRADE_CHANGED', message.data);
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
      } catch (_) { }
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
                <RefreshCcw size={20} />Refresh
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

        {/* Close Position Confirmation Modal */}
        <AnimatePresence>
          {closeItem && (
            <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md overflow-hidden rounded-2xl border border-stroke bg-white shadow-2xl dark:border-strokedark dark:bg-boxdark"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
                      <XCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black dark:text-white">
                        Close Trade Position
                      </h3>
                      <p className="text-xs text-gray-500">
                        Order ID: {getOrderId(closeItem) || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCloseItem(null)}
                    disabled={closePositionMutation.isPending}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-meta-4 dark:hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Are you sure you want to close this open trade position?
                  </p>

                  <div className="mt-4 space-y-2.5 rounded-xl border border-stroke bg-slate-50 p-4 text-sm dark:border-strokedark dark:bg-meta-4/30">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Trader Name:</span>
                      <span className="font-medium text-black dark:text-white">
                        {closeItem.customerName || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Script:</span>
                      <span className="font-semibold text-black dark:text-white">
                        {closeItem.script || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Qty / Lot:</span>
                      <span className="font-medium text-black dark:text-white">
                        {formatQtyLot(closeItem)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Buy Price / Sell Price:</span>
                      <span className="font-medium text-black dark:text-white">
                        {closeItem.buyPrice !== undefined && closeItem.buyPrice !== null ? formatIndianCurrency(closeItem.buyPrice) : ''}  {closeItem.sellPrice !== undefined && closeItem.sellPrice !== null ? formatIndianCurrency(closeItem.sellPrice) : ''}
                      </span>
                    </div>
                    
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-stroke px-6 py-4 dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setCloseItem(null)}
                    disabled={closePositionMutation.isPending}
                    className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-strokedark dark:text-gray-300 dark:hover:bg-meta-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmClose}
                    disabled={closePositionMutation.isPending}
                    className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-rose-700 disabled:opacity-50"
                  >
                    {closePositionMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Close Position
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Reverse Entry Confirmation Modal */}
        <AnimatePresence>
          {reverseItem && (
            <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md overflow-hidden rounded-2xl border border-stroke bg-white shadow-2xl dark:border-strokedark dark:bg-boxdark"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                      <RotateCcw className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black dark:text-white">
                        Reverse Trade Entry
                      </h3>
                      <p className="text-xs text-gray-500">
                        Order ID: {getLastUsedOrderDetails(reverseItem).lastOrderId || getOrderId(reverseItem) || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReverseItem(null)}
                    disabled={reverseEntryMutation.isPending}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-meta-4 dark:hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Are you sure you want to reverse this trade entry? This will reverse / close the position for this customer.
                  </p>

                  <div className="mt-4 space-y-2.5 rounded-xl border border-stroke bg-slate-50 p-4 text-sm dark:border-strokedark dark:bg-meta-4/30">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Trader Name:</span>
                      <span className="font-medium text-black dark:text-white">
                        {reverseItem.customerName || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Script:</span>
                      <span className="font-semibold text-black dark:text-white">
                        {reverseItem.script || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Qty / Lot:</span>
                      <span className="font-medium text-black dark:text-white">
                        {formatQtyLot(reverseItem)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Buy Price / Sell Price:</span>
                      <span className="font-medium text-black dark:text-white">
                        {reverseItem.buyPrice !== undefined && reverseItem.buyPrice !== null ? formatIndianCurrency(reverseItem.buyPrice) : '-'} / {reverseItem.sellPrice !== undefined && reverseItem.sellPrice !== null ? formatIndianCurrency(reverseItem.sellPrice) : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">P&L:</span>
                      <span className="font-semibold">{formatPnL(reverseItem)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-stroke px-6 py-4 dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setReverseItem(null)}
                    disabled={reverseEntryMutation.isPending}
                    className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-strokedark dark:text-gray-300 dark:hover:bg-meta-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReverse}
                    disabled={reverseEntryMutation.isPending}
                    className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-amber-700 disabled:opacity-50"
                  >
                    {reverseEntryMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Confirm Reverse
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Entry Confirmation Modal */}
        <AnimatePresence>
          {deleteItem && (
            <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md overflow-hidden rounded-2xl border border-stroke bg-white shadow-2xl dark:border-strokedark dark:bg-boxdark"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400">
                      <Trash2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-black dark:text-white">
                        Delete Trade Entry
                      </h3>
                      <p className="text-xs text-gray-500">
                        Order ID: {getOrderId(deleteItem) || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteItem(null)}
                    disabled={deleteEntryMutation.isPending}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-meta-4 dark:hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6">
                  <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Warning: Are you sure you want to permanently delete this trade entry? This action cannot be undone.
                    </p>
                  </div>

                  <div className="mt-4 space-y-2 rounded-xl border border-stroke bg-slate-50 p-4 text-sm dark:border-strokedark dark:bg-meta-4/30">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Trader:</span>
                      <span className="font-medium text-black dark:text-white">
                        {deleteItem.customerName || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Script:</span>
                      <span className="font-medium text-black dark:text-white">
                        {deleteItem.script || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Qty / Lot:</span>
                      <span className="font-medium text-black dark:text-white">
                        {formatQtyLot(deleteItem)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-stroke px-6 py-4 dark:border-strokedark">
                  <button
                    type="button"
                    onClick={() => setDeleteItem(null)}
                    disabled={deleteEntryMutation.isPending}
                    className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-strokedark dark:text-gray-300 dark:hover:bg-meta-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={deleteEntryMutation.isPending}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleteEntryMutation.isPending && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Delete Entry
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TransactionLedger;