import React, { useState, useEffect, useMemo } from 'react';
import {
  FiEdit2,
  FiSave,
  FiX,
  FiArrowLeft,
  FiPlus,
  FiPrinter,
} from 'react-icons/fi';
import GenericTable from '@/components/Forms/Table/GenericTable';
import { useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import {
  useAddAdminBrokerCommission,
  useGetAllAdminBrockerById,
  useUpdateAdminBrokerProfile,
  useGetBrokerLedger,
  useGetBrokerPaymentHistory,
  useGetAllBrokerTraders,
} from '@/lib/api/addbroker';
import { Route } from '@/routes/_app/companybroker/BrokerProfile.$id';
import { Client } from '../Clients/types';

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

  const { data: profileData, refetch } = useGetAllAdminBrockerById(id);
  const { data: traderdata, refetch: traderRefetch } = useGetAllBrokerTraders(id);
  const { mutate: updateBrokerProfile, isPending: isUpdating } =
    useUpdateAdminBrokerProfile();
  const { mutate: addBrokerCommission, isPending: isCommissionPending } =
    useAddAdminBrokerCommission();

  const [editData, setEditData] = useState({
    fullname: '',
    phoneNumber: '',
    aadharCardNumber: '',
    commission: '',
    area: '',
    password: '',
  });

  console.log('traderdata', traderdata);

  // Update editData when profileData loads
  useEffect(() => {
    if (profileData) {
      setEditData({
        fullname: profileData?.fullname || '',
        phoneNumber: profileData?.phoneNumber || '',
        aadharCardNumber: profileData?.aadharCardNumber || '',
        commission: profileData?.brokeragePercent?.toString() || '',
        area: profileData?.area || '',
        password: '',
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

  // Get ledger data from API
  const {
    data: ledgerDataFromApi,
    isLoading: isLoadingLedger,
    refetch: refetchLedger,
  } = useGetBrokerLedger(id);

  // Get broker payment history from API
  const { data: paymentDataFromApi, isLoading: isLoadingPayment } =
    useGetBrokerPaymentHistory(id);

  // Transform API data to match your table format
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

    return ledgerDataFromApi.map((item: any) => ({
      rawDateTime: item.dateTime,
      dateTime: formatDateTime(item.dateTime),
      customerName: item.customerName || item.customername || '-',
      script: item.script || '-',
      qty:
        item.qty && item.lotSize
          ? `${item.qty}/${item.lotSize}`
          : item.qty || '-',
      buyPrice: item.buyPrice ? `₹${Number(item.buyPrice).toFixed(2)}` : '-',
      sellPrice: item.sellPrice ? `₹${Number(item.sellPrice).toFixed(2)}` : '-',
      status: item.status || 'Pending',
      pnl: item.pnl
        ? `₹${Number(item.pnl).toFixed(2)}`
        : item['p&l']
          ? `₹${Number(item['p&l']).toFixed(2)}`
          : '-',
      buyTime: item.buyTime ? formatDateTime(item.buyTime) : '-',
      sellTime: item.sellTime ? formatDateTime(item.sellTime) : '-',
      brokerCommission: formatCommission(
        item.brokerCommission || item.brokercommission,
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
    }));
  }, [ledgerDataFromApi]);

  // Transform API data for payment history
  const paymentData = useMemo(() => {
    if (!paymentDataFromApi || !Array.isArray(paymentDataFromApi.data)) {
      return [];
    }

    return paymentDataFromApi.data.map((item: any) => ({
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

  // Get customers from profileData and add SR number
  const customersList = useMemo(() => {
    const customers = profileData?.customers || [];
    return customers.map((customer: any, index: number) => ({
      ...customer,
      srNo: index + 1,
    }));
  }, [profileData?.customers]);

  const totalActiveUsers = traderdata?.data.filter(
    (item: any) => item.user?.isActive,
  ).length;

  const traderTable = traderdata?.data.map((item: any, index: number) => ({
    tradername: item?.user?.fullname,
    walletBalance: item?.walletBalance,
    assetUnderControl: item?.assetUnderControl,
    marginAmount: item?.marginAmount,
    totalActiveUsers: item?.totalActiveTrade,
    totalTrade: item?.totalTrade,
    isDemo: item?.isDemo,
  }));

  console.log('traderTable', traderTable);

  // Commission History Data
  const commissionHistoryList = useMemo(() => {
    const histories = profileData?.commissionHistories || [];
    return histories.map((item: any, index: number) => ({
      sr: index + 1,
      id: item.id,
      amount: item.amount,
      amountValue: parseFloat(item.amount),
      type: item.type,
      createdAt: formatDateTime(item.createdAt),
    }));
  }, [profileData?.commissionHistories]);

  // Calculate total commission from history
  const totalCommissionFromHistory = useMemo(() => {
    return commissionHistoryList.reduce((total, item) => {
      const amount = parseFloat(item.amount);
      return total + amount;
    }, 0);
  }, [commissionHistoryList]);

  // Add SR numbers to ledger data
  const ledgerDataWithSr = useMemo(() => {
    return ledgerData.map((item: any, index: number) => ({
      ...item,
      sr: index + 1,
    }));
  }, [ledgerData]);

  // Add SR numbers to payment data
  const paymentDataWithSr = useMemo(() => {
    return paymentData.map((item: any, index: number) => ({
      ...item,
      sr: index + 1,
    }));
  }, [paymentData]);

  const handleBack = () => {
    navigate({ to: '/companybroker/displaybroker' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!id) {
      toast.error('Broker ID is missing');
      return;
    }

    if (editData.password && editData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    const updatePayload: any = {};

    if (editData.fullname !== profileData?.fullname) {
      updatePayload.fullname = editData.fullname;
    }
    if (editData.phoneNumber !== profileData?.phoneNumber) {
      updatePayload.phoneNumber = editData.phoneNumber;
    }
    if (editData.aadharCardNumber !== profileData?.aadharCardNumber) {
      updatePayload.aadharCardNumber = editData.aadharCardNumber;
    }
    if (editData.commission !== profileData?.brokeragePercent?.toString()) {
      updatePayload.commission = parseFloat(editData.commission);
    }
    if (editData.area !== profileData?.area) {
      updatePayload.area = editData.area;
    }
    if (editData.password) {
      updatePayload.password = editData.password;
    }

    if (Object.keys(updatePayload).length === 0) {
      toast.error('No changes to save');
      setIsEditing(false);
      return;
    }

    updateBrokerProfile(
      {
        id: id,
        data: updatePayload,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setShowPassword(false);
          refetch();
        },
        onError: (error: any) => {
          console.error('Update error:', error);
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
        aadharCardNumber: profileData?.aadharCardNumber || '',
        commission: profileData?.brokeragePercent?.toString() || '',
        area: profileData?.area || '',
        password: '',
      });
    }
    setIsEditing(false);
    setShowPassword(false);
  };

  // Handle Commission Submit
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

    addBrokerCommission(
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

  // Open commission modal with pre-filled amount
  const handleOpenCommissionModal = () => {
    if (profileData?.pendingCommission && profileData.pendingCommission > 0) {
      setCommissionAmount(profileData.pendingCommission.toString());
    }
    setIsCommissionModalOpen(true);
  };

  // ========== PRINT ONLY ACTIVE TAB TABLE ==========
  const handlePrintTables = () => {
    let tableData: any[] = [];
    let tableColumns: any[] = [];
    let tableTitle = '';
    let dateRange = '';

    switch (activeTab) {
      case 'ledger':
        tableData = filteredLedgerData;
        tableColumns = isLedgerExpanded
          ? expandedLedgerColumns
          : baseLedgerColumns;
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
      case 'customer':
        tableData = traderTable;
        tableColumns = customerColumns;
        tableTitle = 'Trader';
        break;
      case 'commission':
        tableData = commissionHistoryList;
        tableColumns = commissionColumns;
        tableTitle = 'Commission History';
        break;
      default:
        toast.error('No data available to print');
        return;
    }

    if (tableData.length === 0) {
      toast.error(`No ${tableTitle} data available to print`);
      return;
    }

    const printContainer = document.createElement('div');
    printContainer.id = 'print-tables';
    printContainer.style.cssText =
      'padding: 20px; font-family: Arial, sans-serif; background: white;';

    const getValue = (item: any, accessor: string) => {
      if (accessor === 'srNo') return item.srNo || '-';
      if (accessor === 'sr') return item.sr || '-';
      if (accessor === 'dateTime') return item.dateTime || '-';
      if (accessor === 'createdAt') return item.createdAt || '-';
      if (accessor === 'amountValue') {
        return `₹${item.amountValue?.toLocaleString('en-IN') || '0'}`;
      }
      if (accessor === 'type') {
        if (item.type === 'TRANSFER') return 'Transfer';
        if (item.type === 'CREDIT') return 'Credit';
        if (item.type === 'DEBIT') return 'Debit';
        return item.type || '-';
      }
      if (accessor === 'user.fullname') return item?.user?.fullname || '-';
      if (accessor === 'user.phoneNumber')
        return item?.user?.phoneNumber || '-';
      if (accessor === 'CRN') return item?.CRN || '-';
      if (accessor === 'brokeragePercent')
        return item?.brokeragePercent ? `${item.brokeragePercent}%` : '-';
      if (accessor === 'address') return item?.address || item?.area || '-';
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

    let html = '';

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

    if (profileData?.fullname) {
      html += `
      <div style="text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #ddd;">
        <div style="font-size: 20px; font-weight: bold; color: #1a1a1a;">Broker: ${profileData.fullname}</div>
        <div style="font-size: 12px; color: #666; margin-top: 4px;">BK ID: ${profileData.BKId || 'N/A'}</div>
        <div style="font-size: 11px; color: #888; margin-top: 4px;">Printed: ${new Date().toLocaleString()}</div>
      </div>
    `;
    }

    html += generateTable(tableTitle, tableData, tableColumns, dateRange);

    printContainer.innerHTML = html;

    const existingContainer = document.getElementById('print-tables');
    if (existingContainer) {
      existingContainer.remove();
    }

    document.body.appendChild(printContainer);
    window.print();

    setTimeout(() => {
      const el = document.getElementById('print-tables');
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 1000);
  };

  // Base Ledger Columns - Cleaned with proper styling
  const baseLedgerColumns = [
    { header: 'Date & Time', accessor: 'dateTime' },
    { header: 'Customer Name', accessor: 'customerName' },
    { header: 'Script', accessor: 'script' },
    { header: 'Qty/Lot', accessor: 'qty' },
    { header: 'Buy Price', accessor: 'buyPrice' },
    { header: 'Sell Price', accessor: 'sellPrice' },
    { header: 'Status', accessor: 'status' },
    { header: 'P&L', accessor: 'pnl' },
    { header: 'Broker Commission', accessor: 'brokerCommission' },
  ];

  const expandedLedgerColumns = [
    { header: 'Date & Time', accessor: 'dateTime' },
    { header: 'Customer Name', accessor: 'customerName' },
    { header: 'Script', accessor: 'script' },
    { header: 'Qty/Lot', accessor: 'qty' },
    { header: 'Buy Price', accessor: 'buyPrice' },
    { header: 'Sell Price', accessor: 'sellPrice' },
    { header: 'Buy Time', accessor: 'buyTime' },
    { header: 'Sell Time', accessor: 'sellTime' },
    { header: 'Status', accessor: 'status' },
    { header: 'P&L', accessor: 'pnl' },
    { header: 'Broker Commission', accessor: 'brokerCommission' },
  ];

  // Payment Columns - Cleaned
  const paymentColumns = [
    {
      header: 'Date',
      accessor: 'date',
      render: (item: any) => <span>{item.date}</span>,
    },
    {
      header: 'Commission Generated',
      accessor: 'commissionGenerated',
      render: (item: any) => (
        <span>₹{item.commissionGenerated?.toLocaleString() || '0'}</span>
      ),
    },
    {
      header: 'Pending Commission',
      accessor: 'pendingGenerated',
      render: (item: any) => (
        <span>₹{item.pendingGenerated?.toLocaleString() || '0'}</span>
      ),
    },
    {
      header: 'Paid Commission',
      accessor: 'paidCommission',
      render: (item: any) => (
        <span>₹{item.paidCommission?.toLocaleString() || '0'}</span>
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
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            item.status === 'Paid'
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

  // Commission History Columns
  const commissionColumns = [
    { header: 'S.No', accessor: 'sr' },
    { header: 'Date & Time', accessor: 'createdAt' },
    {
      header: 'Type',
      accessor: 'type',
      render: (item: any) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            item.type === 'TRANSFER'
              ? 'bg-blue-100 text-blue-800'
              : item.type === 'CREDIT'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
          }`}
        >
          {item.type === 'TRANSFER'
            ? 'Transfer'
            : item.type === 'CREDIT'
              ? 'Credit'
              : 'Debit'}
        </span>
      ),
    },
    {
      header: 'Amount (₹)',
      accessor: 'amountValue',
      render: (item: any) => (
        <span className="text-gray-900 text-sm font-semibold">
          ₹{item.amountValue.toLocaleString('en-IN')}
        </span>
      ),
    },
  ];

  // Customer Columns - Cleaned
  const customerColumns = [
    { header: 'Trader Name', accessor: 'tradername' },
    { header: 'Wallet Balance', accessor: 'walletBalance' },
    { header: 'Asset Under Control', accessor: 'assetUnderControl' },
    { header: 'Margin Amount', accessor: 'marginAmount' },
    { header: 'Total Active Trade', accessor: 'totalActiveUsers' },
    { header: 'Total Trade', accessor: 'totalTrade' },
    {
      header: 'Demo Account',
      accessor: 'isDemo',
      render: (row: Client) => (
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

  // Filter ledger data by date range
  const filteredLedgerData = useMemo(() => {
    if (!ledgerStartDate || !ledgerEndDate) return ledgerDataWithSr;
    return ledgerDataWithSr.filter((item: any) => {
      const itemDate = new Date(item.rawDateTime || item.dateTime);
      const startDate = new Date(ledgerStartDate);
      const endDate = new Date(ledgerEndDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [ledgerDataWithSr, ledgerStartDate, ledgerEndDate]);

  // Filter payment data by date range
  const filteredPaymentData = useMemo(() => {
    if (!paymentStartDate || !paymentEndDate) return paymentDataWithSr;

    return paymentDataWithSr.filter((item: any) => {
      const dateValue =
        item.rawDate || item.date || item.paidDate || item.createdAt;

      if (!dateValue) return true;

      const itemDate = new Date(dateValue);

      if (isNaN(itemDate.getTime())) return true;

      const startDate = new Date(paymentStartDate);
      const endDate = new Date(paymentEndDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [paymentDataWithSr, paymentStartDate, paymentEndDate]);

  const isDemoCount = profileData?.customers?.filter(
    (item: any) => item.isDemo === false,
  ).length;

  // Custom styles for GenericTable to match project theme
  const tableStyles = {
    tableClassName: "min-w-full divide-y divide-gray-200",
    theadClassName: "bg-orange-50",
    thClassName: "px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200",
    tdClassName: "px-3 py-2.5 text-sm text-gray-800 whitespace-nowrap border-b border-gray-100",
    trClassName: "hover:bg-orange-50/50 transition-colors duration-150",
    emptyMessageClassName: "text-center py-8 text-gray-500 text-sm"
  };

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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                />
              ) : (
                <p className="text-sm text-black dark:text-white md:text-base">
                  {profileData?.phoneNumber || 'N/A'}
                </p>
              )}
            </div>

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
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Super Broker
              </label>
              <p className="text-sm text-black dark:text-white md:text-base">
                {profileData?.superBroker?.user?.fullname ||
                  profileData?.superBroker?.fullname ||
                  'Unassigned'}
              </p>
            </div>

            {/* Total Customers - Read Only */}
            <div>
              <label className="mb-1 block text-xs font-medium text-black dark:text-white md:mb-2 md:text-sm">
                Total Customers
              </label>
              <p className="text-sm text-black dark:text-white md:text-base">
                {profileData?.customers?.length || 0}
              </p>
            </div>

            {/* Password Field - Only visible in edit mode */}
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
            {isDemoCount || 0}
          </h4>
          <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
            Total Customers
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <h4 className="text-xl font-bold text-green-500 md:text-2xl">
            ₹{totalCommissionFromHistory.toLocaleString() || '0'}
          </h4>
          <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
            Total Commission (History)
          </span>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <h4 className="text-xl font-bold text-orange-500 md:text-2xl">
            ₹
            {paymentDataFromApi?.summary?.paidCommission.toLocaleString() ||
              '0'}
          </h4>
          <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
            Paid Commission
          </span>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <h4 className="text-xl font-bold text-orange-500 md:text-2xl">
            ₹
            {paymentDataFromApi?.summary?.pendingCommission.toLocaleString() ||
              '0'}
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
              onClick={() => setActiveTab('customer')}
              className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${
                activeTab === 'customer'
                  ? 'border-b-2 border-orange-500 text-orange-500'
                  : 'text-bodydark2'
              }`}
            >
              Trader ({profileData?.customers?.length || 0})
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
                  {...tableStyles}
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
                  {...tableStyles}
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
                  {...tableStyles}
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
                  Traders List
                </h3>
              </div>
              <GenericTable
                data={traderTable}
                columns={customerColumns}
                searchAble={true}
                searchFields={['user.fullname', 'CRN']}
                itemsPerPage={10}
                {...tableStyles}
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

export default BrokerProfile;