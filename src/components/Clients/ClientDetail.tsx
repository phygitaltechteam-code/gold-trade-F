import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  CreditCard,
  TrendingUp,
  Loader2,
  ShieldCheck,
  RotateCcw,
  Pencil,
  Trash2,
  XCircle,
  Check,
  AlertTriangle,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetClientById,
  useSendDeposite,
  useAddMargin,
  useSendWithdraw,
  useUpdateCustomer,
  useGetClientLedgerById,
} from './mutationapi';
import {
  useReverseEntry,
  useClosePosition,
  useEditEntry,
  useDeleteEntry,
} from '@/lib/api/masterpanelapi/ledgerActionApi';
import { Route } from '@/routes/_app/companybroker/clientdetail.$id';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';

// Subcomponents
import { ClientProfileInfo } from './ClientProfileInfo';
import { ClientDetailStats } from './ClientDetailStats';
import { ClientDocs } from './ClientDocs';
import { ClientWalletModal } from './ClientWalletModal';
import { ClientMarginModal } from './ClientMarginModal';
import { ClientTabs } from './ClientTabs';
import { useAuthContext } from '@/context/AuthContext';

const formatQtyLot = (item: any) => {
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

const renderDateTimeVertical = (value: string) => {
  if (!value || value === '-' || value === 'N/A') return <span>{value}</span>;
  const parts = value.split(', ');
  if (parts.length === 2) {
    return (
      <div className="flex flex-col">
        <span>{parts[0]}</span>
        <span className="text-gray-500 text-xs">{parts[1]}</span>
      </div>
    );
  }
  return <span>{value}</span>;
};

const formatCommission = (val: any) => {
  const num = Number(val);
  if (isNaN(num) || num <= 0) return '0';
  return num.toFixed(2);
};

export const ClientDetail: React.FC = () => {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { data: clientData, isLoading, refetch } = useGetClientById(id);
  const displayClient = clientData;



  console.log('displayClient', displayClient?.intradayLeverage);
  const [activeTab, setActiveTab] = useState('ledger');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletActionType, setWalletActionType] = useState<'add' | 'withdraw'>(
    'add',
  );
  const [walletAmount, setWalletAmount] = useState('');
  const [walletPin, setWalletPin] = useState('');
  const [showWalletPin, setShowWalletPin] = useState(false);
  const [isMarginModalOpen, setIsMarginModalOpen] = useState(false);
  const [intradayMargin, setIntradayMargin] = useState('');
  const [holdingMargin, setHoldingMargin] = useState('');
  const [marginPin, setMarginPin] = useState('');
  const [showMarginPin, setShowMarginPin] = useState(false);
  const [editData, setEditData] = useState({
    fullname: '',
    phoneNumber: '',
    aadharCardNumber: '',
    brokeragePercent: '',
    address: '',
    password: '',
    type: '',
    panCardNumber: '',
    stockHoldingLimit: 0,
  });

  useEffect(() => {
    if (displayClient) {
      setIntradayMargin(
        displayClient?.intradayLeverage != null
          ? String(displayClient.intradayLeverage)
          : ''
      );

      setHoldingMargin(
        displayClient?.deliveryLeverage != null
          ? String(displayClient.deliveryLeverage)
          : ''
      );
    }
  }, [displayClient]);


  useEffect(() => {
    if (displayClient) {
      setIntradayMargin(
        displayClient?.intradayLeverage != null
          ? String(displayClient.intradayLeverage)
          : ''
      );

      setHoldingMargin(
        displayClient?.deliveryLeverage != null
          ? String(displayClient.deliveryLeverage)
          : ''
      );
    }
  }, [displayClient]);

  const updateCustomer = useUpdateCustomer();
  const { user, token } = useAuthContext();
  const { data: ledgerData, refetch: refetchLedger } = useGetClientLedgerById(id);
  console.log('ledgerData', ledgerData);

  const { mutateAsync: sendDeposite, isPending: isDepositPending } =
    useSendDeposite();
  const { mutateAsync: sendWithdraw, isPending: isWithdrawPending } =
    useSendWithdraw();
  const { mutateAsync: addMargin, isPending: isMarginPending } = useAddMargin();

  const [tradingLedgerData, setTradingLedgerData] = useState<any[]>([]);
  const [paymentData, setPaymentData] = useState<any[]>([]);

  const totalPnL = useMemo(() => {
    return tradingLedgerData.reduce((sum: number, item: any) => {
      return sum + Number(item.pnl ?? item['p&l'] ?? 0);
    }, 0);
  }, [tradingLedgerData]);

  // WebSocket connection for Client Ledger
  useEffect(() => {
    const customerId = id || '';
    const envWs = import.meta.env.VITE_WS_URL;
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://192.168.29.227:5677';
    let baseWsUrl = 'ws://192.168.29.227:5677';
    try {
      const url = new URL(serverUrl);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      baseWsUrl = `${protocol}//${url.host}`;
    } catch (_) {}

    const tokenParam = token?.accessToken ? `&token=${encodeURIComponent(token.accessToken)}` : '';
    const wsUrl = `${baseWsUrl}?room=transaction_ledger&customerId=${encodeURIComponent(customerId)}${tokenParam}`;

    console.log('[ClientDetail WS] Connecting to:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[ClientDetail WS] Connection OPEN for room: transaction_ledger');
      try {
        ws.send(JSON.stringify({ type: 'JOIN_TRANSACTION_LEDGER', customerId }));
      } catch (e) {}
    };

    ws.onmessage = (event) => {
      try {
        const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // Auto-refresh when trade is executed, modified, or closed/squared off
        if (
          message.type === 'TRANSACTION_LEDGER_TRADE_CHANGED' ||
          message.action === 'REFRESH_TABLE'
        ) {
          console.log('[ClientDetail WS] Auto-refresh triggered via TRANSACTION_LEDGER_TRADE_CHANGED');
          refetch();
          refetchLedger();
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

          setTradingLedgerData((prevData) => {
            const updated = prevData.map((row: any) => {
              const liveUpdate =
                (row.orderId && openTradeMap.get(String(row.orderId))) ||
                (row.tradeId && openTradeMap.get(String(row.tradeId))) ||
                (row.transactionId && openTradeMap.get(String(row.transactionId))) ||
                (row._id && openTradeMap.get(String(row._id))) ||
                (row.id && openTradeMap.get(String(row.id))) ||
                null;

              if (liveUpdate && row.status?.toString().toLowerCase() === 'open') {
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
              return row;
            });
            return updated;
          });
        }
      } catch (err) {
        console.error('[ClientDetail WS] Message error:', err);
      }
    };

    return () => {
      console.log('[ClientDetail WS] Disconnecting WebSocket');
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'LEAVE_TRANSACTION_LEDGER' }));
        }
        ws.close();
      } catch (_) {}
    };
  }, [user, token]);

  // Trading Ledger Data from API
  useEffect(() => {
    const tradingLedgers = ledgerData?.data || [];
    const formattedLedgers = tradingLedgers.map((item: any) => {
      const amountVal =
        item.amount ?? item.transactionAmount ?? item.paidAmount ?? 0;
      const typeVal = item.type ?? item.paymentStatus ?? item.sr ?? '';
      const dateSource = item.dateTime ?? item.createdAt;

      return {
        ...item,
        dateTime: dateSource
          ? new Date(dateSource).toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
          : '-',
        buyTime: item.buyTime
          ? new Date(item.buyTime).toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
          : '-',
        sellTime: item.sellTime
          ? new Date(item.sellTime).toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
          : '-',
        type: typeVal,
        amount: `₹${amountVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
        balanceAfter: `₹${(item.balanceAfter ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      };
    });
    console.log('formattedLedgers', formattedLedgers);
    setTradingLedgerData(formattedLedgers);
  }, [ledgerData]);
  useEffect(() => {
    const tradingLedgers = clientData?.tradingLedgers || [];
    const formattedLedgers = tradingLedgers.map((item: any) => {
      const amountVal =
        item.amount ?? item.transactionAmount ?? item.paidAmount ?? 0;
      const typeVal = item.type ?? item.paymentStatus ?? item.sr ?? '';
      const dateSource = item.dateTime ?? item.createdAt;

      return {
        ...item,
        dateTime: item.createdAt
          ? new Date(item.createdAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
          : '-',
        balanceAfter: `₹${(item.balanceAfter ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
        amount: `₹${amountVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      };
    });
    console.log('formattedLedgers', formattedLedgers);
    setPaymentData(formattedLedgers);
  }, [clientData]);
  const renderDateTime = (dateString: string) => {
    if (!dateString || dateString === '-') return '-';
    const parts = dateString.split(', ');
    if (parts.length === 2) {
      return (
        <div className="flex flex-col">
          <span>{parts[0]}</span>
          <span className="text-xs text-gray-500">{parts[1]}</span>
        </div>
      );
    }
    return dateString;
  };

  // Action Mutations
  const closePositionMutation = useClosePosition();
  const reverseEntryMutation = useReverseEntry();
  const editEntryMutation = useEditEntry();
  const deleteEntryMutation = useDeleteEntry();

  // Action Modal States
  const [closeItem, setCloseItem] = useState<any | null>(null);
  const [reverseItem, setReverseItem] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);

  // Inline Row Edit State
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingRowData, setEditingRowData] = useState({
    qty: '',
    buyPrice: '',
    sellPrice: '',
  });

  const getOrderId = (item: any) =>
    item?.orderId || item?.sellOrderId || item?.buyOrderId || item?.tradeId || item?.transactionId || item?._id || item?.id;

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
    setCloseItem(null);
    try {
      await closePositionMutation.mutateAsync({ orderId, role: user?.role });
      await refetchLedger();
    } catch (err) {
      refetchLedger();
    }
  };

  const getLastUsedOrderDetails = (item: any) => {
    const fallbackOrderId =
      item?.orderId || item?.tradeId || item?.transactionId || item?._id || item?.id;
    const buyOrderId = item?.buyOrderId ?? item?.buyId;
    const sellOrderId = item?.sellOrderId ?? item?.sellId;

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
        return { lastOrderId: sellOrderId, isSell: true, isBuy: false };
      }
      if (rawType === 'SELL') {
        return { lastOrderId: buyOrderId, isSell: false, isBuy: true };
      }

      return { lastOrderId: sellOrderId, isSell: true, isBuy: false };
    }

    if (sellOrderId) {
      return { lastOrderId: sellOrderId, isSell: true, isBuy: false };
    }

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

    const payload: any = { orderId };
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
      await refetchLedger();
    } catch (err) {
      refetchLedger();
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

    setEditingOrderId(null);

    try {
      await editEntryMutation.mutateAsync({
        orderId,
        data: dataPayload,
        role: user?.role,
      });
      await refetchLedger();
    } catch (err) {
      refetchLedger();
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

    setDeleteItem(null);
    try {
      await deleteEntryMutation.mutateAsync({
        orderId,
        payload,
        role: user?.role,
      });
      await refetchLedger();
    } catch (err) {
      refetchLedger();
    }
  };

  const ledgerColumns = [
    { header: 'Date & Time', accessor: 'dateTime', render: (item: any) => renderDateTime(item.dateTime) },
    { header: 'Trader Name', accessor: 'customerName' },
    { header: 'Script', accessor: 'script' },
    { header: 'Qty/Lot', accessor: (item: any) => formatQtyLot(item) },
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
        return <span>{item.buyPrice ?? '-'}</span>;
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
        return <span>{item.sellPrice ?? '-'}</span>;
      },
    },
    { header: 'Buy Time', accessor: 'buyTime', render: (item: any) => renderDateTime(item.buyTime) },
    { header: 'Sell Time', accessor: 'sellTime', render: (item: any) => renderDateTime(item.sellTime) },
    { header: 'Status', accessor: 'status' },
    {
      header: 'P&L',
      accessor: (item: any) => formatPnL(item),
      render: (item: any) => {
        const rawPnl = item?.pnl !== undefined ? item?.pnl : item?.['p&l'];
        if (rawPnl === null || rawPnl === undefined || rawPnl === '' || rawPnl === '-') {
          return <span>-</span>;
        }
        const pnl = Number(typeof rawPnl === 'string' ? rawPnl.replace(/[₹,+]/g, '') : rawPnl);
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
    { header: 'Admin Commission', accessor: (item: any) => formatCommission(item.companyCommission) },
    { header: 'Super Broker Commission', accessor: (item: any) => formatCommission(item.superBrokerCommission) },
    { header: 'Broker Commission', accessor: (item: any) => formatCommission(item.brokerCommission) },
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

  const paymentColumns = [
    { header: 'Date/Time', accessor: 'dateTime' },
    { header: 'Amount', accessor: 'amount' },
    { header: 'Wallet Amount', accessor: 'walletAmount' },
  ];

  // Trading Ledger Columns - No Sr column
  const tradingLedgerColumns = [
    {
      header: 'Date & Time',
      accessor: 'dateTime',
      className: 'min-w-[160px]',
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (item: any) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${item.type === 'CREDIT'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
            }`}
        >
          {item.type === 'CREDIT' ? 'Credit' : 'Debit'}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (item: any) => (
        <span
          className={`font-semibold ${item.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
            }`}
        >
          {item.amount}
        </span>
      ),
    },
    {
      header: 'Balance After',
      accessor: 'balanceAfter',
      render: (item: any) => (
        <span className="font-semibold text-blue-600">{item.balanceAfter}</span>
      ),
    },
    {
      header: 'Notes',
      accessor: 'Notes',
      render: (item: any) => (
        <span className="font-mono text-gray-500 text-xs">{item.Notes}</span>
      ),
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const updateData: any = {};

      if (editData.fullname && editData.fullname !== fullName) {
        updateData.fullname = editData.fullname;
      }
      if (editData.phoneNumber && editData.phoneNumber !== phone) {
        updateData.phoneNumber = editData.phoneNumber;
      }
      if (
        editData.aadharCardNumber &&
        editData.aadharCardNumber !== displayClient?.aadharCardNumber
      ) {
        updateData.aadharCardNumber = editData.aadharCardNumber;
      }
      if (
        editData.brokeragePercent &&
        editData.brokeragePercent !== displayClient?.brokeragePercent
      ) {
        updateData.brokeragePercent = editData.brokeragePercent;
      }
      if (editData.address && editData.address !== displayClient?.address) {
        updateData.address = editData.address;
      }
      if (editData.password) {
        updateData.password = editData.password;
      }
      if (editData.type && editData.type !== displayClient?.type) {
        updateData.type = editData.type;
      }
      if (
        editData.stockHoldingLimit !== undefined &&
        Number(editData.stockHoldingLimit) !== Number(displayClient?.stockHoldingLimit || 0)
      ) {
        updateData.stockHoldingLimit = Number(editData.stockHoldingLimit);
      }

      if (Object.keys(updateData).length === 0) {
        toast.error('No changes to save');
        setIsEditing(false);
        return;
      }

      await updateCustomer.mutateAsync({
        id: id,
        data: updateData,
      });

      setIsEditing(false);

      setEditData({
        fullname: '',
        phoneNumber: '',
        aadharCardNumber: '',
        brokeragePercent: '',
        address: '',
        password: '',
        type: '',
        panCardNumber: '',
        stockHoldingLimit: 0
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditData({
      fullname: '',
      phoneNumber: '',
      aadharCardNumber: '',
      brokeragePercent: '',
      address: '',
      password: '',
      type: '',
      panCardNumber: '',
      stockHoldingLimit: 0
    });
    setIsEditing(false);
  };

  const handleBack = () => {
    navigate({ to: '/clients/mainpage' });
  };

  const handleEditClick = () => {
    setEditData({
      fullname: fullName,
      phoneNumber: phone,
      aadharCardNumber: displayClient?.aadharCardNumber || '',
      brokeragePercent: displayClient?.brokeragePercent || '',
      address: displayClient?.address || '',
      password: '',
      type: displayClient?.type || '',
      panCardNumber: displayClient?.panCardNumber || '',
      stockHoldingLimit: displayClient?.stockHoldingLimit || 0,
    });
    setIsEditing(true);
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!walletAmount || parseFloat(walletAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!walletPin) {
      toast.error('Please enter PIN');
      return;
    }

    if (walletPin.length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }

    if (walletActionType === 'withdraw') {
      const currentBalance = parseFloat(displayClient?.wallets?.amount || '0');
      if (parseFloat(walletAmount) > currentBalance) {
        toast.error('Insufficient balance');
        return;
      }
    }

    try {
      if (walletActionType === 'add') {
        await sendDeposite({
          amount: parseFloat(walletAmount),
          securityPin: walletPin,
          customerId: id,
        });
      } else {
        await sendWithdraw({
          amount: parseFloat(walletAmount),
          securityPin: walletPin,
          customerId: id,
        });
      }

      // toast.success(
      //   `₹${walletAmount} ${walletActionType === 'add' ? 'deposited' : 'withdrawn'} successfully!`,
      // );

      refetch(); // optional if you want latest wallet value immediately

      setIsWalletModalOpen(false);
      setWalletAmount('');
      setWalletPin('');
      setShowWalletPin(false);
    } catch (error: any) {
      console.error('Error processing transaction:', error);
      toast.error(
        error?.response?.data?.message ||
        `Failed to ${walletActionType} amount`,
      );
    }
  };

  const handleMarginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!intradayMargin || parseFloat(intradayMargin) <= 0) {
      toast.error('Please enter a valid Intraday margin amount');
      return;
    }

    if (!holdingMargin || parseFloat(holdingMargin) <= 0) {
      toast.error('Please enter a valid Holding margin amount');
      return;
    }

    if (!marginPin) {
      toast.error('Please enter PIN');
      return;
    }

    if (marginPin.length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }

    try {
      const result = await addMargin({
        customerId: id,
        intradayLeverage: parseFloat(intradayMargin),
        deliveryLeverage: parseFloat(holdingMargin),
        securityPin: marginPin,
      });

      // toast.success('Margin added successfully!');

      setIsMarginModalOpen(false);
      setIntradayMargin('');
      setHoldingMargin('');
      setMarginPin('');
      setShowMarginPin(false);
    } catch (error: any) {
      console.error('Error adding margin:', error);
      toast.error(
        error?.response?.data?.message ||
        'Failed to add margin. Please check your PIN and try again.',
      );
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8 text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-orange-500" />
        <p className="text-slate-500">Loading client details...</p>
      </div>
    );
  }

  const fullName = displayClient?.user?.fullname || 'Unknown';
  const email = displayClient?.user?.email || 'N/A';
  const phone = displayClient?.user?.phoneNumber || 'N/A';
  const isActive = displayClient?.user?.isActive || false;
  const isVerified = displayClient?.user?.isVerified || false;
  const walletAmountValue = parseFloat(displayClient?.wallets?.amount || '0');
  const blockedAmount = parseFloat(
    displayClient?.wallets?.blockedAmount || '0',
  );
  const aadharNumber = displayClient?.aadharCardNumber || 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-9xl mx-auto px-4 py-6 md:px-6 md:py-8 bg-[#f8fafc]"
    >
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:mb-8 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="rounded-xl border border-slate-200 bg-white p-2 transition-colors hover:bg-slate-50"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">
                {fullName}
              </h1>
              {isActive && isVerified && (
                <span className="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Verified Active
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> CRN:{' '}
                {displayClient?.CRN || 'N/A'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setIntradayMargin(
                displayClient?.intradayLeverage != null
                  ? String(displayClient.intradayLeverage)
                  : ''
              );
              setHoldingMargin(
                displayClient?.deliveryLeverage != null
                  ? String(displayClient.deliveryLeverage)
                  : ''
              );
              setMarginPin('');
              setShowMarginPin(false);
              setIsMarginModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0 md:px-5 md:py-3"
          >
            <TrendingUp className="h-4 w-4 text-orange-500" /> Add Margin
          </button>
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-all hover:-translate-y-0.5 hover:bg-orange-600 active:translate-y-0 md:px-5 md:py-3"
          >
            <CreditCard className="h-4 w-4" /> Wallet Balance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:gap-8">
        <div className="space-y-6 lg:col-span-2">
          {/* Quick Stats Component */}
          <ClientDetailStats
            walletAmountValue={walletAmountValue}
            blockedAmount={blockedAmount}
            totalPnL={totalPnL}  // ← Pass totalPnL instead of isActive/isVerified
          />

          {/* Profile Details Component */}
          <ClientProfileInfo
            displayClient={displayClient}
            isEditing={isEditing}
            editData={editData}
            handleInputChange={handleInputChange}
            handleSave={handleSave}
            handleCancel={handleCancel}
            handleEditClick={handleEditClick}
            fullName={fullName}
            phone={phone}
            aadharNumber={aadharNumber}
            panCardNumber={displayClient?.panCardNumber || 'N/A'}
            type={displayClient?.type || 'N/A'}
            stockHoldingLimit={displayClient?.stockHoldingLimit || 'N/A'}

          />

          {/* Documentation Component */}
          <ClientDocs displayClient={displayClient} />

          {/* Tabs: Ledger & Payment & Trading Ledger Component */}
          <ClientTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tradingLedgerData={tradingLedgerData}
            paymentData={paymentData}
            ledgerColumns={ledgerColumns}
            // paymentColumns={paymentColumns}
            tradingLedgerColumns={tradingLedgerColumns}
            refetchLedger={refetchLedger}
          />
        </div>
      </div>

      {/* Wallet Balance Modal Component */}
      <ClientWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => {
          setIsWalletModalOpen(false);
          setWalletAmount('');
          setWalletPin('');
          setShowWalletPin(false);
        }}
        walletActionType={walletActionType}
        setWalletActionType={setWalletActionType}
        walletAmountValue={walletAmountValue}
        walletAmount={walletAmount}
        setWalletAmount={setWalletAmount}
        walletPin={walletPin}
        setWalletPin={setWalletPin}
        showWalletPin={showWalletPin}
        setShowWalletPin={setShowWalletPin}
        handleWalletSubmit={handleWalletSubmit}
        isPending={isDepositPending || isWithdrawPending}
      />

      {/* Margin Modal Component */}
      <ClientMarginModal
        isOpen={isMarginModalOpen}
        onClose={() => {
          setIsMarginModalOpen(false);
          setIntradayMargin('');
          setHoldingMargin('');
          setMarginPin('');
          setShowMarginPin(false);
        }}
        intradayMargin={intradayMargin}
        setIntradayMargin={setIntradayMargin}
        holdingMargin={holdingMargin}
        setHoldingMargin={setHoldingMargin}
        marginPin={marginPin}
        setMarginPin={setMarginPin}
        showMarginPin={showMarginPin}
        setShowMarginPin={setShowMarginPin}
        handleMarginSubmit={handleMarginSubmit}
        isPending={isMarginPending}
      />

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
                      {reverseItem.buyPrice ?? '-'} / {reverseItem.sellPrice ?? '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">P&L:</span>
                    <span className="font-semibold">{formatPnL(reverseItem)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="inline-block rounded px-2 py-0.5 text-xs font-semibold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {reverseItem.status || 'OPEN'}
                    </span>
                  </div>
                </div>
              </div>

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
                      {closeItem.buyPrice ?? '-'} / {closeItem.sellPrice ?? '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">P&L:</span>
                    <span className="font-semibold">{formatPnL(closeItem)}</span>
                  </div>
                </div>
              </div>

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
                  Delete Position
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
