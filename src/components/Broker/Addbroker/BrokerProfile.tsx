import React, {useState} from 'react';
import {FiEdit2, FiSave, FiX} from 'react-icons/fi';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {Route} from '@/routes/_app/broker/brokerprofile.$id';
import {useGetAllBrockerById} from './brokerapi';

const BrokerProfile = () => {
  const {id} = Route.useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('ledger');
  const [isLedgerExpanded, setIsLedgerExpanded] = useState(false);
  const [paymentStartDate, setPaymentStartDate] = useState('');
  const [paymentEndDate, setPaymentEndDate] = useState('');
  const [ledgerStartDate, setLedgerStartDate] = useState('');
  const [ledgerEndDate, setLedgerEndDate] = useState('');
  const {data: profileData} = useGetAllBrockerById(id);

  console.log('super brockerrrrrrr', profileData);
  // Mock data for the profile
  // const [profileData, setProfileData] = useState({
  //   fullname: 'Rajesh Kumar',
  //   aadharCardNumber: '123456789012',
  //   commission: '2.5',
  //   area: 'Mumbai North',
  //   password: 'password123',
  //   totalBusiness: 1500000,
  //   totalCommission: 37500,
  //   pendingCommission: 12500,
  //   totalBrokers: 14,
  // });

  const [editData, setEditData] = useState({...profileData});

  const baseLedgerColumns = [
    {header: 'Sr', accessor: 'sr'},
    {header: 'Date/Time', accessor: 'dateTime'},
    {header: 'Transaction ID', accessor: 'transactionId'},
    {header: 'Stript', accessor: 'stript'},
    {header: 'Transaction Amount', accessor: 'transactionAmount'},
    {header: 'Super Broker Commission', accessor: 'superBrokerCommission'},
    {header: 'Status', accessor: 'status'},
  ];

  const expandedLedgerColumns = [
    {header: 'Sr', accessor: 'sr'},
    {header: 'Date/Time', accessor: 'dateTime'},
    {header: 'Customer Name', accessor: 'customerName'},
    {header: 'Broker Name', accessor: 'brokerName'},
    {header: 'Transaction ID', accessor: 'transactionId'},
    {header: 'Stript', accessor: 'stript'},
    {header: 'Order Type', accessor: 'orderType'},
    {header: 'Holding Type', accessor: 'holdingType'},
    {header: 'Qty', accessor: 'qty'},
    {header: 'Price', accessor: 'price'},
    {header: 'Status', accessor: 'status'},
    {header: 'Transaction Amount', accessor: 'transactionAmount'},
    {header: 'Total Amount', accessor: 'totalAmount'},

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

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setEditData((prev) => ({...prev, [name]: value}));
  };

  const handleSave = () => {
    // setProfileData({...editData});
    setIsEditing(false);
    // TODO: Add API call to save profile details
  };

  const handleCancel = () => {
    setEditData({...profileData});
    setIsEditing(false);
  };

  return (
    <div className="max-w-9xl mx-auto p-4 md:p-6">
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
                className="flex items-center gap-2 rounded bg-red-100 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-200"
              >
                <FiX className="h-4 w-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="hover:bg-gray-100 flex items-center gap-2 rounded bg-white px-4 py-2 text-sm font-medium text-orange-500 transition-colors"
              >
                <FiSave className="h-4 w-4" /> Save
              </button>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullname"
                  value={editData?.fullname}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              ) : (
                <p className="text-black dark:text-white">
                  {profileData?.fullname}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Aadhar Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="aadharCardNumber"
                  value={editData?.aadharCardNumber}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              ) : (
                <p className="text-black dark:text-white">
                  {profileData?.aadharCardNumber}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Commission %
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="commission"
                  value={editData?.commission}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              ) : (
                <p className="text-black dark:text-white">
                  {profileData?.commission}%
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Area
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="area"
                  value={editData?.area}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              ) : (
                <p className="text-black dark:text-white">
                  {profileData?.area}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Password
              </label>
              {isEditing ? (
                <input
                  type="text" // using text so it can be viewed and edited easily
                  name="password"
                  value={editData?.password}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              ) : (
                <p className="text-black dark:text-white">••••••••</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h4 className="text-2xl font-bold text-black dark:text-white">
            ₹{profileData?.totalBusiness?.toLocaleString()}
          </h4>
          <span className="text-gray-500 mt-1 text-sm font-medium">
            Total Business
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h4 className="text-2xl font-bold text-green-500">
            ₹{profileData?.totalCommission?.toLocaleString()}
          </h4>
          <span className="text-gray-500 mt-1 text-sm font-medium">
            Total Commission
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h4 className="text-2xl font-bold text-orange-500">
            ₹{profileData?.pendingCommission?.toLocaleString()}
          </h4>
          <span className="text-gray-500 mt-1 text-sm font-medium">
            Pending Commission
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h4 className="text-2xl font-bold text-blue-500">
            {profileData?.totalBrokers}
          </h4>
          <span className="text-gray-500 mt-1 text-sm font-medium">
            No. Brokers
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
        </div>

        <div className="p-6">
          {activeTab === 'ledger' ? (
            <div className="overflow-x-auto">
              <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Ledger Records
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-black dark:text-white">
                      From:
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
                      To:
                    </label>
                    <input
                      type="date"
                      value={ledgerEndDate}
                      onChange={(e) => setLedgerEndDate(e.target.value)}
                      className="rounded border border-stroke bg-transparent px-3 py-1 text-sm outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>
                  {(ledgerStartDate || ledgerEndDate) && (
                    <button
                      onClick={() => {
                        setLedgerStartDate('');
                        setLedgerEndDate('');
                      }}
                      className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded px-3 py-1.5 text-sm font-medium transition-colors dark:bg-meta-4 dark:text-white dark:hover:bg-meta-3"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setIsLedgerExpanded(!isLedgerExpanded)}
                    className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                  >
                    {isLedgerExpanded ? 'View Less' : 'View More'}
                  </button>
                </div>
              </div>
              <GenericTable
                data={[]}
                columns={ledgerColumns}
                paginationOff={true}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Payment History
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-black dark:text-white">
                      From:
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
                      To:
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
                        setPaymentStartDate('');
                        setPaymentEndDate('');
                      }}
                      className="bg-gray-200 text-gray-700 hover:bg-gray-300 rounded px-3 py-1.5 text-sm font-medium transition-colors dark:bg-meta-4 dark:text-white dark:hover:bg-meta-3"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              <GenericTable
                data={[]}
                columns={paymentColumns}
                paginationOff={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrokerProfile;
