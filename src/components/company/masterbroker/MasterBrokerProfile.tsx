import React, { useState, useMemo, useEffect } from 'react';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';
import {
  useGetAllMasterBrockerById,
  useUpdateMasterBrokerProfile,
  useAddCommission,
  useGetMasterbrokerLedgerById,
  useGetMasterbrokertraderdById,
} from '@/lib/react-query/masterbroker';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';

// Subcomponents
import { MasterBrokerProfileInfo } from './MasterBrokerProfileInfo';
import { MasterBrokerStats } from './MasterBrokerStats';
import { LedgerTab } from './LedgerTab';
import { PaymentTab } from './PaymentTab';
import { CommissionTab } from './CommissionTab';
import { BrokersTab } from './BrokersTab';
import { CommissionModal } from './CommissionModal';
import GenericTable from '@/components/Forms/Table/GenericTable';
import { formatIndianCurrency, formatIndianNumber } from '@/utils/formatIndianNumber';
import { RefreshCcw } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';

interface MasterBrokerProfileProps {
  id: string;
}

const formatDateTime = (dateTime: string) => {
  if (!dateTime || dateTime === '-') return '-';
  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return dateTime;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day}/${month}/${year}, ${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  } catch (error) {
    return dateTime;
  }
};

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

const MasterBrokerProfile = ({ id }: MasterBrokerProfileProps) => {
  const navigate = useNavigate();
  const { user, token } = useAuthContext();
  const [livePnlMap, setLivePnlMap] = useState<Map<string, number>>(new Map());
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('ledger');
  const [isLedgerExpanded, setIsLedgerExpanded] = useState(false);
  const [paymentStartDate, setPaymentStartDate] = useState('');
  const [paymentEndDate, setPaymentEndDate] = useState('');
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');
  const [commissionStartDate, setCommissionStartDate] = useState('');
  const [commissionEndDate, setCommissionEndDate] = useState('');

  // WebSocket connection for MasterBroker Profile Ledger
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

    console.log('[MasterBrokerProfile WS] Connecting to:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[MasterBrokerProfile WS] Connection OPEN for room: transaction_ledger');
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
          console.log('[MasterBrokerProfile WS] Auto-refresh triggered via TRANSACTION_LEDGER_TRADE_CHANGED');
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
        console.error('[MasterBrokerProfile WS] Message error:', err);
      }
    };

    return () => {
      console.log('[MasterBrokerProfile WS] Disconnecting WebSocket');
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'LEAVE_TRANSACTION_LEDGER' }));
        }
        ws.close();
      } catch (_) {}
    };
  }, [user, token]);

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  // Commission Modal State
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [commissionAmount, setCommissionAmount] = useState('');
  const [commissionPin, setCommissionPin] = useState('');
  const [showCommissionPin, setShowCommissionPin] = useState(false);
  const [commissionType, setCommissionType] = useState<'credit' | 'debit'>('credit');
  const [statusFilter, setStatusFilter] = useState('')

  const { data: profileData, refetch } = useGetAllMasterBrockerById(id);
  const { data: ledgerData = [], refetch: refetchLedger } = useGetMasterbrokerLedgerById(id);
  const { data: tradersData = [] } = useGetMasterbrokertraderdById(id);
  // console.log('tradersData', tradersData);
  console.log("profileData", profileData)
  const { mutate: updateMasterBrokerProfile, isPending: isUpdating } =
    useUpdateMasterBrokerProfile();
  const { mutate: addCommission, isPending: isCommissionPending } =
    useAddCommission();

  const [editData, setEditData] = useState({
    fullname: '',
    phoneNumber: '',
    commission: '',
    area: '',
    aadharCardNumber: '',
    customerLimit: '',
    password: '',
  });

  // Validation errors state for edit form
  const [editErrors, setEditErrors] = useState({
    phoneNumber: '',
    aadharCardNumber: '',
  });

  // Update editData when profileData loads
  useEffect(() => {
    if (profileData) {
      setEditData({
        fullname: profileData?.fullname || '',
        phoneNumber: profileData?.phoneNumber || '',
        commission: profileData?.commission?.toString() || '',
        area: profileData?.area || '',
        aadharCardNumber: profileData?.aadharCardNumber || '',
        customerLimit: profileData?.customerLimit?.toString() || '',
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

  // Get brokers from profileData and add SR number
  const brokersList = useMemo(() => {
    const brokers = profileData?.brokers || [];
    return brokers.map((broker: any, index: number) => ({
      ...broker,
      srNo: index + 1,
    }));
  }, [profileData?.brokers]);

  // Get customers from profileData and add SR number
  const customersList = useMemo(() => {
    const customers = profileData?.customers || [];
    return customers.map((customer: any, index: number) => ({
      ...customer,
      srNo: index + 1,
    }));
  }, [profileData?.customers]);

  // Commission History Data from API
  const commissionHistoryList = useMemo(() => {
    const commissions = profileData?.commissionHistories || [];
    return commissions.map((item: any, index: number) => ({
      ...item,
      srNo: index + 1,
      amountValue: parseFloat(item.amount),
    }));
  }, [profileData?.commissionHistories]);

  // Calculate total commission from history
  const totalCommissionAmount = useMemo(() => {
    return commissionHistoryList.reduce(
      (sum, item) => sum + item.amountValue,
      0,
    );
  }, [commissionHistoryList]);

  // Filter commission history by date range
  const filteredCommissionHistory = useMemo(() => {
    if (!commissionStartDate || !commissionEndDate)
      return commissionHistoryList;
    return commissionHistoryList.filter((item: any) => {
      const itemDate = new Date(item.createdAt);
      const startDate = new Date(commissionStartDate);
      const endDate = new Date(commissionEndDate);
      endDate.setHours(23, 59, 59, 999);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [commissionHistoryList, commissionStartDate, commissionEndDate]);

  // Mock data for ledger (replace with actual API data)
  const paymentData = useMemo(() => [], []);

  const rawLedgerList = useMemo(() => {
    if (!ledgerData) return [];
    if (Array.isArray(ledgerData)) return ledgerData;
    if (Array.isArray((ledgerData as any).data?.data)) return (ledgerData as any).data.data;
    if (Array.isArray((ledgerData as any).data)) return (ledgerData as any).data;
    if (Array.isArray((ledgerData as any).transactions)) return (ledgerData as any).transactions;
    if (Array.isArray((ledgerData as any).data?.transactions)) return (ledgerData as any).data.transactions;
    if (Array.isArray((ledgerData as any).ledger)) return (ledgerData as any).ledger;
    return [];
  }, [ledgerData]);

  const ledgerDataWithSr = useMemo(() => {
    return rawLedgerList.map((item: any, index: number) => {
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
        rawDateTime: item.dateTime,
        dateTime: item.dateTime ? formatDateTime(item.dateTime) : '-',
        buyPrice: effectiveBuyPrice ?? item.buyPrice,
        sellPrice: effectiveSellPrice ?? item.sellPrice,
        buyTime: item.buyTime ? formatDateTime(item.buyTime) : '-',
        sellTime: item.sellTime ? formatDateTime(item.sellTime) : '-',
        status: (isOpen && liveData?.status) || item.status,
        rawPnl: effectivePnl,
        pnl: effectivePnl !== undefined && effectivePnl !== null && effectivePnl !== '' ? effectivePnl : '-',
        sr: index + 1,
      };
    });
  }, [rawLedgerList, livePnlMap]);

  const paymentDataWithSr = useMemo(() => {
    return paymentData.map((item: any, index: number) => ({
      ...item,
      sr: index + 1,
    }));
  }, [paymentData]);

  // Customer Table Columns - Updated with exact columns
  const customerColumns = [
    {
      header: 'Trader Name',
      accessor: 'user.fullname',
      render: (item: any) => (
        <div className="font-semibold text-black">
          {item?.user?.fullname || '-'}
        </div>
      ),
    },
    // {
    //   header: 'Broker Name',
    //   accessor: 'brokerName',
    //   render: (item: any) => {
    //     const brokerName = item?.broker?.user?.fullname || item?.brokerName || '-';
    //     return (
    //       <span className="text-gray-700 text-sm">{brokerName}</span>
    //     );
    //   },
    // },
    // {
    //   header: 'Super Broker Name',
    //   accessor: 'superBrokerName',
    //   render: (item: any) => {
    //     const superBrokerName = item?.broker?.superBroker?.user?.fullname ||
    //       item?.superBrokerName ||
    //       item?.superBroker?.fullname ||
    //       '-';
    //     return (
    //       <span className="text-gray-700 text-sm">{superBrokerName}</span>
    //     );
    //   },
    // },
    {
      header: 'Wallet Balance',
      accessor: 'walletBalance',
      render: (item: any) => {
        const amount = item?.walletBalance || item?.wallets?.amount || 0;
        return (
          <span className="font-medium text-gray-900">
            {formatIndianCurrency(amount)}
          </span>
        );
      },
    },
    {
      header: 'Asset Under Control',
      accessor: 'assetUnderControl',
      render: (item: any) => {
        const amount = item?.assetUnderControl || item?.wallets?.blockedAmount || 0;
        return (
          <span className="font-medium text-gray-900">
            {formatIndianCurrency(amount)}
          </span>
        );
      },
    },
    {
      header: 'Margin Amount',
      accessor: 'marginAmount',
      render: (item: any) => {
        const amount = item?.marginAmount || 0;
        return (
          <span className="font-medium text-gray-900">
            {formatIndianCurrency(amount)}
          </span>
        );
      },
    },
    {
      header: 'Total Active Trade',
      accessor: 'totalActiveTrade',
      render: (item: any) => {
        const count = item?.totalActiveTrade || item?._count?.trades || 0;
        return (
          <span className="text-gray-700 text-sm font-medium">
            {count}
          </span>
        );
      },
    },
    {
      header: 'Total Trade',
      accessor: 'totalTrade',
      render: (item: any) => {
        const amount = item?.totalTrade || 0;
        return (
          <span className="font-medium text-gray-900">
            {formatIndianCurrency(amount)}
          </span>
        );
      },
    },
     {
          header: 'Demo Account',
          accessor: 'isDemo',
          render: (row: any) => (
            <div className="pointer-events-none">
              <input
                type="checkbox"
                checked={!!row.isDemo}
                readOnly
                disabled
                className="h-4 w-4 accent-orange-500"
              />
            </div>
          ),
        },
  ];

  // Base Ledger Columns with proper formatting
  const baseLedgerColumns = [
    { header: 'Date & Time', accessor: 'dateTime' },
    { header: 'Trader Name', accessor: 'customerName' },
    { header: 'Script', accessor: 'script' },
    {
      header: 'Qty/Lot',
      accessor: (item) => formatQtyLot(item),
      render: (item: any) => <span>{formatQtyLot(item)}</span>
    },
    {
      header: 'Buy Price',
      accessor: 'buyPrice',
      render: (item: any) => <span className="font-medium">{item.buyPrice ? (typeof item.buyPrice === 'string' && item.buyPrice.startsWith('₹') ? item.buyPrice : formatIndianNumber(item.buyPrice)) : '-'}</span>
    },
    {
      header: 'Sell Price',
      accessor: 'sellPrice',
      render: (item: any) => <span className="font-medium">{item.sellPrice ? (typeof item.sellPrice === 'string' && item.sellPrice.startsWith('₹') ? item.sellPrice : formatIndianNumber(item.sellPrice)) : '-'}</span>
    },
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
      header: 'Master Broker Commission',
      accessor: 'masterBrokerCommission',
      render: (item: any) => <span className="font-medium">{item.masterBrokerCommission !== undefined && item.masterBrokerCommission !== null && item.masterBrokerCommission !== '-' ? formatIndianCurrency(item.masterBrokerCommission) : '-'}</span>
    },
  ];

  // Broker Columns with proper formatting
  const brokerColumns = [
    {
      header: 'Broker Name',
      accessor: 'user.fullname',
      render: (item: any) => (
        <div className="font-semibold text-black">
          {item?.user?.fullname || '-'}
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessor: 'user.phoneNumber',
      render: (item: any) => (
        <span className="text-gray-700">{item?.user?.phoneNumber || '-'}</span>
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
      accessor: 'commission',
      render: (item: any) => (
        <span className="rounded border border-orange-100 bg-orange-50 px-2 py-1 text-xs font-bold text-orange-600">
          {item?.commission ? `${item.commission}%` : '-'}
        </span>
      ),
    },
    {
      header: 'Total Brokers',
      accessor: 'totalBrokers',
      render: () => <span className="text-gray-700">-</span>,
    },
    {
      header: 'Total Commission',
      accessor: 'totalCommission',
      render: (item: any) => (
        <span className="font-medium text-gray-700">
          {formatIndianCurrency(item?.totalCommission)}
        </span>
      ),
    },
    {
      header: 'Pending Commission',
      accessor: 'pendingCommission',
      render: (item: any) => (
        <span className="font-medium text-orange-500">
          {formatIndianCurrency(item?.pendingCommission)}
        </span>
      ),
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
      toast.error('Master Broker ID is missing');
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
      customerLimit: editData.customerLimit,
    };

    if (editData.password) {
      updatePayload.password = editData.password;
    }

    updateMasterBrokerProfile(
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
        commission: profileData?.brokeragePercent?.toString() || '',
        area: profileData?.area || '',
        aadharCardNumber: profileData?.aadharCardNumber || '',
        customerLimit: profileData?.customerLimit?.toString() || '',
        password: '',
      });
    }
    setIsEditing(false);
    setShowPassword(false);
    setEditErrors({ phoneNumber: '', aadharCardNumber: '' });
  };

  const handleBack = () => {
    navigate({ to: '/companybroker/display-master-broker' });
  };

  const handleCommissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commissionAmount || parseFloat(commissionAmount) <= 0) {
      toast.error('Please enter a valid commission amount');
      return;
    }

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
          toast.success(
            `Commission ${commissionType === 'credit' ? 'added' : 'deducted'} successfully`,
          );
          refetch();
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
    if (!ledgerStartDate || !ledgerEndDate) return ledgerDataWithSr;


    return ledgerDataWithSr?.filter((item: any) => {
      const itemDate = new Date(item.rawDateTime || item.dateTime || item.createdAt);
      if (isNaN(itemDate.getTime())) return true;
      const startDate = new Date(ledgerStartDate);
      const endDate = new Date(ledgerEndDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [ledgerDataWithSr, ledgerStartDate, ledgerEndDate]);

  console.log("All fetched ledger data (unfiltered):", ledgerDataWithSr);
  console.log(`Filtered ledger data (from ${ledgerStartDate} to ${ledgerEndDate}):`, filteredLedgerData);

  const filteredPaymentData = useMemo(() => {
    if (!paymentStartDate || !paymentEndDate) return paymentDataWithSr;
    return paymentDataWithSr.filter((item: any) => {
      const itemDate = new Date(item.date || item.createdAt || item.paidDate);
      if (isNaN(itemDate.getTime())) return true;
      const startDate = new Date(paymentStartDate);
      const endDate = new Date(paymentEndDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [paymentDataWithSr, paymentStartDate, paymentEndDate]);

  const handleOpenCommissionModal = () => {
    if (profileData?.pendingCommission && profileData.pendingCommission > 0) {
      setCommissionAmount(profileData.pendingCommission.toString());
    }
    setIsCommissionModalOpen(true);
  };

  return (
    <div className="max-w-9xl mx-auto p-4 md:p-6 bg-[#f8fafc]">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={handleBack}
          className="text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-lg border border-stroke bg-white px-4 py-2 text-sm font-medium transition-all hover:text-orange-500"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Master Brokers
        </button>
      </div>

      {/* Profile Details Card Component */}
      <MasterBrokerProfileInfo
        profileData={profileData}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        editData={editData}
        handleInputChange={handleInputChange}
        handleSave={handleSave}
        handleCancel={handleCancel}
        isUpdating={isUpdating}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        editErrors={editErrors} // Pass validation errors
      />

      {/* Statistics Cards Component */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <h4 className="text-xl font-bold text-blue-500 md:text-2xl">
            {tradersData?.length || 0}
          </h4>
          <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
            Total Traders
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <h4 className="text-xl font-bold text-green-500 md:text-2xl">
            {formatIndianCurrency(profileData?.totalCommission)}
          </h4>
          <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
            Total Commission
          </span>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <h4 className="text-xl font-bold text-orange-500 md:text-2xl">

            {formatIndianCurrency(profileData?.summary?.totalPnL)}
          </h4>
          <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
            Total P&L
          </span>
        </div>
      </div>
      {/* <MasterBrokerStats profileData={profileData} /> */}


      {/* Tabs and Tables Section */}
      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center justify-between border-b border-stroke dark:border-strokedark">
          <div className="flex flex-wrap">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${activeTab === 'ledger'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-bodydark2'
                }`}
            >
              Ledger
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${activeTab === 'customers'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-bodydark2'
                }`}
            >
              Traders ({tradersData.length || 0})
            </button>

          </div>

        
        </div>



        <div className="p-4 md:p-6">
          {activeTab === 'ledger' && (
            <LedgerTab
              ledgerStartDate={ledgerStartDate}
              setLedgerStartDate={setLedgerStartDate}
              ledgerEndDate={ledgerEndDate}
              setLedgerEndDate={setLedgerEndDate}
              isLedgerExpanded={isLedgerExpanded}
              setIsLedgerExpanded={setIsLedgerExpanded}
              filteredLedgerData={filteredLedgerData}
              ledgerColumns={baseLedgerColumns}
              refetchLedger={refetchLedger}
            />
          )}

          {activeTab === 'customers' && (
            <div className="overflow-x-auto">
              <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h3 className="text-base font-semibold text-black dark:text-white md:text-lg">
                  Traders List.
                </h3>
                <span className="text-sm text-gray-500">
                  Total: {tradersData.length} customers
                </span>
              </div>
              <GenericTable
                data={tradersData}
                columns={customerColumns}
                // searchAble={
                searchFields={['user.fullname', 'CRN', 'user.phoneNumber']}
                itemsPerPage={10}
              />
            </div>
          )}

          {activeTab === 'broker' && (
            <BrokersTab
              brokersList={brokersList}
              brokerColumns={brokerColumns}
            />
          )}
        </div>
      </div>

      {/* Commission Transaction Modal Dialog */}
      <CommissionModal
        isOpen={isCommissionModalOpen}
        onClose={() => {
          setIsCommissionModalOpen(false);
          setCommissionAmount('');
          setCommissionPin('');
          setShowCommissionPin(false);
        }}
        profileData={profileData}
        totalCommissionAmount={totalCommissionAmount}
        commissionAmount={commissionAmount}
        setCommissionAmount={setCommissionAmount}
        commissionPin={commissionPin}
        setCommissionPin={setCommissionPin}
        showCommissionPin={showCommissionPin}
        setShowCommissionPin={setShowCommissionPin}
        commissionType={commissionType}
        setCommissionType={setCommissionType}
        handleCommissionSubmit={handleCommissionSubmit}
        isCommissionPending={isCommissionPending}
      />
    </div>
  );
};

export default MasterBrokerProfile;