// ClientDetail.tsx - Master Broker Client Detail with combined design
import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  CreditCard,
  TrendingUp,
  Loader2,
  ShieldCheck,
  Mail,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  ArrowUpRight,
  Building2,
  Calendar,
  Filter,
  RefreshCcw,
  X,
  User,
  EyeOff,
  Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Route } from '@/routes/_app/masterbroker/client-details.$id';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import GenericTable from '@/components/Forms/Table/GenericTable';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';
import {
  useAddMargin,
  useGetMasterClientById,
  useMasterSendDeposite,
  useSendWithdraw,
  useUpdateCustomer,
} from '@/lib/api/masterpanelapi/masterapi';
import { useGetMasterClientLedger } from '@/lib/api/masterpanelapi/profile';
import { formatIndianCurrency } from '@/utils/formatIndianNumber';
import { useAuthContext } from '@/context/AuthContext';

// Document Card Component
const DocCard = ({ name, type, status, icon: Icon, color, url }: any) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex cursor-pointer items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 transition-all hover:border-orange-200"
  >
    <div className={`rounded-lg p-3 ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="truncate text-sm font-medium text-slate-900">{name}</div>
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        {type} • <span className="font-medium text-emerald-600">{status}</span>
      </div>
    </div>
    <ExternalLink className="h-4 w-4 text-slate-300 transition-colors group-hover:text-orange-500" />
  </a>
);

// Helper functions
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

  const rawPnl = item?.rawPnl !== undefined && item?.rawPnl !== '-' && item?.rawPnl !== null
    ? item.rawPnl
    : (item?.pnl !== undefined && item?.pnl !== '-' && item?.pnl !== null
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

const extractLedgerData = (resData: any) => {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData?.data)) return resData.data;
  if (Array.isArray(resData?.data?.data)) return resData.data.data;
  if (Array.isArray(resData?.data?.transactions)) return resData.data.transactions;
  if (Array.isArray(resData?.transactions)) return resData.transactions;
  return [];
};

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

export const ClientDetail: React.FC = () => {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { data: clientData, isLoading, refetch } = useGetMasterClientById(id);
  const { data: ledgerDataaa, refetch: refetchLedger } = useGetMasterClientLedger(id);

  const displayClient = clientData;
  const [activeTab, setActiveTab] = useState('ledger');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletActionType, setWalletActionType] = useState<'add' | 'withdraw'>('add');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletPin, setWalletPin] = useState('');
  const [showWalletPin, setShowWalletPin] = useState(false);
  const [isMarginModalOpen, setIsMarginModalOpen] = useState(false);
  const [intradayMargin, setIntradayMargin] = useState('');
  const [holdingMargin, setHoldingMargin] = useState('');
  const [marginPin, setMarginPin] = useState('');
  const [showMarginPin, setShowMarginPin] = useState(false);
  const { user, token } = useAuthContext();
  const [livePnlMap, setLivePnlMap] = useState<Map<string, number>>(new Map());

  // WebSocket connection for MasterBroker Client Ledger
  useEffect(() => {
    const userId = user?.id || (user as any)?._id || '';
    const envWs = import.meta.env.VITE_WS_URL;
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://192.168.29.227:5677';
    let baseWsUrl = 'ws://192.168.29.227:5677';
    try {
      const url = new URL(serverUrl);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      baseWsUrl = `${protocol}//${url.host}`;
    } catch (_) {}

    const tokenParam = token?.accessToken ? `&token=${encodeURIComponent(token.accessToken)}` : '';
    const wsUrl = `${baseWsUrl}?userId=${encodeURIComponent(userId)}&room=transaction_ledger${tokenParam}`;

    console.log('[MasterClientDetail WS] Connecting to:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[MasterClientDetail WS] Connection OPEN for room: transaction_ledger');
      try {
        ws.send(JSON.stringify({ type: 'JOIN_TRANSACTION_LEDGER', room: 'transaction_ledger', userId }));
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
          console.log('[MasterClientDetail WS] Auto-refresh triggered via TRANSACTION_LEDGER_TRADE_CHANGED');
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

          setLivePnlMap((prevMap) => {
            const nextMap = new Map(prevMap);
            liveOpenTrades.forEach((t: any) => {
              if (!t) return;
              const newPnl = t.pnl !== undefined ? t.pnl : t['p&l'];
              const status = t.status || 'OPEN';
              console.log('orderId:', t.orderId || t.tradeId || t.transactionId, 'P&L:', newPnl, 'status:', status);

              if (t.orderId) nextMap.set(String(t.orderId), t);
              if (t.tradeId) nextMap.set(String(t.tradeId), t);
              if (t.transactionId) nextMap.set(String(t.transactionId), t);
              if (t._id) nextMap.set(String(t._id), t);
              if (t.id) nextMap.set(String(t.id), t);
            });
            return nextMap;
          });
        }
      } catch (err) {
        console.error('[MasterClientDetail WS] Message error:', err);
      }
    };

    return () => {
      console.log('[MasterClientDetail WS] Disconnecting WebSocket');
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'LEAVE_TRANSACTION_LEDGER' }));
        }
        ws.close();
      } catch (_) {}
    };
  }, [user, token]);

  const [editData, setEditData] = useState({
    fullname: '',
    phoneNumber: '',
    aadharCardNumber: '',
    panCardNumber: '',
    brokeragePercent: '',
    address: '',
    type: '',
    password: '',
    stockHoldingLimit: '',
  });

  const updateCustomer = useUpdateCustomer();
  const { mutateAsync: sendDeposite, isPending: isDepositPending } = useMasterSendDeposite();
  const { mutateAsync: sendWithdraw, isPending: isWithdrawPending } = useSendWithdraw();
  const { mutateAsync: addMargin, isPending: isMarginPending } = useAddMargin();

  const hasDocs =
    displayClient?.aadharCard ||
    displayClient?.panCard ||
    displayClient?.passport ||
    displayClient?.photo;

  // Trading Ledger Data from API
  const tradingLedgerData = useMemo(() => {
    const tradingLedgers = displayClient?.tradingLedgers || [];
    return tradingLedgers.map((item: any) => ({
      dateTime: new Date(item.createdAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      type: item.type,
      amount: formatIndianCurrency(item.amount),
      balanceAfter: formatIndianCurrency(item.balanceAfter),
      tradeId: item.tradeId || '-',
      Notes: item.Notes || '-',
    }));
  }, [displayClient?.tradingLedgers]);

  // Filter ledger data by date and status
  const ledgerRows = useMemo(() => {
    const rawList = extractLedgerData(ledgerDataaa);
    if (!rawList || !Array.isArray(rawList)) {
      return [];
    }

    let filtered = rawList.map((item: any) => {
      const matchKey = item.orderId || item.tradeId || item.transactionId || item._id || item.id;
      const isOpen = item.status?.toString().toUpperCase() === 'OPEN';
      const liveData = matchKey && isOpen && livePnlMap.has(String(matchKey))
        ? livePnlMap.get(String(matchKey))
        : null;

      let livePnl = undefined;
      if (liveData) {
        livePnl = typeof liveData === 'object' && liveData !== null
          ? (liveData.pnl !== undefined ? liveData.pnl : liveData['p&l'])
          : liveData;
      }

      const itemPnl = extractPnL(item);
      const effectivePnl = (isOpen && livePnl !== undefined && livePnl !== null) ? livePnl : itemPnl;

      const isBuy = (item.sr || item.side || '').toString().toUpperCase() === 'BUY';
      const effectiveBuyPrice = (isOpen && liveData?.buyPrice !== undefined && liveData?.buyPrice !== null)
        ? liveData.buyPrice
        : (isBuy ? item.buyPrice : (liveData?.currentPrice ?? item.buyPrice));

      const effectiveSellPrice = (isOpen && liveData?.sellPrice !== undefined && liveData?.sellPrice !== null)
        ? liveData.sellPrice
        : (!isBuy ? item.sellPrice : (liveData?.currentPrice ?? item.sellPrice));

      return {
        ...item,
        dateTime: item.dateTime,
        rawDate: item.dateTime,
        customerName: item.customerName,
        script: item.script,
        qty: item.qty,
        lotSize: item.lotSize,
        lots: item.lots,
        buyPrice: effectiveBuyPrice ?? item.buyPrice,
        sellPrice: effectiveSellPrice ?? item.sellPrice,
        buyTime: item.buyTime,
        sellTime: item.sellTime,
        status: (isOpen && liveData?.status) || item.status,
        rawPnl: effectivePnl,
        pnl: effectivePnl !== undefined && effectivePnl !== null && effectivePnl !== '' ? effectivePnl : '-',
        'p&l': effectivePnl !== undefined && effectivePnl !== null && effectivePnl !== '' ? effectivePnl : '-',
        masterBrokerCommission: item.masterBrokerCommission,
      };
    });

    // Apply date filter
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      filtered = filtered.filter((item: any) => {
        let itemDate;
        if (item.rawDate) {
          itemDate = new Date(item.rawDate);
          if (isNaN(itemDate.getTime())) {
            itemDate = new Date(item.rawDate.split('T')[0]);
          }
        }
        if (!itemDate || isNaN(itemDate.getTime())) {
          return true;
        }
        itemDate.setHours(0, 0, 0, 0);
        return itemDate >= from && itemDate <= to;
      });
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((item: any) => {
        const itemStatus = item.status?.toUpperCase() || '';
        const filterVal = statusFilter.toUpperCase();
        if (filterVal === 'CLOSE' || filterVal === 'CLOSED') {
          return itemStatus === 'CLOSE' || itemStatus === 'CLOSED';
        }
        return itemStatus === filterVal;
      });
    }

    return filtered;
  }, [ledgerDataaa, fromDate, toDate, statusFilter, livePnlMap]);

  // Calculate total P&L accurately from all ledger records
  const totalPnL = useMemo(() => {
    return ledgerRows.reduce((sum: number, item: any) => {
      const pnl = extractPnL(item);
      return sum + (pnl !== undefined && !isNaN(pnl) ? pnl : 0);
    }, 0);
  }, [ledgerRows]);

  // Ledger Columns
  const baseColumns = [
    {
      header: 'Date & Time',
      accessor: 'dateTime',
      render: (item: any) => <span>{formatDateTime(item.dateTime)}</span>
    },
    { header: 'Customer Name', accessor: 'customerName' },
    { header: 'Script', accessor: 'script' },
    { header: 'Qty/Lot', accessor: (item: any) => formatQtyLot(item) },
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
      header: 'Buy Time',
      accessor: 'buyTime',
      render: (item: any) => <span>{item.buyTime ? formatDateTime(item.buyTime) : '-'}</span>,
    },
    {
      header: 'Sell Time',
      accessor: 'sellTime',
      render: (item: any) => <span>{item.sellTime ? formatDateTime(item.sellTime) : '-'}</span>,
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
      }
    },
    {
      header: 'Master Broker Commission',
      accessor: 'masterBrokerCommission',
      render: (item: any) => <span>{formatIndianCurrency(item.masterBrokerCommission)}</span>
    },
  ];

  // Trading Ledger Columns
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
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${item.type === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
        <span className='text-gray-900'>
          {formatIndianCurrency(item.amount)}
        </span>
      ),
    },
    {
      header: 'Balance After',
      accessor: 'balanceAfter',
      render: (item: any) => (
        <span className="text-gray-900">{formatIndianCurrency(item.balanceAfter)}</span>
      ),
    },
    {
      header: 'Notes',
      accessor: 'Notes',
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
      if (editData.aadharCardNumber && editData.aadharCardNumber !== displayClient?.aadharCardNumber) {
        updateData.aadharCardNumber = editData.aadharCardNumber;
      }
      if (editData.brokeragePercent && editData.brokeragePercent !== displayClient?.brokeragePercent) {
        updateData.brokeragePercent = editData.brokeragePercent;
      }
      if (editData.address && editData.address !== displayClient?.address) {
        updateData.address = editData.address;
      }
      if (editData.password) {
        updateData.password = editData.password;
      }
      if (editData.stockHoldingLimit && editData.stockHoldingLimit !== stockHoldingLimit) {
        updateData.stockHoldingLimit = editData.stockHoldingLimit;
      }
      if (editData.panCardNumber && editData.panCardNumber !== displayClient?.panCardNumber) {
        updateData.panCardNumber = editData.panCardNumber;
      }
      if (editData.type && editData.type !== displayClient?.type) {
        updateData.type = editData.type;
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
      await refetch();
      // toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditData({
      fullname: '',
      phoneNumber: '',
      aadharCardNumber: '',
      panCardNumber: '',
      brokeragePercent: '',
      address: '',
      password: '',
      type: '',
      stockHoldingLimit: '',
    });
    setIsEditing(false);
  };

  const handleBack = () => {
    navigate({ to: '/masterbroker/client-dashboard' });
  };

  const handleEditClick = () => {
    setEditData({
      fullname: fullName,
      phoneNumber: phone,
      aadharCardNumber: displayClient?.aadharCardNumber || '',
      panCardNumber: displayClient?.panCardNumber || '',
      brokeragePercent: displayClient?.brokeragePercent || '',
      address: displayClient?.address || '',
      password: '',
      type: displayClient?.type || '',
      stockHoldingLimit: displayClient?.stockHoldingLimit || '',
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

      toast.success(`₹${walletAmount} ${walletActionType === 'add' ? 'deposited' : 'withdrawn'} successfully!`);
      setIsWalletModalOpen(false);
      setWalletAmount('');
      setWalletPin('');
      setShowWalletPin(false);
      await refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Transaction failed');
    }
  };

  const handleOpenMarginModal = () => {
    setIntradayMargin(String(clientData?.intradayLeverage ?? ''));
    setHoldingMargin(String(clientData?.deliveryLeverage ?? ''));
    setMarginPin('');
    setShowMarginPin(false);
    setIsMarginModalOpen(true);
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
      await addMargin({
        customerId: id,
        intradayLeverage: parseFloat(intradayMargin),
        deliveryLeverage: parseFloat(holdingMargin),
        securityPin: marginPin,
      });

      toast.success('Margin added successfully!');
      setIsMarginModalOpen(false);
      setIntradayMargin('');
      setHoldingMargin('');
      setMarginPin('');
      setShowMarginPin(false);
      await refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add margin');
    }
  };

  const handleRefresh = () => {
    refetch();
    refetchLedger();
    toast.success('Data refreshed');
  };

  const clearDateFilters = () => {
    setFromDate('');
    setToDate('');
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8 text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-orange-500" />
        <p className="text-slate-500">Loading Trader details...</p>
      </div>
    );
  }

  const fullName = displayClient?.user?.fullname || 'Unknown';
  const email = displayClient?.user?.email || 'N/A';
  const phone = displayClient?.user?.phoneNumber || 'N/A';
  const stockHoldingLimit = displayClient?.stockHoldingLimit || 'N/A';
  const isActive = displayClient?.user?.isActive || false;
  const isVerified = displayClient?.user?.isVerified || false;
  const walletAmountValue = parseFloat(displayClient?.wallets?.amount || '0');
  const blockedAmount = parseFloat(displayClient?.wallets?.blockedAmount || '0');
  const aadharNumber = displayClient?.aadharCardNumber || 'N/A';
  const hasDocuments = displayClient?.aadharCard || displayClient?.panCard || displayClient?.passport || displayClient?.photo;

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
                <ShieldCheck className="h-3 w-3" /> CRN: {displayClient?.CRN || 'N/A'}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {email}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOpenMarginModal}
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

      {/* Quick Stats - 3 cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-3">
        <div className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-5 shadow-sm md:p-6">
          <div className="absolute right-0 top-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
            <Building2 className="h-16 w-16" />
          </div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Wallet Balance
          </div>
          <div className="text-xl font-semibold text-slate-900 md:text-2xl">
            {formatIndianCurrency(walletAmountValue)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <ArrowUpRight className="h-3 w-3" /> Available Balance
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-5 shadow-sm md:p-6">
          <div className="absolute right-0 top-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
            <CreditCard className="h-16 w-16" />
          </div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Blocked Amount
          </div>
          <div className="text-xl font-semibold text-slate-900 md:text-2xl">
            {formatIndianCurrency(blockedAmount)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-orange-600">
            <div className="h-2 w-2 rounded-full bg-orange-500" /> Blocked
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-5 shadow-sm md:p-6">
          <div className="absolute right-0 top-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
            <TrendingUp className="h-16 w-16" />
          </div>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total P&L
          </div>
          <div className="text-xl font-semibold text-slate-900 md:text-2xl">
            {totalPnL > 0 ? (
              <span className="text-green-600">+{formatIndianCurrency(totalPnL)}</span>
            ) : totalPnL < 0 ? (
              <span className="text-red-600">{formatIndianCurrency(totalPnL)}</span>
            ) : (
              <span className="text-gray-600">₹0</span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium">
            {totalPnL > 0 ? (
              <div className="flex items-center gap-1 text-green-600">
                <div className="h-2 w-2 rounded-full bg-green-500" /> Profit
              </div>
            ) : totalPnL < 0 ? (
              <div className="flex items-center gap-1 text-red-600">
                <div className="h-2 w-2 rounded-full bg-red-500" /> Loss
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-500">
                <div className="h-2 w-2 rounded-full bg-gray-400" /> Break-even
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="rounded-lg border border-stroke  shadow-default dark:border-strokedark dark:bg-boxdark bg-[#f8fafc]">
        <div className="flex flex-wrap items-center justify-between rounded-t-lg border-b border-stroke bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 md:px-6 md:py-4">
          <h2 className="text-lg font-semibold text-white md:text-xl">
            Trader Profile
          </h2>
          {!isEditing ? (
            <button
              onClick={handleEditClick}
              className="hover:bg-gray-100 flex items-center gap-2 rounded bg-white px-3 py-1.5 text-sm font-medium text-orange-500 transition-colors md:px-4 md:py-2"
            >
              <FiEdit2 className="h-3 w-3 md:h-4 md:w-4" /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 rounded bg-red-100 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-200 md:px-4 md:py-2"
              >
                <FiX className="h-3 w-3 md:h-4 md:w-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="hover:bg-gray-100 flex items-center gap-2 rounded bg-white px-3 py-1.5 text-sm font-medium text-orange-500 transition-colors md:px-4 md:py-2"
              >
                <FiSave className="h-3 w-3 md:h-4 md:w-4" /> Save
              </button>
            </div>
          )}
        </div>

        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {/* Full Name */}
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullname"
                  value={editData.fullname}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                />
              ) : (
                <p className="text-sm text-black dark:text-white md:text-base">
                  {fullName}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="phoneNumber"
                  value={editData.phoneNumber}
                  onChange={handleInputChange}
                  maxLength={10}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                />
              ) : (
                <p className="text-sm text-black dark:text-white md:text-base">
                  {phone}
                </p>
              )}
            </div>

            {/* Aadhar Number */}
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Aadhar Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="aadharCardNumber"
                  value={editData.aadharCardNumber}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                  placeholder="Enter 12-digit Aadhar number"
                />
              ) : (
                <p className="text-sm text-black dark:text-white md:text-base">
                  {aadharNumber}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Password
              </label>
              {isEditing ? (
                <input
                  type="password"
                  name="password"
                  value={editData.password || ''}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                />
              ) : (
                <p className="text-sm text-black dark:text-white md:text-base">
                  ••••••••
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Area
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={editData.address}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                />
              ) : (
                <p className="text-sm text-black dark:text-white md:text-base">
                  {displayClient?.address || 'N/A'}
                </p>
              )}
            </div>

            {/* Pincode
                <div>
                  <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                    Pincode
                  </label>
                  <p className="text-sm text-black dark:text-white md:text-base">
                    {displayClient?.pincode || 'N/A'}
                  </p>
                </div> */}
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Pancard
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="panCardNumber"
                  value={editData.panCardNumber}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                />
              ) : (
                <p className="text-sm text-black dark:text-white md:text-base">
                  {displayClient?.panCardNumber || 'N/A'}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Minimum Stock Holding time(in minute)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="stockHoldingLimit"
                  value={editData?.stockHoldingLimit ?? ''}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                />
              ) : (
                <p className="text-sm text-black dark:text-white md:text-base">
                  {stockHoldingLimit !== undefined ? stockHoldingLimit : 'N/A'}
                </p>
              )}
            </div>



            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Customer Type <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <select
                  name="type"
                  value={editData.type || ''}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                >
                  <option value="mega">Mega</option>
                  <option value="mini">Mini</option>
                </select>
              ) : (
                <p className="text-sm text-black dark:text-white md:text-base">
                  {displayClient?.type || 'N/A'}
                </p>
              )}
            </div>





          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm mt-6">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50/30 px-4 py-3 md:px-6 md:py-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            Verified Documentation
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:gap-4 md:p-6 lg:grid-cols-3">
          {displayClient?.aadharCard && (
            <DocCard
              name="Aadhar Card"
              type="ID Proof"
              status="Verified"
              icon={FileText}
              color="bg-rose-50 text-rose-500"
              url={displayClient.aadharCard}
            />
          )}
          {displayClient?.panCard && (
            <DocCard
              name="PAN Card"
              type="Tax ID"
              status="Verified"
              icon={FileText}
              color="bg-orange-50 text-orange-500"
              url={displayClient.panCard}
            />
          )}
          {displayClient?.passport && (
            <DocCard
              name="Passport"
              type="ID Proof"
              status="Verified"
              icon={FileText}
              color="bg-blue-50 text-blue-500"
              url={displayClient.passport}
            />
          )}
          {displayClient?.photo && (
            <DocCard
              name="Profile Photo"
              type="Photo"
              status="Verified"
              icon={ImageIcon}
              color="bg-purple-50 text-purple-500"
              url={displayClient.photo}
            />
          )}
          {!hasDocs && (
            <p className="col-span-3 py-4 text-center text-sm text-slate-400">
              No documents uploaded
            </p>
          )}
        </div>
      </div>

      {/* Tabs Section - Ledger & Payment History */}
      <div className="mt-6 rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 px-4 py-2 md:px-6">
          {/* Tabs */}
          <div className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-2 text-xs font-semibold transition-colors md:px-4 md:py-3 md:text-sm ${activeTab === 'ledger'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <TrendingUp className="inline h-4 w-4 mr-1" />
              Trader Ledger ({ledgerRows.length})
            </button>
            <button
              onClick={() => setActiveTab('tradingledger')}
              className={`px-3 py-2 text-xs font-semibold transition-colors md:px-4 md:py-3 md:text-sm ${activeTab === 'tradingledger'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <CreditCard className="inline h-4 w-4 mr-1" />
              Payment History ({tradingLedgerData.length})
            </button>
          </div>

          {/* Filters - Only show for Ledger tab */}
          {activeTab === 'ledger' && (
            <div className="flex flex-wrap items-center gap-2 py-1">
              {/* Date Filters */}
              <div className="flex items-center gap-1 bg-white rounded-lg border border-stroke px-2 py-1 md:gap-2">

                <div className="flex items-center gap-1">
                  <label className="text-[10px] font-medium text-gray-600 hidden sm:inline md:text-xs">From:</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="border-0 px-0.5 py-0.5 text-[10px] focus:outline-none focus:ring-0 w-16 sm:w-20 md:w-28 md:text-sm"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <label className="text-[10px] font-medium text-gray-600 hidden sm:inline md:text-xs">To:</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="border-0 px-0.5 py-0.5 text-[10px] focus:outline-none focus:ring-0 w-16 sm:w-20 md:w-28 md:text-sm"
                  />
                </div>
                {(fromDate || toDate) && (
                  <button
                    onClick={clearDateFilters}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    title="Clear date filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-white rounded-lg border border-stroke px-2 py-1">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border-0 bg-transparent px-0.5 py-0.5 text-[10px] focus:outline-none focus:ring-0 w-20 sm:w-24 md:w-32 md:text-sm"
                >
                  <option value="">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                </select>
                {statusFilter && (
                  <button
                    onClick={() => setStatusFilter('')}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    title="Clear status filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="rounded bg-orange-500 flex px-1 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 mr-2"
              >
                <RefreshCcw className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          )}

          {/* Refresh Button for Payment History tab */}
          {activeTab === 'tradingledger' && (
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1 bg-orange-500 px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-orange-600 rounded-lg md:px-3 md:py-1.5 md:text-xs"
            >
              <RefreshCcw className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-6">
          {activeTab === 'ledger' && (
            <div className="overflow-x-auto">
              <GenericTable
                columns={baseColumns}
                data={ledgerRows}
                paginationOff={true}
              />
            </div>
          )}

          {activeTab === 'tradingledger' && (
            <div className="overflow-x-auto">
              {tradingLedgerData.length > 0 ? (
                <GenericTable
                  data={tradingLedgerData}
                  columns={tradingLedgerColumns}
                  searchAble={true}
                  searchFields={['type', 'tradeId']}
                  itemsPerPage={10}
                />
              ) : (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-slate-400">No trading ledger entries found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Wallet Balance Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-5 shadow-xl md:p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              {walletActionType === 'add' ? 'Deposit Money' : 'Withdraw Money'}
            </h3>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                Current Wallet Balance
              </label>
              <div className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900">
                {formatIndianCurrency(walletAmountValue)}
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setWalletActionType('add')}
                className={`rounded-lg py-2 text-sm font-semibold transition-all ${walletActionType === 'add' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                  }`}
              >
                Deposit
              </button>
              <button
                type="button"
                onClick={() => setWalletActionType('withdraw')}
                className={`rounded-lg py-2 text-sm font-semibold transition-all ${walletActionType === 'withdraw' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                  }`}
              >
                Withdraw
              </button>
            </div>

            <form onSubmit={handleWalletSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  placeholder="Enter Amount"
                   autoComplete="off"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                  Security PIN
                </label>
                <div className="relative">
                  <input
                    type={showWalletPin ? 'text' : 'password'}
                    required
                    placeholder="Enter Security PIN"
                    value={walletPin}
                     autoComplete="new-password"
                    onChange={(e) => setWalletPin(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWalletPin(!showWalletPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showWalletPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsWalletModalOpen(false);
                    setWalletAmount('');
                    setWalletPin('');
                    setShowWalletPin(false);
                  }}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDepositPending || isWithdrawPending}
                  className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-medium text-white shadow-md shadow-orange-200 transition-colors hover:bg-orange-600 disabled:opacity-50"
                >
                  {isDepositPending || isWithdrawPending ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Margin Modal */}
      {isMarginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-5 shadow-xl md:p-6">
            <h3 className="mb-6 text-lg font-bold text-slate-900">Add Margin</h3>

            <form onSubmit={handleMarginSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                  Intraday Margin
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter Intraday Margin"
                    value={intradayMargin ? `${intradayMargin}X` : ""}
                    onChange={(e) => setIntradayMargin(e.target.value.replace('X', '').trim())}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-12 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">X</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                  Holding Margin
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter Holding Margin"
                    value={holdingMargin ? `${holdingMargin}X` : ""}
                    onChange={(e) => setHoldingMargin(e.target.value.replace('X', '').trim())}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-12 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">X</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                  Security PIN
                </label>
                <div className="relative">
                  <input
                    type={showMarginPin ? 'text' : 'password'}
                    required
                    placeholder="Enter Security PIN"
                    value={marginPin}
                    onChange={(e) => setMarginPin(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMarginPin(!showMarginPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showMarginPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsMarginModalOpen(false);
                    setIntradayMargin('');
                    setHoldingMargin('');
                    setMarginPin('');
                    setShowMarginPin(false);
                  }}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isMarginPending}
                  className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-medium text-white shadow-md shadow-orange-200 transition-colors hover:bg-orange-600 disabled:opacity-50"
                >
                  {isMarginPending ? 'Processing...' : 'Add Margin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};