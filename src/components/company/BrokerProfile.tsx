import React, {useState, useEffect, useMemo} from 'react';
import {FiEdit2, FiSave, FiX, FiArrowLeft, FiPlus} from 'react-icons/fi';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {useNavigate} from '@tanstack/react-router';
import toast from 'react-hot-toast';
import {Eye, EyeOff} from 'lucide-react';
import {
  useAddAdminBrokerCommission,
  useGetAllAdminBrockerById,
  useUpdateAdminBrokerProfile,
} from '@/lib/api/addbroker';
import {Route} from '@/routes/_app/companybroker/BrokerProfile.$id';

const BrokerProfile = () => {
  const {id} = Route.useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('ledger');
  const [isLedgerExpanded, setIsLedgerExpanded] = useState(false);
  const [paymentStartDate, setPaymentStartDate] = useState('');
  const [paymentEndDate, setPaymentEndDate] = useState('');
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');

  // Commission Modal State
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [commissionAmount, setCommissionAmount] = useState('');
  const [commissionPin, setCommissionPin] = useState('');
  const [showCommissionPin, setShowCommissionPin] = useState(false);
  const [commissionType, setCommissionType] = useState<'credit' | 'debit'>(
    'credit',
  );

  const {data: profileData, refetch} = useGetAllAdminBrockerById(id);
  const {mutate: updateBrokerProfile, isPending: isUpdating} =
    useUpdateAdminBrokerProfile();
  const {mutate: addBrokerCommission, isPending: isCommissionPending} =
    useAddAdminBrokerCommission();

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
        brokeragePercent: profileData?.brokeragePercent?.toString() || '',
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
    const {startDate, endDate} = getCurrentWeekRange();
    setLedgerStartDate(startDate);
    setLedgerEndDate(endDate);
    setPaymentStartDate(startDate);
    setPaymentEndDate(endDate);
  }, []);

  console.log('Profile Data:', profileData);
  console.log('Edit Data:', editData);

  // Sample data for ledger (replace with actual API data)
  const ledgerData = useMemo(() => [], []);
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
    navigate({to: '/companybroker/displaybroker'});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setEditData((prev) => ({...prev, [name]: value}));
  };

  const handleSave = () => {
    if (!id) {
      toast.error('Broker ID is missing');
      return;
    }

    // Prepare update payload - only send fields that have changed
    const updatePayload: any = {};

    if (editData.fullname !== profileData?.fullname) {
      updatePayload.fullname = editData.fullname;
    }
    if (editData.phoneNumber !== profileData?.phoneNumber) {
      updatePayload.phoneNumber = editData.phoneNumber;
    }
    if (editData.email !== profileData?.email) {
      updatePayload.email = editData.email;
    }
    if (editData.aadharCardNumber !== profileData?.aadharCardNumber) {
      updatePayload.aadharCardNumber = editData.aadharCardNumber;
    }
    // CRITICAL FIX: Send commission as brokeragePercent or commission based on API expectation
    if (
      editData.brokeragePercent !== profileData?.brokeragePercent?.toString()
    ) {
      updatePayload.brokeragePercent = parseFloat(editData.brokeragePercent);
    }
    if (editData.area !== profileData?.area) {
      updatePayload.area = editData.area;
    }

    console.log('Update Payload being sent:', updatePayload);

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
          toast.success('Profile updated successfully!');
          setIsEditing(false);
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
        email: profileData?.email || '',
        aadharCardNumber: profileData?.aadharCardNumber || '',
        brokeragePercent: profileData?.brokeragePercent?.toString() || '',
        area: profileData?.area || '',
      });
    }
    setIsEditing(false);
  };

  // Handle Commission Submit
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

    addBrokerCommission(
      {
        id: id,
        data: {
          amount: parseFloat(commissionAmount),
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
        },
      },
    );
  };

  // Base Ledger Columns
  const baseLedgerColumns = [
    {header: 'Sr', accessor: 'sr'},
    {header: 'Date/Time', accessor: 'dateTime'},
    {header: 'Transaction ID', accessor: 'transactionId'},
    {header: 'Stript', accessor: 'stript'},
    {header: 'Transaction Amount', accessor: 'transactionAmount'},
    {header: 'Super Broker Commission', accessor: 'superBrokerCommission'},
    {header: 'Status', accessor: 'status'},
  ];

  // Expanded Ledger Columns
  const expandedLedgerColumns = [
    {header: 'Sr', accessor: 'sr'},
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
    {header: 'Super Broker Commission', accessor: 'superBrokerCommission'},
    {header: 'Payment Status', accessor: 'paymentStatus'},
  ];

  const ledgerColumns = isLedgerExpanded
    ? expandedLedgerColumns
    : baseLedgerColumns;

  // Column definitions for the Payment History table
  const paymentColumns = [
    {header: 'Sr', accessor: 'sr'},
    {header: 'Date', accessor: 'date'},
    {header: 'Commission Generated', accessor: 'commissionGenerated'},
    {header: 'Paid Amount', accessor: 'paidAmount'},
    {header: 'Paid Date', accessor: 'paidDate'},
    {header: 'Status', accessor: 'status'},
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
    {
      header: 'CRN',
      accessor: 'CRN',
      render: (item: any) => (
        <span className="font-mono text-gray-600 text-sm font-medium">
          {item?.CRN || '-'}
        </span>
      ),
    },
    {
      header: 'Commission',
      accessor: 'brokeragePercent',
      render: (item: any) => (
        <span className="rounded border border-orange-100 bg-orange-50 px-2 py-1 text-xs font-bold text-orange-600">
          {item?.brokeragePercent ? `${item.brokeragePercent}%` : '-'}
        </span>
      ),
    },
    {
      header: 'Address',
      accessor: 'address',
      render: (item: any) => (
        <span className="text-gray-700 text-sm">
          {item?.address || item?.area || '-'}
        </span>
      ),
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

  // Filter ledger data by date range
  const filteredLedgerData = useMemo(() => {
    if (!ledgerStartDate || !ledgerEndDate) return ledgerDataWithSr;
    return ledgerDataWithSr.filter((item: any) => {
      const itemDate = new Date(item.dateTime);
      const startDate = new Date(ledgerStartDate);
      const endDate = new Date(ledgerEndDate);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }, [ledgerDataWithSr, ledgerStartDate, ledgerEndDate]);

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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white md:px-4 md:py-2"
                />
              ) : (
                <p className="text-sm text-black dark:text-white md:text-base">
                  {profileData?.phoneNumber || 'N/A'}
                </p>
              )}
            </div>

            {/* Email - Editable */}
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
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <h4 className="text-xl font-bold text-black dark:text-white md:text-2xl">
            ₹{profileData?.totalBusiness?.toLocaleString() || '0'}
          </h4>
          <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
            Total Business
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <h4 className="text-xl font-bold text-green-500 md:text-2xl">
            ₹{profileData?.totalCommission?.toLocaleString() || '0'}
          </h4>
          <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
            Total Commission
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <h4 className="text-xl font-bold text-orange-500 md:text-2xl">
            ₹{profileData?.pendingCommission?.toLocaleString() || '0'}
          </h4>
          <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
            Pending Commission
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <h4 className="text-xl font-bold text-blue-500 md:text-2xl">
            {profileData?.customers?.length || 0}
          </h4>
          <span className="text-gray-500 mt-1 text-xs font-medium sm:text-sm">
            Total Customers
          </span>
        </div>
      </div>

      {/* Tabs Section */}
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
              onClick={() => setActiveTab('customer')}
              className={`px-4 py-3 text-sm font-medium transition-colors hover:text-orange-500 md:px-6 md:py-4 ${
                activeTab === 'customer'
                  ? 'border-b-2 border-orange-500 text-orange-500'
                  : 'text-bodydark2'
              }`}
            >
              Customers ({profileData?.customers?.length || 0})
            </button>
          </div>
          <div className="px-4 py-2">
            <button
              onClick={() => setIsCommissionModalOpen(true)}
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
                        const {startDate, endDate} = getCurrentWeekRange();
                        setLedgerStartDate(startDate);
                        setLedgerEndDate(endDate);
                      }}
                      className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded px-2 py-1 text-xs font-medium transition-colors dark:bg-meta-4 dark:text-white dark:hover:bg-meta-3 md:px-3 md:py-1.5 md:text-sm"
                    >
                      This Week
                    </button>
                  )}
                  <button
                    onClick={() => setIsLedgerExpanded(!isLedgerExpanded)}
                    className="rounded bg-orange-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-600 md:px-4 md:py-2 md:text-sm"
                  >
                    {isLedgerExpanded ? 'View Less' : 'View More'}
                  </button>
                </div>
              </div>
              <GenericTable
                data={filteredLedgerData}
                columns={ledgerColumns}
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
                        const {startDate, endDate} = getCurrentWeekRange();
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

      {/* Commission Modal */}
      {isCommissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-5 shadow-xl md:p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              Add Commission
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
                  Commission Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  placeholder="Enter Commission Amount"
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
                  {isCommissionPending ? 'Processing...' : 'Add Commission'}
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
