import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  CreditCard,
  TrendingUp,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  useGetClientById,
  useSendDeposite,
  useAddMargin,
  useSendWithdraw,
  useUpdateCustomer,
  useGetClientLedgerById,
} from './mutationapi';
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
const formatQtyLot = (item) => {
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

// Format P&L with proper sign and color
// Format P&L with proper sign and color
const formatPnL = (item) => {
  const pnl = item.pnl || item['p&l'] || 0;
  const sign = pnl > 0 ? '+' : '';
  // ✅ Fix: Show only 2 decimal places
  return `${sign}${Number(pnl).toFixed(2)}`;
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
  const { data: ledgerData, refetch: refetchLedger } = useGetClientLedgerById(id);
  console.log('ledgerData', ledgerData);

  const totalPnL = useMemo(() => {
    const ledgerDataArray = ledgerData?.data || [];
    return ledgerDataArray.reduce((sum: number, item: any) => {
      return sum + Number(item.pnl ?? item['p&l'] ?? 0);
    }, 0);
  }, [ledgerData]);

  const { mutateAsync: sendDeposite, isPending: isDepositPending } =
    useSendDeposite();
  const { mutateAsync: sendWithdraw, isPending: isWithdrawPending } =
    useSendWithdraw();
  const { mutateAsync: addMargin, isPending: isMarginPending } = useAddMargin();

  const [tradingLedgerData, setTradingLedgerData] = useState<any[]>([]);
  const [paymentData, setPaymentData] = useState<any[]>([]);

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

  const ledgerColumns = [
    { header: 'Date & Time', accessor: 'dateTime', render: (item: any) => renderDateTime(item.dateTime) },
    { header: 'Trader Name', accessor: 'customerName' },
    { header: 'Script', accessor: 'script' },
    { header: 'Qty/Lot', accessor: (item: any) => formatQtyLot(item) },
    { header: 'Buy Price', accessor: 'buyPrice' },
    { header: 'Sell Price', accessor: 'sellPrice' },
    { header: 'Buy Time', accessor: 'buyTime', render: (item: any) => renderDateTime(item.buyTime) },
    { header: 'Sell Time', accessor: 'sellTime', render: (item: any) => renderDateTime(item.sellTime) },
    { header: 'Status', accessor: 'status' },
    { header: 'P&L', accessor: (item: any) => formatPnL(item) },
    { header: 'Admin Commission', accessor: (item: any) => formatCommission(item.companyCommission) },
    { header: 'Super Broker Commission', accessor: (item: any) => formatCommission(item.superBrokerCommission) },
    { header: 'Broker Commission', accessor: (item: any) => formatCommission(item.brokerCommission) },
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
    </motion.div>
  );
};
