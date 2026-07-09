import React, {useState, useMemo, useEffect} from 'react';
import {FiArrowLeft, FiPlus} from 'react-icons/fi';
import {
  useGetAllMasterBrockerById,
  useUpdateMasterBrokerProfile,
  useAddCommission,
} from '@/lib/react-query/masterbroker';
import {useNavigate} from '@tanstack/react-router';
import toast from 'react-hot-toast';

// Subcomponents
import { MasterBrokerProfileInfo } from './MasterBrokerProfileInfo';
import { MasterBrokerStats } from './MasterBrokerStats';
import { LedgerTab } from './LedgerTab';
import { PaymentTab } from './PaymentTab';
import { CommissionTab } from './CommissionTab';
import { BrokersTab } from './BrokersTab';
import { CommissionModal } from './CommissionModal';

interface MasterBrokerProfileProps { 
  id: string;
}

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

  const {data: profileData, refetch} = useGetAllMasterBrockerById(id);
  const {mutate: updateMasterBrokerProfile, isPending: isUpdating} =
    useUpdateMasterBrokerProfile();
  const {mutate: addCommission, isPending: isCommissionPending} =
    useAddCommission();

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
    const {startDate, endDate} = getCurrentWeekRange();
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
  const ledgerData = useMemo(() => [], []);
  const paymentData = useMemo(() => [], []);

  const ledgerDataWithSr = useMemo(() => {
    return ledgerData.map((item: any, index: number) => ({
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

  const baseLedgerColumns = [
    {header: 'Date/Time', accessor: 'dateTime'},
    {header: 'Transaction ID', accessor: 'transactionId'},
    {header: 'Stript', accessor: 'stript'},
    {header: 'Transaction Amount', accessor: 'transactionAmount'},
    {header: 'Master Broker Commission', accessor: 'MasterBrokerCommission'},
    {header: 'Status', accessor: 'status'},
  ];

  const expandedLedgerColumns = [
    {header: 'Date/Time', accessor: 'dateTime'},
    {header: 'Customer Name', accessor: 'customerName'},
    {header: 'Transaction ID', accessor: 'transactionId'},
    {header: 'Stript', accessor: 'stript'},
    {header: 'Order Type', accessor: 'orderType'},
    {header: 'Holding Type', accessor: 'holdingType'},
    {header: 'Qty', accessor: 'qty'},
    {header: 'Price', accessor: 'price'},
    {header: 'Status', accessor: 'status'},
    {header: 'Transaction Amount', accessor: 'transactionAmount'},
    {header: 'Paid Amount', accessor: 'paidAmount'},
    {header: 'Margin Amount', accessor: 'marginAmount'},
    {header: 'Total Commission', accessor: 'totalCommission'},
    {header: 'Broker Commission', accessor: 'brokerCommission'},
    {header: 'Payment Status', accessor: 'paymentStatus'},
  ];

  const ledgerColumns = isLedgerExpanded
    ? expandedLedgerColumns
    : baseLedgerColumns;

  const paymentColumns = [
    {header: 'Date', accessor: 'date'},
    {header: 'Commission Generated', accessor: 'commissionGenerated'},
    {header: 'Paid Amount', accessor: 'paidAmount'},
    {header: 'Paid Date', accessor: 'paidDate'},
    {header: 'Status', accessor: 'status'},
  ];

  // Commission History Columns
  const commissionColumns = [
    {header: 'S.No', accessor: 'srNo'},
    {
      header: 'Date & Time',
      accessor: 'createdAt',
      render: (item: any) => (
        <span className="text-sm">
          {item.createdAt
            ? new Date(item.createdAt).toLocaleString('en-IN', {
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
      header: 'Amount (₹)',
      accessor: 'amountValue',
      render: (item: any) => (
        <span className="text-gray-900 text-sm font-semibold">
          ₹{item.amountValue.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (item: any) => (
        <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
          {item.type === 'TRANSFER' ? 'Commission Transfer' : item.type}
        </span>
      ),
    },
  ];

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
      header: 'Total Business',
      accessor: 'totalBusiness',
      render: () => <span className="text-gray-700">-</span>,
    },
    {
      header: 'Total Commission',
      accessor: 'totalCommission',
      render: () => <span className="text-gray-700">-</span>,
    },
    {
      header: 'Pending Commission',
      accessor: 'pendingCommission',
      render: () => <span className="text-gray-700">-</span>,
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setEditData((prev) => ({...prev, [name]: value}));
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
        commission: profileData?.upcomingBrokeragePercent?.toString() || '',
        area: profileData?.area || '',
        aadharCardNumber: profileData?.aadharCardNumber || '',
        password: '',
      });
    }
    setIsEditing(false);
    setShowPassword(false);
  };

  const handleBack = () => {
    navigate({to: '/companybroker/display-master-broker'});
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
    return ledgerDataWithSr.filter((item: any) => {
      const itemDate = new Date(item.dateTime);
      const startDate = new Date(ledgerStartDate);
      const endDate = new Date(ledgerEndDate);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [ledgerDataWithSr, ledgerStartDate, ledgerEndDate]);

  const filteredPaymentData = useMemo(() => {
    if (!paymentStartDate || !paymentEndDate) return paymentDataWithSr;
    return paymentDataWithSr.filter((item: any) => {
      const itemDate = new Date(item.date);
      const startDate = new Date(paymentStartDate);
      const endDate = new Date(paymentEndDate);
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
    <div className="max-w-9xl mx-auto p-4 md:p-6">
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
      <MasterBrokerStats profileData={profileData} />

      {/* Tabs and Tables Section */}
      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center justify-between border-b border-stroke dark:border-strokedark">
          <div className="flex">
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
              onClick={() => setActiveTab('commission')}
              className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${
                activeTab === 'commission'
                  ? 'border-b-2 border-orange-500 text-orange-500'
                  : 'text-bodydark2'
              }`}
            >
              Commission History ({profileData?.commissionHistories?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('broker')}
              className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${
                activeTab === 'broker'
                  ? 'border-b-2 border-orange-500 text-orange-500'
                  : 'text-bodydark2'
              }`}
            >
              Brokers ({profileData?.brokers?.length || 0})
            </button>
          </div>
          <div className="px-4 py-2">
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
          {activeTab === 'ledger' && (
            <LedgerTab
              ledgerStartDate={ledgerStartDate}
              setLedgerStartDate={setLedgerStartDate}
              ledgerEndDate={ledgerEndDate}
              setLedgerEndDate={setLedgerEndDate}
              isLedgerExpanded={isLedgerExpanded}
              setIsLedgerExpanded={setIsLedgerExpanded}
              filteredLedgerData={filteredLedgerData}
              ledgerColumns={ledgerColumns}
            />
          )}

          {activeTab === 'payment' && (
            <PaymentTab
              paymentStartDate={paymentStartDate}
              setPaymentStartDate={setPaymentStartDate}
              paymentEndDate={paymentEndDate}
              setPaymentEndDate={setPaymentEndDate}
              filteredPaymentData={filteredPaymentData}
              paymentColumns={paymentColumns}
              getCurrentWeekRange={getCurrentWeekRange}
            />
          )}

          {activeTab === 'commission' && (
            <CommissionTab
              commissionStartDate={commissionStartDate}
              setCommissionStartDate={setCommissionStartDate}
              commissionEndDate={commissionEndDate}
              setCommissionEndDate={setCommissionEndDate}
              filteredCommissionHistory={filteredCommissionHistory}
              commissionColumns={commissionColumns}
            />
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
