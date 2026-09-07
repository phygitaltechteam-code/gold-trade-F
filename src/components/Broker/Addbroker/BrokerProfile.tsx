import React, { useState, useEffect, useMemo } from 'react';
import { FiEdit2, FiSave, FiX, FiArrowLeft } from 'react-icons/fi';
import GenericTable from '@/components/Forms/Table/GenericTable';
import { Route } from '@/routes/_app/broker/brokerprofile.$id';
import {
  useGetAllBrockerById,
  useGetBrokerCardDataById,
  useGetBrokersDataApi,
  useUpdateBrokerProfile,
  useGetBrokerLedgerById,
} from './brokerapi';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { formatIndianCurrency, formatIndianNumber } from '@/utils/formatIndianNumber';
import { useAuthContext } from '@/context/AuthContext';
import { RefreshCcw } from 'lucide-react';

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

const BrokerProfile = () => {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('ledger');
  const [isLedgerExpanded, setIsLedgerExpanded] = useState(false);
  const [paymentStartDate, setPaymentStartDate] = useState('');
  const [paymentEndDate, setPaymentEndDate] = useState('');
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { user, token } = useAuthContext();
  const [livePnlMap, setLivePnlMap] = useState<Map<string, any>>(new Map());

  const { data: profileData, refetch } = useGetAllBrockerById(id);
  const { data: cardData, refetch: cardRefetch } = useGetBrokerCardDataById(id);
  const { data: brokerData } = useGetBrokersDataApi();
  const { mutate: updateBrokerProfile, isPending: isUpdating } =
    useUpdateBrokerProfile();

  // Get broker ledger from API
  const {
    data: ledgerDataFromApi,
    isLoading: isLoadingLedger,
    refetch: refetchLedger,
  } = useGetBrokerLedgerById(id);

  // WebSocket connection for Broker Profile Ledger
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

    console.log('[SuperBroker BrokerProfile WS] Connecting to:', wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[SuperBroker BrokerProfile WS] Connection OPEN for room: transaction_ledger');
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
          console.log('[SuperBroker BrokerProfile WS] Auto-refresh triggered via TRANSACTION_LEDGER_TRADE_CHANGED');
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
              const orderId = t.orderId || t.tradeId || t.transactionId;
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
        console.error('[SuperBroker BrokerProfile WS] Error processing message:', err);
      }
    };

    return () => {
      console.log('[SuperBroker BrokerProfile WS] Cleaning up socket connection');
      ws.close();
    };
  }, [user, token, refetchLedger]);

  const [editData, setEditData] = useState({
    fullname: '',
    phoneNumber: '',
    email: '',
    aadharCardNumber: '',
    brokeragePercent: '',
    area: '',
  });

  // Update editData when profileData loads
  useEffect(() => {
    if (profileData) {
      setEditData({
        fullname: profileData?.fullname || '',
        phoneNumber: profileData?.phoneNumber || '',
        email: profileData?.email || '',
        aadharCardNumber: profileData?.aadharCardNumber || '',
        brokeragePercent: profileData?.brokeragePercent || '',
        area: profileData?.area || '',
      });
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
  }, []);

  console.log('Broker Data:', brokerData);
  console.log('Profile Data:', profileData);

  const rawLedgerList = useMemo(() => {
    if (!ledgerDataFromApi) return [];
    if (Array.isArray(ledgerDataFromApi)) return ledgerDataFromApi;
    if (Array.isArray((ledgerDataFromApi as any).data?.data)) return (ledgerDataFromApi as any).data.data;
    if (Array.isArray((ledgerDataFromApi as any).data)) return (ledgerDataFromApi as any).data;
    if (Array.isArray((ledgerDataFromApi as any).transactions)) return (ledgerDataFromApi as any).transactions;
    if (Array.isArray((ledgerDataFromApi as any).data?.transactions)) return (ledgerDataFromApi as any).data.transactions;
    if (Array.isArray((ledgerDataFromApi as any).ledger)) return (ledgerDataFromApi as any).ledger;
    return [];
  }, [ledgerDataFromApi]);

  // Transform API ledger data to match table format
  const ledgerData = useMemo(() => {
    if (!rawLedgerList || !Array.isArray(rawLedgerList)) {
      return [];
    }

    const formatCommission = (value: any) => {
      if (value === null || value === undefined || isNaN(Number(value)))
        return '-';
      return `₹${Number(value).toFixed(2)}`;
    };

    return rawLedgerList.map((item: any, index: number) => {
      const matchKey = item.orderId || item.tradeId || item.transactionId || item._id || item.id;
      const isOpen = item.status?.toString().toUpperCase() === 'OPEN';
      const liveData = matchKey && isOpen && livePnlMap.has(String(matchKey)) ? livePnlMap.get(String(matchKey)) : null;
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
        sr: index + 1,
        rawDateTime: item.dateTime,
        dateTime: formatDateTime(item.dateTime),
        customerName: item.customerName || item.customername || '-',
        script: item.script || '-',
        qty:
          item.qty && item.lotSize
            ? `${item.qty}/${item.lotSize}`
            : item.qty || '-',
        buyPrice: effectiveBuyPrice,
        sellPrice: effectiveSellPrice,
        status: (isOpen && liveData?.status) || item.status || 'Pending',
        rawPnl: effectivePnl,
        pnl: effectivePnl,
        buyTime: item.buyTime ? formatDateTime(item.buyTime) : '-',
        sellTime: item.sellTime ? formatDateTime(item.sellTime) : '-',
        brokerCommission: formatCommission(
          item.brokerCommission || item.brokercommission,
        ),
      };
    });
  }, [rawLedgerList, livePnlMap]);

  // Sample data for payment history (replace with actual API data)
  const paymentData = useMemo(() => [], []);

  // Get customers from profileData and add SR number
  const customersList = useMemo(() => {
    const customers = profileData?.customers || [];
    return customers.map((customer: any, index: number) => ({
      ...customer,
      srNo: index + 1,
    }));
  }, [profileData?.customers]);

  // Add SR numbers to ledger data
  const ledgerDataWithSr = ledgerData;

  // Add SR numbers to payment data
  const paymentDataWithSr = useMemo(() => {
    return paymentData.map((item: any, index: number) => ({
      ...item,
      sr: index + 1,
    }));
  }, [paymentData]);

  const handleBack = () => {
    navigate({ to: '/broker/displaybroker' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleSave = () => {
  //   if (!id) {
  //     toast.error('Broker ID is missing');
  //     return;
  //   }

  //   const updatePayload = {
  //     fullname: editData.fullname,
  //     phoneNumber: editData.phoneNumber,
  //     email: editData.email,
  //     aadharCardNumber: editData.aadharCardNumber,
  //     brokeragePercent: editData.brokeragePercent,
  //     area: editData.area,
  //   };

  //   updateBrokerProfile({
  //     id: id,
  //     data: updatePayload,
  //   });
  // };

  const handleSave = () => {
    if (!id) {
      toast.error('Broker ID is missing');
      return;
    }

    const updatePayload = {
      fullname: editData.fullname,
      phoneNumber: editData.phoneNumber,
      email: editData.email,
      aadharCardNumber: editData.aadharCardNumber,
      brokeragePercent: editData.brokeragePercent,
      area: editData.area,
    };

    updateBrokerProfile(
      { id: id, data: updatePayload },
      {
        onSuccess: () => {
          // toast.success('Profile updated successfully!');
          setIsEditing(false);
          refetch(); // Refresh the profile data
        },
        onError: (error) => {
          console.error('Update failed:', error);
        },
      }
    );
  };

  const handleCancel = () => {
    if (profileData) {
      setEditData({
        fullname: profileData?.fullname || '',
        phoneNumber: profileData?.phoneNumber || '',
        email: profileData?.email || '',
        aadharCardNumber: profileData?.aadharCardNumber || '',
        brokeragePercent: profileData?.brokeragePercent || '',
        area: profileData?.area || '',
      });
    }
    setIsEditing(false);
  };

  // Base Ledger Columns
  const baseLedgerColumns = [
    { header: 'Date & Time', accessor: 'dateTime' },
    { header: 'Trader Name', accessor: 'customerName' },
    { header: 'Script', accessor: 'script' },
    { header: 'Qty/Lot', accessor: 'qty' },
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
      header: 'Broker Commission',
      accessor: 'brokerCommission',
      render: (item: any) => <span className="font-medium">{item.brokerCommission !== undefined && item.brokerCommission !== null && item.brokerCommission !== '-' ? (typeof item.brokerCommission === 'string' && item.brokerCommission.startsWith('₹') ? item.brokerCommission : formatIndianCurrency(item.brokerCommission)) : '-'}</span>
    },
  ];


  // Column definitions for the Payment History table
  const paymentColumns = [
    { header: 'Sr', accessor: 'sr' },
    { header: 'Date', accessor: 'date' },
    { header: 'Commission Generated', accessor: 'commissionGenerated' },
    { header: 'Paid Amount', accessor: 'paidAmount' },
    { header: 'Paid Date', accessor: 'paidDate' },
    { header: 'Status', accessor: 'status' },
  ];

  // Customer Table Columns
  const customerColumns = [
    {
      header: 'Customer Name',
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
    // {
    //   header: 'CRN',
    //   accessor: 'CRN',
    //   render: (item: any) => (
    //     <span className="font-mono text-gray-600 text-sm font-medium">
    //       {item?.CRN || '-'}
    //     </span>
    //   ),
    // },
    // {
    //   header: 'Commission',
    //   accessor: 'brokeragePercent',
    //   render: (item: any) => (
    //     <span className="rounded border border-orange-100 bg-orange-50 px-2 py-1 text-xs font-bold text-orange-600">
    //       {item?.brokeragePercent ? `${item.brokeragePercent}%` : '-'}
    //     </span>
    //   ),
    // },
    {
      header: 'Address',
      accessor: 'address',
      render: (item: any) => (
        <span className="text-gray-700 text-sm">
          {item?.address || item?.area || '-'}
        </span>
      ),
    },
    // {
    //   header: 'Total Business',
    //   accessor: 'totalBusiness',
    //   render: () => <span className="text-gray-700">-</span>,
    // },
    // {
    //   header: 'Total Commission',
    //   accessor: 'totalCommission',
    //   render: () => <span className="text-gray-700">-</span>,
    // },
    // {
    //   header: 'Pending Commission',
    //   accessor: 'pendingCommission',
    //   render: () => <span className="text-gray-700">-</span>,
    // },
  ];

  // Filter ledger data by date range
  const filteredLedgerData = useMemo(() => {
    let result = ledgerDataWithSr;

    if (statusFilter) {
      result = result.filter((item: any) => {
        const itemStatus = item.status?.toUpperCase() || '';
        const filterVal = statusFilter.toUpperCase();
        if (filterVal === 'CLOSE' || filterVal === 'CLOSED') {
          return itemStatus === 'CLOSE' || itemStatus === 'CLOSED';
        }
        return itemStatus === filterVal;
      });
    }

    if (ledgerStartDate && ledgerEndDate) {
      const startDate = new Date(ledgerStartDate);
      const endDate = new Date(ledgerEndDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      result = result.filter((item: any) => {
        const rawDate = item.rawDateTime || item.dateTime;
        if (!rawDate) return false;
        const itemDate = new Date(rawDate);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    return result;
  }, [ledgerDataWithSr, ledgerStartDate, ledgerEndDate, statusFilter]);

  // Filter payment data by date range
  const filteredPaymentData = useMemo(() => {
    if (!paymentStartDate || !paymentEndDate) return paymentDataWithSr;
    return paymentDataWithSr.filter((item: any) => {
      const itemDate = new Date(item.date);
      const startDate = new Date(paymentStartDate);
      const endDate = new Date(paymentEndDate);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [paymentDataWithSr, paymentStartDate, paymentEndDate]);

  return (
    <div className="max-w-9xl mx-auto p-4 md:p-6">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={handleBack}
          className="text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-lg border border-stroke bg-white px-4 py-2 text-sm font-medium transition-all hover:text-orange-500"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Brokers
        </button>
      </div>

      {/* Profile Details Section */}
      <div className="mb-6 rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center justify-between rounded-t-lg border-b border-stroke bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 md:px-6 md:py-4">
          <h2 className="text-lg font-semibold text-white md:text-xl">
            Broker Profile
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
                disabled={isUpdating}
                className="flex items-center gap-2 rounded bg-red-100 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-200 disabled:opacity-50 md:px-4 md:py-2"
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
            {/* Full Name - Editable */}
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

            {/* Phone Number - Editable */}
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phoneNumber"
                  value={editData.phoneNumber}
                  onChange={handleInputChange}
                  maxLength={10}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                />
              ) : (
                <p className="text-sm text-black dark:text-white md:text-base">
                  {profileData?.phoneNumber || 'N/A'}
                </p>
              )}
            </div>

            {/* Email - Editable
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                />
              ) : (
                <p className="text-sm text-black dark:text-white md:text-base">
                  {profileData?.email || 'N/A'}
                </p>
              )}
            </div> */}

            {/* Aadhar Number - Editable */}
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
                  maxLength={12}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                />
              ) : (
                <p className="text-sm text-black dark:text-white md:text-base">
                  {profileData?.aadharCardNumber || 'N/A'}
                </p>
              )}
            </div>

            {/* Commission % - Editable */}
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Commission %
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  name="brokeragePercent"
                  value={editData.brokeragePercent}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                />
              ) : (
                <p className="text-sm text-black dark:text-white md:text-base">
                  {profileData?.brokeragePercent || '0'}%
                </p>
              )}
            </div>

            {/* Area - Editable */}
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

            {/* Super Broker - Read Only */}
            {/* <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Super Broker
              </label>
              <p className="text-sm text-black dark:text-white md:text-base">
                {profileData?.superBroker?.user?.fullname ||
                  profileData?.superBroker?.fullname ||
                  'Unassigned'}
              </p>
            </div> */}

            {/* Total Customers - Read Only */}
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Total Customers
              </label>
              <p className="text-sm text-black dark:text-white md:text-base">
                {profileData?.customers?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <h4 className="text-xl font-bold text-blue-500 md:text-2xl">
            {profileData?.customers?.length || 0}
          </h4>
          <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
            Total Customers
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <h4 className="text-xl font-bold text-green-500 md:text-2xl">
            {formatIndianCurrency(cardData?.summary?.totalCommission) || '0'}
          </h4>
          <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
            Total Commission
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <h4 className="text-xl font-bold text-orange-500 md:text-2xl">
            {formatIndianCurrency(cardData?.summary?.paidCommission) || '0'}
          </h4>
          <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
            Paid Commission
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <h4 className="text-xl font-bold text-orange-500 md:text-2xl">
            {formatIndianCurrency(cardData?.summary?.pendingCommission) || '0'}
          </h4>
          <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
            Pending Commission
          </span>
        </div>

      </div>

      {/* Tabs Section */}
      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap border-b border-stroke dark:border-strokedark">
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
            onClick={() => setActiveTab('payment')}
            className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${activeTab === 'payment'
              ? 'border-b-2 border-orange-500 text-orange-500'
              : 'text-bodydark2'
              }`}
          >
            Payment History
          </button>
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${activeTab === 'customer'
              ? 'border-b-2 border-orange-500 text-orange-500'
              : 'text-bodydark2'
              }`}
          >
            Clients ({profileData?.customers?.length || 0})
          </button>
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
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded border border-stroke bg-transparent px-2 py-1 text-xs outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-3 md:py-1 md:text-sm"
                    >
                      <option value="">All Statuses</option>
                      <option value="OPEN">Open</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
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
                  {(ledgerStartDate || ledgerEndDate) && (
                    <button
                      onClick={() => {
                        const { startDate, endDate } = getCurrentWeekRange();
                        setLedgerStartDate(startDate);
                        setLedgerEndDate(endDate);
                      }}
                      className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded px-2 py-1 text-xs font-medium transition-colors dark:bg-meta-4 dark:text-white dark:hover:bg-meta-3 md:px-3 md:py-1.5 md:text-sm"
                    >
                      This Week
                    </button>
                  )}
                  <button
                    onClick={() => refetchLedger()}
                    className="rounded bg-orange-500 flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-orange-600 md:px-3 md:py-1.5 md:text-sm"
                  >
                    <RefreshCcw size={14} /> Refresh
                  </button>
                  {/* <button
                    onClick={() => setIsLedgerExpanded(!isLedgerExpanded)}
                    className="rounded bg-orange-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600 md:px-4 md:py-2 md:text-sm"
                  >
                    {isLedgerExpanded ? 'View Less' : 'View More'}
                  </button> */}
                </div>
              </div>
              <GenericTable
                data={filteredLedgerData}
                columns={baseLedgerColumns}
                paginationOff={true}
              />
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
              <GenericTable
                data={filteredPaymentData}
                columns={paymentColumns}
                paginationOff={true}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h3 className="text-base font-semibold text-black dark:text-white md:text-lg">
                  Customers List
                </h3>
              </div>
              <GenericTable
                data={customersList}
                columns={customerColumns}
                searchAble={true}
                searchFields={['user.fullname', 'CRN']}
                itemsPerPage={10}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrokerProfile;
