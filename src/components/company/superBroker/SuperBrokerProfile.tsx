import React, { useState, useMemo, useEffect } from 'react';
import {
  FiEdit2,
  FiSave,
  FiX,
  FiArrowLeft,
  FiPlus,
  FiPrinter,
} from 'react-icons/fi';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {
  useGetAllSuperBrockerById,
  useUpdateSuperBrokerProfile,
  useAddCommission,
  useGetSuperBrokerLedger,
  useGetSuperBrokerPaymentHistory,
  useAllSuperBrockerBrokers,
} from '@/lib/react-query/superbrocker';
import { Route } from '@/routes/_app/companybroker/SuperbrockerProfile.$id';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { Eye, EyeOff, RefreshCcw } from 'lucide-react';
import { formatIndianCurrency, formatIndianNumber } from '@/utils/formatIndianNumber';
import { useAuthContext } from '@/context/AuthContext';

// Format date function
const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
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

const SuperBrokerProfile = () => {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('ledger');
  const [isLedgerExpanded, setIsLedgerExpanded] = useState(false);
  const [paymentStartDate, setPaymentStartDate] = useState('');
  const [paymentEndDate, setPaymentEndDate] = useState('');

  const [paidStartDate, setPaidStartDate] = useState('');
  const [paidEndDate, setPaidEndDate] = useState('');
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');
  const [commissionStartDate, setCommissionStartDate] = useState('');
  const [commissionEndDate, setCommissionEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  // Commission Modal State
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [commissionAmount, setCommissionAmount] = useState('');
  const [commissionPin, setCommissionPin] = useState('');
  const [showCommissionPin, setShowCommissionPin] = useState(false);
  const [commissionType, setCommissionType] = useState<'credit' | 'debit'>(
    'credit',
  );

  const { user, token } = useAuthContext();
  const [livePnlMap, setLivePnlMap] = useState<Map<string, any>>(new Map());

  // WebSocket connection for live P&L and prices in SuperBroker Profile Ledger
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

    console.log('[SuperBrokerProfile WS] Connecting to:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[SuperBrokerProfile WS] Connected to room: transaction_ledger');
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
          console.log('[SuperBrokerProfile WS] Auto-refresh triggered via TRANSACTION_LEDGER_TRADE_CHANGED');
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

          setLivePnlMap((prevMap) => {
            const nextMap = new Map(prevMap);
            liveOpenTrades.forEach((t: any) => {
              if (!t) return;
              const newPnl = t.pnl !== undefined ? t.pnl : t['p&l'];
              const status = t.status || 'OPEN';
              const orderId = t.orderId || t.tradeId || t.transactionId || t.id || t._id;
              if (orderId && newPnl !== undefined) {
                console.log('orderId:', orderId, 'P&L:', newPnl, 'status:', status);
              }

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
        console.error('[SuperBrokerProfile WS] Message error:', err);
      }
    };

    return () => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'LEAVE_TRANSACTION_LEDGER' }));
        }
        ws.close();
      } catch (_) {}
    };
  }, [user, token]);

  const { data: profileData, refetch } = useGetAllSuperBrockerById(id);
  const { data: getbrokerData = [] } = useAllSuperBrockerBrokers(id);
  console.log("ajkdhskjhd", getbrokerData)
  const { mutate: updateSuperBrokerProfile, isPending: isUpdating } =
    useUpdateSuperBrokerProfile();
  const { mutate: addCommission, isPending: isCommissionPending } =
    useAddCommission();

  const { data: ledgerDataFromApi, isLoading: isLoadingLedger } =
    useGetSuperBrokerLedger(id);

  // Add this after the ledger hook
  const {
    data: paymentDataFromApi,
    isLoading: isLoadingPayment,
    refetch: refetchPayment,
  } = useGetSuperBrokerPaymentHistory(id);

  console.log('report dataaa', paymentDataFromApi);

  // Validation errors state for edit form
  const [editErrors, setEditErrors] = useState({
    phoneNumber: '',
    aadharCardNumber: '',
  });

  const [editData, setEditData] = useState({
    fullname: '',
    phoneNumber: '',
    commission: '',
    area: '',
    aadharCardNumber: '',
    password: '',
  });

  // Update editData when profileData loads
  useEffect(() => {
    if (profileData) {
      setEditData({
        fullname: profileData?.fullname || '',
        phoneNumber: profileData?.phoneNumber || '',
        commission: profileData?.upcomingBrokeragePercent?.toString() || '',
        area: profileData?.area || '',
        aadharCardNumber: profileData?.aadharCardNumber || '',
        password: '',
      });
      // Clear validation errors
      setEditErrors({ phoneNumber: '', aadharCardNumber: '' });
    }
  }, [profileData]);

  // Get current week's Monday and Sunday
  const getCurrentWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return {
      startDate: monday.toISOString().split('T')[0],
      endDate: sunday.toISOString().split('T')[0],
    };
  };

  // Initialize dates with current week range
  useEffect(() => {
    const { startDate, endDate } = getCurrentWeekRange();
    setLedgerStartDate(startDate);
    setLedgerEndDate(endDate);
    setPaymentStartDate(startDate);
    setPaymentEndDate(endDate);
    setCommissionStartDate(startDate);
    setCommissionEndDate(endDate);
  }, []);

  const brokersList = useMemo(() => {
    // The API response structure is: { data: { data: [...] } }
    const brokers = getbrokerData?.data?.data || getbrokerData?.data || [];
    return brokers.map((broker: any, index: number) => ({
      ...broker,
      srNo: index + 1,
      // Map commission from brokeragePercent
      commission: broker.brokeragePercent || 0,
      // Map user details correctly
      user: {
        fullname: broker.fullname || '',
        phoneNumber: broker.phoneNumber || '',
      }
    }));
  }, [getbrokerData]);

  // Commission History Data from API
  const commissionHistoryList = useMemo(() => {
    const commissions = paymentDataFromApi?.commissionHistory || [];
    return commissions.map((item: any, index: number) => ({
      ...item,
      srNo: index + 1,
      commissionGenerated: parseFloat(item.commissionGenerated),
    }));
  }, [paymentDataFromApi?.commissionHistory]);

  // paid history data from api
  const paidHistoryList = useMemo(() => {
    const paids = paymentDataFromApi?.paidHistory || [];
    return paids.map((item: any, index: number) => ({
      ...item,
      srNo: index + 1,
      amount: parseFloat(item.amount),
    }));
  }, [paymentDataFromApi?.paidHistory]);

  // Calculate total commission from history
  const totalCommissionAmount = useMemo(() => {
    return commissionHistoryList.reduce(
      (sum, item) => sum + item.amountValue,
      0,
    );
  }, [commissionHistoryList]);

  // Calculate pending commission (Total Commission - Paid Commission)
  const pendingCommission = useMemo(() => {
    const total = profileData?.totalCommission || 0;
    const paid = profileData?.paidCommission || 0;
    return total - paid;
  }, [profileData?.totalCommission, profileData?.paidCommission]);

  // Filter commission history by date range
  const filteredCommissionHistory = useMemo(() => {
    if (!commissionStartDate || !commissionEndDate)
      return commissionHistoryList;
    return commissionHistoryList.filter((item: any) => {
      const itemDate = new Date(item.date);
      const startDate = new Date(commissionStartDate);
      const endDate = new Date(commissionEndDate);
      endDate.setHours(23, 59, 59, 999);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [commissionHistoryList, commissionStartDate, commissionEndDate]);

  // Mock data for ledger (replace with actual API data)
  const ledgerData = useMemo(() => {
    if (!ledgerDataFromApi || !Array.isArray(ledgerDataFromApi)) {
      return [];
    }

    // Helper to format commission values
    const formatCommission = (value: any) => {
      if (value === null || value === undefined || isNaN(Number(value)))
        return '-';
      return `₹${Number(value).toFixed(2)}`;
    };

    return ledgerDataFromApi.map((item: any) => {
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
      const effectiveBuyPrice = liveData && liveData.buyPrice !== undefined && liveData.buyPrice !== null
        ? liveData.buyPrice
        : (isBuy ? item.buyPrice : (liveData?.currentPrice ?? item.buyPrice));

      const effectiveSellPrice = liveData && liveData.sellPrice !== undefined && liveData.sellPrice !== null
        ? liveData.sellPrice
        : (!isBuy ? item.sellPrice : (liveData?.currentPrice ?? item.sellPrice));

      return {
        ...item,
        rawDateTime: item.dateTime,
        dateTime: formatDateTime(item.dateTime),
        customerName: item.customerName || item.customername || '-',
        script: item.script || '-',
        qty:
          item.qty && item.lotSize
            ? `${item.qty}/${item.lotSize}`
            : item.qty || '-',
        buyPrice: effectiveBuyPrice !== undefined && effectiveBuyPrice !== null
          ? (typeof effectiveBuyPrice === 'number' ? `₹${effectiveBuyPrice.toFixed(2)}` : effectiveBuyPrice)
          : (item.buyPrice ? `₹${Number(item.buyPrice).toFixed(2)}` : '-'),
        sellPrice: effectiveSellPrice !== undefined && effectiveSellPrice !== null
          ? (typeof effectiveSellPrice === 'number' ? `₹${effectiveSellPrice.toFixed(2)}` : effectiveSellPrice)
          : (item.sellPrice ? `₹${Number(item.sellPrice).toFixed(2)}` : '-'),
        status: liveData?.status || item.status || 'Pending',
        rawPnl: effectivePnl,
        pnl: effectivePnl !== undefined && effectivePnl !== null && effectivePnl !== '' ? effectivePnl : (item.pnl ? `₹${Number(item.pnl).toFixed(2)}` : '-'),
        buyTime: item.buyTime ? formatDateTime(item.buyTime) : '-',
        sellTime: item.sellTime ? formatDateTime(item.sellTime) : '-',
        superBrokerCommission: formatCommission(
          item.superBrokerCommission || item.superbrokercommission,
        ),
        orderType: item.orderType || '-',
        holdingType: item.holdingType || '-',
        price: item.price ? `₹${Number(item.price).toFixed(2)}` : '-',
        paidAmount: item.paidAmount
          ? `₹${Number(item.paidAmount).toFixed(2)}`
          : '-',
        marginAmount: item.marginAmount
          ? `₹${Number(item.marginAmount).toFixed(2)}`
          : '-',
        transactionAmount: item.transactionAmount
          ? `₹${Number(item.transactionAmount).toFixed(2)}`
          : '-',
        paymentStatus: item.paymentStatus || '-',
        transactionId: item.transactionId || '-',
      };
    });
  }, [ledgerDataFromApi, livePnlMap]);

  const paymentData = useMemo(() => {
    if (!paymentDataFromApi || !Array.isArray(paymentDataFromApi.data)) {
      return [];
    }

    return paymentDataFromApi.data.map((item: any) => ({
      // Store the original date for filtering
      rawDate: item.date || item.createdAt || item.paymentDate || item.paidDate,
      date: formatDateTime(
        item.date || item.createdAt || item.paymentDate || item.paidDate,
      ),
      commissionGenerated:
        item.commissionGenerated || item.totalCommission || 0,
      pendingGenerated: item.commissionGenerated - item.paidCommission || 0,
      paidCommission: item.paidCommission || item.paidAmount || 0,
      paidDate: item.paidDate ? formatDateTime(item.paidDate) : '-',
      status: item.status || item.paymentStatus || 'Pending',
      transactionId: item.transactionId || '-',
      paymentMethod: item.paymentMethod || '-',
      note: item.note || '-',
    }));
  }, [paymentDataFromApi]);

  const ledgerDataWithSr = useMemo(() => {
    return ledgerData.map((item: any, index: number) => ({
      ...item,
      sr: index + 1,
    }));
  }, [ledgerData]);

  console.log('ledgerrrrrr', ledgerData);
  const paymentDataWithSr = useMemo(() => {
    return paymentData.map((item: any, index: number) => ({
      ...item,
      sr: index + 1,
    }));
  }, [paymentData]);

  const baseLedgerColumns = [
    { header: 'Date & Time', accessor: 'dateTime' },
    { header: 'Trader Name', accessor: 'customerName' },
    { header: 'Script', accessor: 'script' },
    { header: 'Qty/Lot', accessor: 'qty' },
    {
      header: 'Buy Price',
      accessor: 'buyPrice',
      render: (item: any) => <span className="font-medium">{formatIndianCurrency(item.buyPrice || '-')}</span>
    },
    {
      header: 'Sell Price',
      accessor: 'sellPrice',
      render: (item: any) => <span className="font-medium">{formatIndianCurrency(item.sellPrice || '-')}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item: any) => <span>{item.status || '-'}</span>,
    },
    {
      header: 'P&L',
      accessor: 'pnl',
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
      header: 'Super Broker Commission',
      accessor: 'superBrokerCommission',
      render: (item: any) => <span className="">{formatIndianCurrency(item.superBrokerCommission || '-')}</span>
    },
  ];

  const paymentColumns = [
    { header: 'S.No', accessor: 'sr' },
    {
      header: 'Date',
      accessor: 'date',
      render: (item: any) => <span>{item.date}</span>,
    },
    {
      header: 'Commission Generated',
      accessor: 'commissionGenerated',
      render: (item: any) => (
        <span>{formatIndianCurrency(item.commissionGenerated)}</span>
      ),
    },
    {
      header: 'Pending Commission',
      accessor: 'PendingCommission',
      render: (item: any) => (
        <span>{formatIndianCurrency(item.PendingCommission)}</span>
      ),
    },
    {
      header: 'Paid Commission',
      accessor: 'paidcommission',
      render: (item: any) => (
        <span>{formatIndianCurrency(item.paidcommission)}</span>
      ),
    },
    {
      header: 'Paid Date',
      accessor: 'paidDate',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item: any) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${item.status === 'Paid'
            ? 'bg-green-100 text-green-700'
            : item.status === 'Pending'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700'
            }`}
        >
          {item.status}
        </span>
      ),
    },
  ];

  const paidColumns = [
    // { header: 'S.No', accessor: 'srNo' },
    {
      header: 'Date',
      accessor: 'date',
      render: (item: any) => (
        <span>
          {item?.date
            ? new Date(item.date).toLocaleString('en-IN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })
            : '-'}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      render: (item: any) => <span>₹{formatIndianNumber(item?.amount)} </span>,
    },
  ];

  // Commission History Columns
  const commissionColumns = [
    {
      header: 'Date & Time',
      accessor: 'date',
      render: (item: any) => (
        <span className="text-sm">
          {item.date
            ? new Date(item.date).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
            : '-'}
        </span>
      ),
    },
    {
      header: 'Commission (₹)',
      accessor: 'commissionGenerated',
      render: (item: any) => (
        <span className="text-gray-900 text-sm font-semibold">
          {formatIndianCurrency(item?.commissionGenerated)}
        </span>
      ),
    },
    {
      header: 'Pending Commission (₹)',
      accessor: 'pendingCommission',
      render: (item: any) => (
        <span className="text-gray-900 text-sm font-semibold">
          {formatIndianCurrency(item?.pendingCommission)}
        </span>
      ),
    },
    {
      header: 'Paid Commission (₹)',
      accessor: 'paidCommission',
      render: (item: any) => (
        <span className="text-gray-900 text-sm font-semibold">
          {formatIndianCurrency(item?.paidCommission)}
        </span>
      ),
    },
    {
      header: 'Paid Date',
      accessor: 'paidDate',
      render: (item: any) => (
        <span className="text-sm">
          {item.paidDate
            ? new Date(item.paidDate).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
            : '-'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item: any) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${item.status === 'Paid'
            ? 'bg-green-100 text-green-700'
            : item.status === 'Pending'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700'
            }`}
        >
          {item.status}
        </span>
      ),
    },
  ];

  const brokerColumns = [
    {
      header: 'Broker Name',
      accessor: 'fullname',
      render: (item: any) => (
        <div className="font-semibold text-black">
          {item?.fullname || '-'}
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessor: 'phoneNumber',
      render: (item: any) => (
        <span className="text-gray-700">{item?.phoneNumber || '-'}</span>
      ),
    },
    {
      header: 'BKId',
      accessor: 'BKId',
      render: (item: any) => (
        <span className="font-mono text-gray-600 text-sm font-medium">
          {item?.BKId || '-'}
        </span>
      ),
    },
    {
      header: 'Commission',
      accessor: 'brokeragePercent',
      render: (item: any) => (
        <span className="rounded border border-orange-100 bg-orange-50 px-2 py-1 text-xs font-bold text-orange-600">
          {item?.brokeragePercent || item?.commission ? `${item?.brokeragePercent || item?.commission}%` : '-'}
        </span>
      ),
    },
    {
      header: 'Total Commission',
      accessor: 'totalCommission',
      render: (item: any) => (
        <span className="text-gray-700">{formatIndianCurrency(item?.totalCommission)}</span>
      ),
    },
    {
      header: 'Pending Commission',
      accessor: 'pendingCommission',
      render: (item: any) => {
        const total = parseFloat(item?.totalCommission || 0);
        const paid = parseFloat(item?.totalPaidCommission || 0);
        const pending = total - paid;
        return <span className="text-gray-700">{formatIndianCurrency(pending)} </span>;
      },
    },
  ];

  // ===== VALIDATION FUNCTIONS =====

  const validatePhoneNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length === 0) {
      return ''; // No error for empty (optional field)
    }
    if (cleanValue.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }
    return '';
  };

  const validateAadharNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length === 0) {
      return ''; // No error for empty (optional field)
    }
    if (cleanValue.length !== 12) {
      return 'Aadhar number must be exactly 12 digits';
    }
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Format and validate on change
    let formattedValue = value;
    let error = '';

    if (name === 'phoneNumber') {
      formattedValue = value.replace(/\D/g, '').slice(0, 10);
      error = validatePhoneNumber(formattedValue);
      setEditErrors((prev) => ({ ...prev, phoneNumber: error }));
    } else if (name === 'aadharCardNumber') {
      formattedValue = value.replace(/\D/g, '').slice(0, 12);
      error = validateAadharNumber(formattedValue);
      setEditErrors((prev) => ({ ...prev, aadharCardNumber: error }));
    }

    setEditData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleSave = () => {
    if (!id) {
      toast.error('Super Broker ID is missing');
      return;
    }

    // Validate phone number
    const phoneError = validatePhoneNumber(editData.phoneNumber);
    if (phoneError) {
      setEditErrors((prev) => ({ ...prev, phoneNumber: phoneError }));
      toast.error(phoneError);
      return;
    }

    // Validate Aadhar number
    const aadharError = validateAadharNumber(editData.aadharCardNumber);
    if (aadharError) {
      setEditErrors((prev) => ({ ...prev, aadharCardNumber: aadharError }));
      toast.error(aadharError);
      return;
    }

    if (editData.password && editData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    const updatePayload: any = {
      fullname: editData.fullname,
      phoneNumber: editData.phoneNumber,
      commission: editData.commission,
      area: editData.area,
      aadharCardNumber: editData.aadharCardNumber,
    };

    if (editData.password) {
      updatePayload.password = editData.password;
    }

    updateSuperBrokerProfile(
      {
        id: id,
        data: updatePayload,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setShowPassword(false);
          setEditErrors({ phoneNumber: '', aadharCardNumber: '' });
          refetch();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || 'Failed to update profile',
          );
        },
      },
    );
  };

  const handleCancel = () => {
    if (profileData) {
      setEditData({
        fullname: profileData?.fullname || '',
        phoneNumber: profileData?.phoneNumber || '',
        commission: profileData?.upcomingBrokeragePercent?.toString() || '',
        area: profileData?.area || '',
        aadharCardNumber: profileData?.aadharCardNumber || '',
        password: '',
      });
    }
    setIsEditing(false);
    setShowPassword(false);
    setEditErrors({ phoneNumber: '', aadharCardNumber: '' });
  };

  const handleBack = () => {
    navigate({ to: '/companybroker/DisplaySuperBroker' });
  };

  const handleCommissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commissionPin) {
      toast.error('Please enter security PIN');
      return;
    }

    if (commissionPin.length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }

    addCommission(
      {
        id: id,
        data: {
          amount: parseFloat(commissionAmount),
          type: commissionType.toUpperCase(),
          securityPin: commissionPin,
        },
      },
      {
        onSuccess: () => {
          setIsCommissionModalOpen(false);
          setCommissionAmount('');
          setCommissionPin('');
          setShowCommissionPin(false);

          refetch();
          refetchPayment();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || 'Failed to process commission',
          );
        },
      },
    );
  };

  const filteredLedgerData = useMemo(() => {
    let result = ledgerDataWithSr;

    if (statusFilter) {
      result = result.filter((item: any) => {
        const itemStatus = item.status?.toLowerCase() || '';
        const filterVal = statusFilter.toLowerCase();
        if (filterVal === 'close' || filterVal === 'closed') {
          return itemStatus === 'close' || itemStatus === 'closed';
        }
        return itemStatus === filterVal;
      });
    }

    if (ledgerStartDate && ledgerEndDate) {
      result = result.filter((item: any) => {
        const itemDate = new Date(item.rawDateTime);
        const startDate = new Date(ledgerStartDate);
        const endDate = new Date(ledgerEndDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    return result;
  }, [ledgerDataWithSr, ledgerStartDate, ledgerEndDate, statusFilter]);

  console.log('filterledgerData', filteredLedgerData);
  const filteredPaymentData = useMemo(() => {
    if (!paymentStartDate || !paymentEndDate) return paymentDataWithSr;
    return paymentDataWithSr.filter((item: any) => {
      const itemDate = new Date(item.rawDate); // Use the raw date field
      const startDate = new Date(paymentStartDate);
      const endDate = new Date(paymentEndDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [paymentDataWithSr, paymentStartDate, paymentEndDate]);

  const filteredPaidHistory = useMemo(() => {
    if (!paidStartDate || !paidEndDate) return paidHistoryList;
    return paidHistoryList.filter((item: any) => {
      const itemDate = new Date(item.date);
      const startDate = new Date(paidStartDate);
      const endDate = new Date(paidEndDate);
      endDate.setHours(23, 59, 59, 999);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [paidHistoryList, paidStartDate, paidEndDate]);

  const handleOpenCommissionModal = () => {
    if (pendingCommission > 0) {
      setCommissionAmount(pendingCommission.toString());
    }
    setIsCommissionModalOpen(true);
  };

  // ========== PRINT ONLY ACTIVE TAB TABLE ==========
  const handlePrintTables = () => {
    // Get the active table data based on current tab
    let tableData: any[] = [];
    let tableColumns: any[] = [];
    let tableTitle = '';
    let dateRange = '';

    switch (activeTab) {
      case 'ledger':
        tableData = filteredLedgerData;
        // tableColumns = isLedgerExpanded ? expandedLedgerColumns : baseLedgerColumns;
        tableColumns = baseLedgerColumns;
        tableTitle = 'Ledger Records';
        dateRange =
          ledgerStartDate && ledgerEndDate
            ? `(${ledgerStartDate} to ${ledgerEndDate})`
            : '';
        break;
      case 'payment':
        tableData = filteredPaymentData;
        tableColumns = paymentColumns;
        tableTitle = 'Payment History';
        dateRange =
          paymentStartDate && paymentEndDate
            ? `(${paymentStartDate} to ${paymentEndDate})`
            : '';
        break;
      case 'broker':
        tableData = brokersList;
        tableColumns = brokerColumns;
        tableTitle = 'Brokers List';
        break;
      default:
        toast.error('No data available to print');
        return;
    }

    // Check if there's data to print
    if (tableData.length === 0) {
      toast.error(`No ${tableTitle} data available to print`);
      return;
    }

    // Create print container
    const printContainer = document.createElement('div');
    printContainer.id = 'print-tables';
    printContainer.style.cssText =
      'padding: 20px; font-family: Arial, sans-serif; background: white;';

    // Helper to get value from item
    const getValue = (item: any, accessor: string) => {
      if (accessor === 'srNo') return item.srNo || '-';
      if (accessor === 'dateTime') return item.dateTime || '-';
      if (accessor === 'createdAt') {
        return item.createdAt
          ? new Date(item.createdAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
          : '-';
      }
      if (accessor === 'amountValue') {
        return `₹${item.amountValue?.toLocaleString('en-IN') || '0'}`;
      }
      if (accessor === 'type') {
        return item.type === 'TRANSFER'
          ? 'Commission Transfer'
          : item.type || '-';
      }
      if (accessor === 'user.fullname') return item?.user?.fullname || '-';
      if (accessor === 'user.phoneNumber')
        return item?.user?.phoneNumber || '-';
      if (accessor === 'BKId') return item?.BKId || '-';
      if (accessor === 'commission')
        return item?.commission ? `${item.commission}%` : '-';
      if (
        accessor === 'totalBrokers' ||
        accessor === 'totalBusiness' ||
        accessor === 'totalCommission' ||
        accessor === 'pendingCommission'
      ) {
        return '-';
      }
      if (accessor.includes('.')) {
        const parts = accessor.split('.');
        let value = item;
        for (const part of parts) {
          value = value?.[part];
          if (value === undefined || value === null) break;
        }
        return value || '-';
      }
      return item[accessor] || '-';
    };

    // Generate table HTML
    const generateTable = (
      title: string,
      data: any[],
      columns: any[],
      range?: string,
    ) => {
      let html = `
      <div style="margin-bottom: 25px; page-break-inside: avoid;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #1a1a1a;">
          ${title} ${range || ''}
        </div>
        <div style="font-size: 12px; color: #666; margin-bottom: 10px;">
          Total Records: ${data.length}
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr>
    `;

      // Render headers with uppercase
      columns.forEach((col: any) => {
        html += `<th style="border: 1px solid #000; padding: 6px 8px; text-align: left; font-weight: bold; background: #f0f0f0; color: #1a4d2e; text-transform: uppercase; font-size: 10px;">${col.header}</th>`;
      });

      html += `</tr></thead><tbody>`;

      data.forEach((item) => {
        html += `<tr>`;
        columns.forEach((col: any) => {
          let value = getValue(item, col.accessor);
          if (typeof value === 'string' && value.length > 35) {
            value = value.substring(0, 35) + '...';
          }
          html += `<td style="border: 1px solid #000; padding: 6px 8px; color: #000;">${value}</td>`;
        });
        html += `</tr>`;
      });

      html += `</tbody></table></div>`;
      return html;
    };

    // Build print content - ONLY CURRENT TAB
    let html = '';

    // Add CSS to hide everything except tables
    html += `
    <style>
      @media print {
        body * {
          visibility: hidden !important;
        }
        #print-tables, #print-tables * {
          visibility: visible !important;
        }
        #print-tables {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          background: white !important;
          padding: 20px !important;
          z-index: 99999 !important;
        }
        /* Hide any stray elements */
        .no-print, button, nav, header, footer {
          display: none !important;
        }
       th {
        background-color: #f0f0f0 !important;
        color: #1a4d2e !important;
        }
      }
    </style>
  `;

    // Add title with super broker name if available
    if (profileData?.fullname) {
      html += `
      <div style="text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #ddd;">
        <div style="font-size: 20px; font-weight: bold; color: #1a1a1a;">Super Broker: ${profileData.fullname}</div>
        <div style="font-size: 12px; color: #666; margin-top: 4px;">BK ID: ${profileData.BKId || 'N/A'}</div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">Printed: ${new Date().toLocaleString()}</div>
      </div>
    `;
    }

    // Generate the table for the active tab only
    html += generateTable(tableTitle, tableData, tableColumns, dateRange);

    printContainer.innerHTML = html;

    // Remove any existing print container
    const existingContainer = document.getElementById('print-tables');
    if (existingContainer) {
      existingContainer.remove();
    }

    document.body.appendChild(printContainer);

    // Print
    window.print();

    // Remove after printing
    setTimeout(() => {
      const el = document.getElementById('print-tables');
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 1000);
  };
  // ========== END PRINT FUNCTION ==========

  return (
    <div className="max-w-9xl mx-auto p-4 md:p-6 bg-[#f8fafc]">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={handleBack}
          className="text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-lg border border-stroke bg-white px-4 py-2 text-sm font-medium transition-all hover:text-orange-500"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Super Brokers
        </button>
      </div>

      {/* Profile Details Section */}
      <div className="mb-6 rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center justify-between rounded-t-lg border-b border-stroke bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 md:px-6 md:py-4">
          <h2 className="text-lg font-semibold text-white md:text-xl">
            Super Broker Profile
          </h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="hover:bg-gray-100 flex items-center gap-2 rounded bg-white px-3 py-1.5 text-sm font-medium text-orange-500 transition-colors md:px-4 md:py-2"
            >
              <FiEdit2 className="h-3 w-3 md:h-4 md:w-4" /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="hover:bg-gray-100 flex items-center gap-2 rounded bg-white px-3 py-1.5 text-sm font-medium text-red-500 transition-colors md:px-4 md:py-2"
              >
                <FiX className="h-3 w-3 md:h-4 md:w-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="hover:bg-gray-100 flex items-center gap-2 rounded bg-white px-3 py-1.5 text-sm font-medium text-orange-500 transition-colors disabled:opacity-50 md:px-4 md:py-2"
              >
                <FiSave className="h-3 w-3 md:h-4 md:w-4" />{' '}
                {isUpdating ? 'Saving...' : 'Save'}
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
                  {profileData?.fullname || 'N/A'}
                </p>
              )}
            </div>

            {/* BK ID - Read Only */}
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                BK ID
              </label>
              <p className="text-sm text-black dark:text-white md:text-base">
                {profileData?.BKId || 'N/A'}
              </p>
            </div>

            {/* Phone Number - Editable with Validation */}
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Phone Number
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={editData.phoneNumber}
                    onChange={handleInputChange}
                    maxLength={10}
                    className={`w-full rounded border-[1.5px] px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2 ${
                      editErrors.phoneNumber
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-stroke'
                    }`}
                    placeholder="Enter 10-digit phone number"
                  />
                  {editErrors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-500">
                      {editErrors.phoneNumber}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-black dark:text-white md:text-base">
                  {profileData?.phoneNumber || 'N/A'}
                </p>
              )}
            </div>

            {/* Aadhar Number - Editable with Validation */}
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Aadhar Number
              </label>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    name="aadharCardNumber"
                    value={editData.aadharCardNumber}
                    onChange={handleInputChange}
                    maxLength={12}
                    className={`w-full rounded border-[1.5px] px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2 ${
                      editErrors.aadharCardNumber
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-stroke'
                    }`}
                    placeholder="Enter 12-digit Aadhar number"
                  />
                  {editErrors.aadharCardNumber && (
                    <p className="mt-1 text-xs text-red-500">
                      {editErrors.aadharCardNumber}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-black dark:text-white md:text-base">
                  {profileData?.aadharCardNumber || 'N/A'}
                </p>
              )}
            </div>

            {/* Commission (%) */}
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Commission (%)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  name="commission"
                  value={editData.commission}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                />
              ) : (
                <p className="text-sm font-semibold text-orange-600 dark:text-white md:text-base">
                  {profileData?.upcomingBrokeragePercent || '0'}%
                </p>
              )}
            </div>

            {/* Area */}
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Area
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="area"
                  value={editData.area}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                />
              ) : (
                <p className="text-sm text-black dark:text-white md:text-base">
                  {profileData?.area || 'N/A'}
                </p>
              )}
            </div>

            {/* Total Brokers - Read Only */}
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Total Brokers
              </label>
              <p className="text-sm text-black dark:text-white md:text-base">
                {profileData?.brokers?.length || 0}
              </p>
            </div>

            {/* Password - Only in Edit Mode */}
            {isEditing && (
              <div>
                <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter new password"
                    value={editData.password}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 pr-10 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <h4 className="text-xl font-bold text-blue-500 md:text-2xl">
            {profileData?.brokers?.length || 0}
          </h4>
          <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
            Total Brokers
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <h4 className="text-xl font-bold text-green-500 md:text-2xl">
            ₹{formatIndianNumber(profileData?.totalCommission)}
          </h4>
          <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
            Total Commission
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <h4 className="text-xl font-bold text-orange-500 md:text-2xl">
            ₹
            {formatIndianNumber(
              paymentDataFromApi?.summary?.totalPaidCommission,
            )}
          </h4>
          <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
            Total Paid Commission
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <h4 className="text-xl font-bold text-orange-500 md:text-2xl">
            ₹
            {formatIndianNumber(paymentDataFromApi?.summary?.pendingCommission)}
          </h4>
          <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
            Pending Commission
          </span>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center justify-between border-b border-stroke dark:border-strokedark">
          <div className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${
                activeTab === 'ledger'
                  ? 'border-b-2 border-orange-500 text-orange-500'
                  : 'text-bodydark2'
              }`}
            >
              Ledger
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${
                activeTab === 'payment'
                  ? 'border-b-2 border-orange-500 text-orange-500'
                  : 'text-bodydark2'
              }`}
            >
              Payment History
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${
                activeTab === 'paid'
                  ? 'border-b-2 border-orange-500 text-orange-500'
                  : 'text-bodydark2'
              }`}
            >
              Paid History
            </button>
            <button
              onClick={() => setActiveTab('commission')}
              className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${
                activeTab === 'commission'
                  ? 'border-b-2 border-orange-500 text-orange-500'
                  : 'text-bodydark2'
              }`}
            >
              Commission History
            </button>
            <button
              onClick={() => setActiveTab('broker')}
              className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${
                activeTab === 'broker'
                  ? 'border-b-2 border-orange-500 text-orange-500'
                  : 'text-bodydark2'
              }`}
            >
              Brokers ({brokersList?.length || 0})
            </button>
          </div>
          <div className="flex items-center gap-2 px-4 py-2">
            <button
              onClick={handlePrintTables}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-600 md:px-4 md:py-2"
            >
              <FiPrinter className="h-4 w-4" />
              Print
            </button>
            <button
              onClick={handleOpenCommissionModal}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-600 md:px-4 md:py-2"
            >
              <FiPlus className="h-4 w-4" />
              Add Commission
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {activeTab === 'ledger' ? (
            <div className="overflow-x-auto">
              <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h3 className="text-base font-semibold text-black dark:text-white md:text-lg">
                  Ledger Records
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-black dark:text-white md:text-sm">
                      From:
                    </label>
                    <input
                      type="date"
                      value={ledgerStartDate}
                      onChange={(e) => setLedgerStartDate(e.target.value)}
                      className="rounded border border-stroke bg-transparent px-2 py-1 text-xs outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-3 md:py-1 md:text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-black dark:text-white md:text-sm">
                      To:
                    </label>
                    <input
                      type="date"
                      value={ledgerEndDate}
                      onChange={(e) => setLedgerEndDate(e.target.value)}
                      className="rounded border border-stroke bg-transparent px-2 py-1 text-xs outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-3 md:py-1 md:text-sm"
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
                      <option value="OPEN">Open</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                  <button
                    onClick={() => refetch()}
                    className="flex items-center gap-1 rounded bg-orange-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                  >
                    <RefreshCcw size={16} /> Refresh
                  </button>
                </div>
              </div>
              {isLoadingLedger ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                </div>
              ) : (
                <GenericTable
                  data={filteredLedgerData}
                  columns={baseLedgerColumns}
                  paginationOff={true}
                  emptyMessage="No ledger records found"
                />
              )}
            </div>
          ) : activeTab === 'payment' ? (
            <div className="overflow-x-auto">
              <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h3 className="text-base font-semibold text-black dark:text-white md:text-lg">
                  Payment History
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-black dark:text-white md:text-sm">
                      From:
                    </label>
                    <input
                      type="date"
                      value={paymentStartDate}
                      onChange={(e) => setPaymentStartDate(e.target.value)}
                      className="rounded border border-stroke bg-transparent px-2 py-1 text-xs outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-3 md:py-1 md:text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-black dark:text-white md:text-sm">
                      To:
                    </label>
                    <input
                      type="date"
                      value={paymentEndDate}
                      onChange={(e) => setPaymentEndDate(e.target.value)}
                      className="rounded border border-stroke bg-transparent px-2 py-1 text-xs outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-3 md:py-1 md:text-sm"
                    />
                  </div>
                  {(paymentStartDate || paymentEndDate) && (
                    <button
                      onClick={() => {
                        const { startDate, endDate } = getCurrentWeekRange();
                        setPaymentStartDate(startDate);
                        setPaymentEndDate(endDate);
                      }}
                      className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded px-2 py-1 text-xs font-medium transition-colors dark:bg-meta-4 dark:text-white dark:hover:bg-meta-3 md:px-3 md:py-1.5 md:text-sm"
                    >
                      This Week
                    </button>
                  )}
                </div>
              </div>

              {isLoadingPayment ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                </div>
              ) : (
                <GenericTable
                  data={filteredPaymentData}
                  columns={paymentColumns}
                  paginationOff={true}
                />
              )}
            </div>
          ) : activeTab === 'paid' ? (
            <div className="overflow-x-auto">
              <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h3 className="text-base font-semibold text-black dark:text-white md:text-lg">
                  Paid History
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-black dark:text-white md:text-sm">
                      From:
                    </label>
                    <input
                      type="date"
                      value={paidStartDate}
                      onChange={(e) => setPaidStartDate(e.target.value)}
                      className="rounded border border-stroke bg-transparent px-2 py-1 text-xs outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-3 md:py-1 md:text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-black dark:text-white md:text-sm">
                      To:
                    </label>
                    <input
                      type="date"
                      value={paidEndDate}
                      onChange={(e) => setPaidEndDate(e.target.value)}
                      className="rounded border border-stroke bg-transparent px-2 py-1 text-xs outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-3 md:py-1 md:text-sm"
                    />
                  </div>
                  {(paidStartDate || paidEndDate) && (
                    <button
                      onClick={() => {
                        const { startDate, endDate } = getCurrentWeekRange();
                        setPaidStartDate(startDate);
                        setPaidEndDate(endDate);
                      }}
                      className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded px-2 py-1 text-xs font-medium transition-colors dark:bg-meta-4 dark:text-white dark:hover:bg-meta-3 md:px-3 md:py-1.5 md:text-sm"
                    >
                      This Week
                    </button>
                  )}
                </div>
              </div>

              {isLoadingPayment ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                </div>
              ) : (
                <GenericTable
                  data={filteredPaidHistory}
                  columns={paidColumns}
                  paginationOff={true}
                />
              )}
            </div>
          ) : activeTab === 'commission' ? (
            <div className="overflow-x-auto">
              <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h3 className="text-base font-semibold text-black dark:text-white md:text-lg">
                  Commission History
                </h3>
              </div>
              {commissionHistoryList.length > 0 ? (
                <GenericTable
                  data={commissionHistoryList}
                  columns={commissionColumns}
                  paginationOff={false}
                  itemsPerPage={10}
                />
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No commission history found</p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h3 className="text-base font-semibold text-black dark:text-white md:text-lg">
                  Brokers List
                </h3>
              </div>
              <GenericTable
                data={brokersList}
                columns={brokerColumns}
                searchAble={true}
                searchFields={['user.fullname', 'BKId']}
                itemsPerPage={10}
              />
            </div>
          )}
        </div>
      </div>

      {/* Commission Modal */}
      {isCommissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-5 shadow-xl md:p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              Commission Transaction
            </h3>

            <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setCommissionType('credit')}
                className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                  commissionType === 'credit'
                    ? 'bg-white text-orange-500 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Credit (+)
              </button>
              <button
                type="button"
                onClick={() => setCommissionType('debit')}
                className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                  commissionType === 'debit'
                    ? 'bg-white text-orange-500 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Debit (-)
              </button>
            </div>

            <form onSubmit={handleCommissionSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  placeholder="Enter amount"
                  value={commissionAmount}
                  onChange={(e) => setCommissionAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                  Security PIN
                </label>
                <div className="relative">
                  <input
                    type={showCommissionPin ? 'text' : 'password'}
                    required
                    placeholder="Enter Security PIN"
                    value={commissionPin}
                    onChange={(e) => setCommissionPin(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCommissionPin(!showCommissionPin)}
                    className="text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showCommissionPin ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCommissionModalOpen(false);
                    setCommissionAmount('');
                    setCommissionPin('');
                    setShowCommissionPin(false);
                  }}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCommissionPending}
                  className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-medium text-white shadow-md shadow-orange-200 transition-colors hover:bg-orange-600 disabled:opacity-50"
                >
                  {isCommissionPending ? 'Processing...' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperBrokerProfile;