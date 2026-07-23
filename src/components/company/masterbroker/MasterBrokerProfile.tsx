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

interface MasterBrokerProfileProps {
  id: string;
}

const formatQtyLot = (item) => {
  if (!item) return '-';
  const qty = item.qty || item.Qty || 0;
  const lotSize = item.lotSize || item.lotSize || 0;
  if (lotSize && lotSize !== qty) {
    return `${qty}/${lotSize}`;
  }
  return qty;
};

const formatPnL = (item) => {
  const pnl = item.pnl || item['p&l'] || 0;
  const sign = pnl > 0 ? '+' : '';
  return `${sign}${Number(pnl).toFixed(2)}`;
};

const MasterBrokerProfile = ({ id }: MasterBrokerProfileProps) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('ledger');
  const [isLedgerExpanded, setIsLedgerExpanded] = useState(false);
  const [paymentStartDate, setPaymentStartDate] = useState('');
  const [paymentEndDate, setPaymentEndDate] = useState('');
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');
  const [commissionStartDate, setCommissionStartDate] = useState('');
  const [commissionEndDate, setCommissionEndDate] = useState('');

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

  const ledgerDataWithSr = useMemo(() => {
    return ledgerData?.map((item: any, index: number) => ({
      ...item,
      sr: index + 1,
    }));
  }, [ledgerData]);

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
    {
      header: 'Broker Name',
      accessor: 'brokerName',
      render: (item: any) => {
        const brokerName = item?.broker?.user?.fullname || item?.brokerName || '-';
        return (
          <span className="text-gray-700 text-sm">{brokerName}</span>
        );
      },
    },
    {
      header: 'Super Broker Name',
      accessor: 'superBrokerName',
      render: (item: any) => {
        const superBrokerName = item?.broker?.superBroker?.user?.fullname ||
          item?.superBrokerName ||
          item?.superBroker?.fullname ||
          '-';
        return (
          <span className="text-gray-700 text-sm">{superBrokerName}</span>
        );
      },
    },
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
      render: (item: any) => <span className="font-medium">{item.buyPrice || '-'}</span>
    },
    {
      header: 'Sell Price',
      accessor: 'sellPrice',
      render: (item: any) => <span className="font-medium">{item.sellPrice || '-'}</span>
    },
    { header: 'Status', accessor: 'status' },
    {
      header: 'P&L',
      accessor: (item) => formatPnL(item),
      render: (item: any) => {
        const pnl = item.pnl || item['p&l'] || 0;
        const isPositive = pnl > 0;
        const isNegative = pnl < 0;
        return (
          <span className={`font-semibold ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'}`}>
            {formatPnL(item)}
          </span>
        );
      }
    },
    {
      header: 'Buy Time',
      accessor: 'buyTime',
      render: (item: any) => <span>{item.buyTime || '-'}</span>
    },
    {
      header: 'Sell Time',
      accessor: 'sellTime',
      render: (item: any) => <span>{item.sellTime || '-'}</span>
    },
    {
      header: 'Master Broker Commission',
      accessor: 'masterBrokerCommission',
      render: (item: any) => <span className="font-medium">{item.masterBrokerCommission || '-'}</span>
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!id) {
      toast.error('Master Broker ID is missing');
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
        password: '',

      });
    }
    setIsEditing(false);
    setShowPassword(false);
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
      const itemDate = new Date(item.dateTime || item.createdAt);
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
                  Traders List
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