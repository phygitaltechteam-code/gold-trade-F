import React, {useState, useMemo, useEffect} from 'react';
import {FiEdit2, FiSave, FiX, FiArrowLeft} from 'react-icons/fi';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {
  useGetAllSuperBrockerById,
  useUpdateSuperBrokerProfile,
} from '@/lib/react-query/superbrocker';
import {Route} from '@/routes/_app/companybroker/SuperbrockerProfile.$id';
import {useNavigate} from '@tanstack/react-router';
import toast from 'react-hot-toast';

const SuperBrokerProfile = () => {
  const {id} = Route.useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('ledger');
  const [isLedgerExpanded, setIsLedgerExpanded] = useState(false);
  const [paymentStartDate, setPaymentStartDate] = useState('');
  const [paymentEndDate, setPaymentEndDate] = useState('');
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');

  const {data: profileData, refetch} = useGetAllSuperBrockerById(id);
  const {mutate: updateSuperBrokerProfile, isPending: isUpdating} =
    useUpdateSuperBrokerProfile();

  const [editData, setEditData] = useState({
    fullname: '',
    phoneNumber: '',
    brokeragePercent: '',
    area: '',
    aadharCardNumber: '',
  });

  // Update editData when profileData loads
  useEffect(() => {
    if (profileData) {
      setEditData({
        fullname: profileData?.fullname || '',
        phoneNumber: profileData?.phoneNumber || '',
        brokeragePercent: profileData?.brokeragePercent || '',
        area: profileData?.area || '',
        aadharCardNumber: profileData?.aadharCardNumber || '',
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

  // Get brokers from profileData and add SR number
  const brokersList = useMemo(() => {
    const brokers = profileData?.brokers || [];
    return brokers.map((broker: any, index: number) => ({
      ...broker,
      srNo: index + 1,
    }));
  }, [profileData?.brokers]);

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
    {header: 'Super Broker Commission', accessor: 'superBrokerCommission'},
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
      accessor: 'brokeragePercent',
      render: (item: any) => (
        <span className="rounded border border-orange-100 bg-orange-50 px-2 py-1 text-xs font-bold text-orange-600">
          {item?.brokeragePercent ? `${item.brokeragePercent}%` : '-'}
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
      toast.error('Super Broker ID is missing');
      return;
    }

    // Prepare update data - only include editable fields
    const updatePayload = {
      fullname: editData.fullname,
      phoneNumber: editData.phoneNumber,
      brokeragePercent: editData.brokeragePercent,
      area: editData.area,
      aadharCardNumber: editData.aadharCardNumber,
    };

    updateSuperBrokerProfile({
      id: id,
      data: updatePayload,
    });
  };

  const handleCancel = () => {
    if (profileData) {
      setEditData({
        fullname: profileData?.fullname || '',
        phoneNumber: profileData?.phoneNumber || '',
        brokeragePercent: profileData?.brokeragePercent || '',
        area: profileData?.area || '',
        aadharCardNumber: profileData?.aadharCardNumber || '',
      });
    }
    setIsEditing(false);
  };

  const handleBack = () => {
    navigate({to: '/companybroker/DisplaySuperBroker'});
  };

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
          Back to Super Brokers
        </button>
      </div>

      {/* Profile Details Section */}
      <div className="mb-6 rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between rounded-t-lg border-b border-stroke bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 dark:border-strokedark">
          <h2 className="text-xl font-semibold text-white">
            Super Broker Profile
          </h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="hover:bg-gray-100 flex items-center gap-2 rounded bg-white px-4 py-2 text-sm font-medium text-orange-500 transition-colors"
            >
              <FiEdit2 className="h-4 w-4" /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex items-center gap-2 rounded bg-red-100 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-200 disabled:opacity-50"
              >
                <FiX className="h-4 w-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="hover:bg-gray-100 flex items-center gap-2 rounded bg-white px-4 py-2 text-sm font-medium text-orange-500 transition-colors disabled:opacity-50"
              >
                <FiSave className="h-4 w-4" />{' '}
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Full Name - Editable */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullname"
                  value={editData.fullname}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              ) : (
                <p className="text-black dark:text-white">
                  {profileData?.fullname || 'N/A'}
                </p>
              )}
            </div>

            {/* BK ID - Read Only */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                BK ID
              </label>
              <p className="text-black dark:text-white">
                {profileData?.BKId || 'N/A'}
              </p>
            </div>

            {/* Phone Number - Editable */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phoneNumber"
                  value={editData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              ) : (
                <p className="text-black dark:text-white">
                  {profileData?.phoneNumber || 'N/A'}
                </p>
              )}
            </div>

            {/* Email - Read Only */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Email
              </label>
              <p className="text-black dark:text-white">
                {profileData?.email || 'N/A'}
              </p>
            </div>

            {/* Aadhar Number - Editable */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Aadhar Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="aadharCardNumber"
                  value={editData.aadharCardNumber}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              ) : (
                <p className="text-black dark:text-white">
                  {profileData?.aadharCardNumber || 'N/A'}
                </p>
              )}
            </div>

            {/* Commission % - Editable */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Commission %
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  name="brokeragePercent"
                  value={editData.brokeragePercent}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              ) : (
                <p className="text-black dark:text-white">
                  {profileData?.brokeragePercent || '0'}%
                </p>
              )}
            </div>

            {/* Area - Editable */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Area
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="area"
                  value={editData.area}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              ) : (
                <p className="text-black dark:text-white">
                  {profileData?.area || 'N/A'}
                </p>
              )}
            </div>

            {/* Total Brokers - Read Only */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Total Brokers
              </label>
              <p className="text-black dark:text-white">
                {profileData?.brokers?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h4 className="text-2xl font-bold text-black dark:text-white">
            ₹{profileData?.totalBusiness?.toLocaleString() || '0'}
          </h4>
          <span className="text-gray-500 mt-1 text-sm font-medium">
            Total Business
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h4 className="text-2xl font-bold text-green-500">
            ₹{profileData?.totalCommission?.toLocaleString() || '0'}
          </h4>
          <span className="text-gray-500 mt-1 text-sm font-medium">
            Total Commission
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h4 className="text-2xl font-bold text-orange-500">
            ₹{profileData?.pendingCommission?.toLocaleString() || '0'}
          </h4>
          <span className="text-gray-500 mt-1 text-sm font-medium">
            Pending Commission
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h4 className="text-2xl font-bold text-blue-500">
            {profileData?.brokers?.length || 0}
          </h4>
          <span className="text-gray-500 mt-1 text-sm font-medium">
            Total Brokers
          </span>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex border-b border-stroke dark:border-strokedark">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-6 py-4 font-medium transition-colors hover:text-orange-500 ${
              activeTab === 'ledger'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-bodydark2'
            }`}
          >
            Ledger
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-6 py-4 font-medium transition-colors hover:text-orange-500 ${
              activeTab === 'payment'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-bodydark2'
            }`}
          >
            Payment History
          </button>
          <button
            onClick={() => setActiveTab('broker')}
            className={`px-6 py-4 font-medium transition-colors hover:text-orange-500 ${
              activeTab === 'broker'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-bodydark2'
            }`}
          >
            Brokers ({profileData?.brokers?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('commission')}
            className={`px-6 py-4 font-medium transition-colors hover:text-orange-500 ${
              activeTab === 'commission'
                ? 'border-b-2 border-orange-500 text-orange-500'
                : 'text-bodydark2'
            }`}
          >
            Commission
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'ledger' && (
            <div className="overflow-x-auto">
              <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Ledger Records
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-black dark:text-white">
                      From :
                    </label>
                    <input
                      type="date"
                      value={ledgerStartDate}
                      onChange={(e) => setLedgerStartDate(e.target.value)}
                      className="rounded border border-stroke bg-transparent px-3 py-1 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-black dark:text-white">
                      To :
                    </label>
                    <input
                      type="date"
                      value={ledgerEndDate}
                      onChange={(e) => setLedgerEndDate(e.target.value)}
                      className="rounded border border-stroke bg-transparent px-3 py-1 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>
                  <button
                    onClick={() => setIsLedgerExpanded(!isLedgerExpanded)}
                    className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
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
          )}

          {activeTab === 'payment' && (
            <div className="overflow-x-auto">
              <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Payment History
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-black dark:text-white">
                      From :
                    </label>
                    <input
                      type="date"
                      value={paymentStartDate}
                      onChange={(e) => setPaymentStartDate(e.target.value)}
                      className="rounded border border-stroke bg-transparent px-3 py-1 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-black dark:text-white">
                      To :
                    </label>
                    <input
                      type="date"
                      value={paymentEndDate}
                      onChange={(e) => setPaymentEndDate(e.target.value)}
                      className="rounded border border-stroke bg-transparent px-3 py-1 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>
                  {(paymentStartDate || paymentEndDate) && (
                    <button
                      onClick={() => {
                        const {startDate, endDate} = getCurrentWeekRange();
                        setPaymentStartDate(startDate);
                        setPaymentEndDate(endDate);
                      }}
                      className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded px-3 py-1.5 text-sm font-medium transition-colors dark:bg-meta-4 dark:text-white dark:hover:bg-meta-3"
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
          )}

          {activeTab === 'broker' && (
            <div className="overflow-x-auto">
              <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Brokers List
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search brokers..."
                      className="rounded border border-stroke bg-transparent px-4 py-2 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>
                </div>
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

          {activeTab === 'commission' && (
            <div className="overflow-x-auto">
              <div className="flex h-64 items-center justify-center">
                <p className="text-gray-500">
                  Commission details coming soon...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperBrokerProfile;
