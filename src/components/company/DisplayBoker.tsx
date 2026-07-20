// Stat Card Component
const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-orange-500',
  bgColor = 'bg-orange-50',
  valueColor = 'text-slate-900',
}) => (
  <div className="group relative overflow-hidden rounded-lg border border-stroke bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-strokedark dark:bg-boxdark md:p-5">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
          {title}
        </p>
        <h4 className={`mt-2 text-xl font-bold md:text-2xl ${valueColor}`}>
          {value}
        </h4>
      </div>
      <div className={`rounded-lg p-2 ${bgColor}`}>
        {Icon && <Icon className={`h-5 w-5 ${iconColor} md:h-6 md:w-6`} />}
      </div>
    </div>
  </div>
);



import React, { useState, useEffect, useRef } from 'react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  useGetBrokerData,
  useDeleteBroker,
  useUpdateBrokerStatus,
} from '@/lib/api/addbroker';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle, Clock, DollarSign, Eye, EyeOff, UserCheck, Users } from 'lucide-react';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4
    }
  }
};

const DisplayBroker = ({ refreshTrigger }: { refreshTrigger?: boolean }) => {
  const [brokers, setBrokers] = useState([]);
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<any>(null);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const { data: responseData, isLoading, error, refetch } = useGetBrokerData();

  console.log("responseeeee", responseData)
  const deleteBrokerMutation = useDeleteBroker();
  const { mutateAsync: updateBrokerStatus, isPending: isUpdating } = useUpdateBrokerStatus();
  const navigate = useNavigate();

  // Process data when it changes
  useEffect(() => {
    if (responseData) {
      try {
        let brokerList = [];

        if (responseData?.data?.data) {
          brokerList = responseData.data.data;
        } else if (responseData?.data) {
          brokerList = responseData.data;
        } else if (Array.isArray(responseData)) {
          brokerList = responseData;
        }

        const normalizedData = (
          Array.isArray(brokerList) ? brokerList : []
        ).map((broker) => ({
          ...broker,
          isActive: broker.isActive === true || broker.user?.isActive === true,
        }));

        setBrokers(normalizedData);
      } catch (err) {
        console.error('Error processing data:', err);
        setBrokers([]);
      }
    }
  }, [responseData]);

  const totalBrokers = brokers?.length;
  const activeBrokers = brokers?.filter((broker) => broker?.isActive === true).length;
  const totalCommission = brokers?.reduce((acc, broker) => acc + (Number(broker?.totalCommission) || 0), 0);
  const paidCommission = brokers?.reduce((acc, broker) => acc + (Number(broker?.totalPaidCommission) || 0), 0);
  const pendingCommission = brokers?.reduce((acc, broker) => acc + (Number(broker?.totalCommission) - Number(broker?.totalPaidCommission) || 0), 0);

  // Refetch when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const handleView = (broker) => {
    navigate({ to: `/companybroker/BrokerProfile/${broker?.id}` });
  };

  const handleEdit = (broker) => {
    navigate({ to: `/companybroker/updatebroker/${broker?.id}` });
  };

  const handleDelete = async (broker) => {
    if (
      window.confirm(`Are you sure you want to delete ${broker?.fullname}?`)
    ) {
      try {
        await deleteBrokerMutation.mutateAsync(broker.id);
        refetch();
        toast.success('Broker deleted successfully!');
      } catch (error) {
        console.error('Error deleting broker:', error);
        toast.error('Failed to delete broker');
      }
    }
  };

  const handleStatusToggle = (broker, e) => {
    e.stopPropagation();
    setSelectedBroker(broker);
    setShowPinModal(true);
    setPin('');
    setShowPin(false);
  };

  const handleConfirmStatusChange = async () => {
    if (!pin) {
      toast.error('Please enter PIN');
      return;
    }

    if (pin.length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }

    const newStatus = !selectedBroker?.isActive;

    try {
      // Update local state
      setBrokers((prevBrokers) =>
        prevBrokers.map((broker) =>
          broker.id === selectedBroker.id
            ? { ...broker, isActive: newStatus }
            : broker,
        ),
      );

      // Close modal
      setShowPinModal(false);
      setPin('');
      setSelectedBroker(null);

      // Call API to update status
      await updateBrokerStatus({
        id: selectedBroker.id,
        pin: pin,
        isActive: newStatus,
      });

      toast.success(
        `Broker ${newStatus ? 'activated' : 'deactivated'} successfully!`,
      );

      // Refresh in background
      setTimeout(() => {
        refetch();
      }, 3000);
    } catch (error: any) {
      // Revert on error
      setBrokers((prevBrokers) =>
        prevBrokers.map((broker) =>
          broker.id === selectedBroker.id
            ? { ...broker, isActive: !newStatus }
            : broker,
        ),
      );

      toast.error(
        error?.response?.data?.message ||
        'Failed to update status. Invalid PIN?',
      );
    }
  };

  const handleRowClick = (broker) => {
    navigate({ to: `/companybroker/BrokerProfile/${broker?.id}` });
  };

  const columns = [
    {
      header: 'Broker Name',
      accessor: 'fullname',
      sortable: true,
      render: (row) => (
        <span className="text-gray-900 font-medium">
          {row.fullname || row.user?.fullname || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Phone Number',
      accessor: 'phoneNumber',
      render: (row) => (
        <span>{row.phoneNumber || row.user?.phoneNumber || 'N/A'}</span>
      ),
    },
    {
      header: 'BKId',
      accessor: 'BKId',
      render: (row) => (
        <span className="font-mono text-sm">{row.BKId || 'N/A'}</span>
      ),
    },
    {
      header: 'Commission',
      accessor: 'brokeragePercent',
      render: (row) => (
        <span className="rounded border border-orange-100 bg-orange-50 px-2 py-1 text-xs font-bold text-orange-600">
          {row.brokeragePercent ? `${row.brokeragePercent}%` : '0%'}
        </span>
      ),
    },
    {
      header: 'Total Commission',
      accessor: 'area',
      render: (row) => <span>{row?.totalCommission > 0 ? Number(row.totalCommission).toFixed(2) : '0'}</span>,
    },

    {
      header: 'Pending Commission',
      accessor: 'totalPendingCommission',
      render: (row) => <span>{Number(row.totalCommission) - Number(row.totalPaidCommission) > 0 ? (Number(row.totalCommission) - Number(row.totalPaidCommission)).toFixed(2) : '0'}</span>,
    },

    {
      header: 'Action',
      accessor: 'id',
      render: (row) => (
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={row.isActive || false}
              onChange={(e) => handleStatusToggle(row, e)}
              disabled={isUpdating}
            />
            <div className="relative h-5 w-9 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-4 peer-disabled:opacity-50" />
          </label>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-lg font-semibold">Loading...</div>
          <div className="text-gray-500 text-sm">
            Please wait while we fetch broker data
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-lg font-semibold text-red-600">
            Error Loading Data
          </div>
          <div className="text-gray-500 text-sm">
            Failed to fetch broker data. Please try again.
          </div>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const selectedBrokerDetails = brokers.find(
    (b) => b.id === selectedBroker?.id,
  );
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  return (
    <>

      {!isLoading && (
        <motion.div
          variants={itemVariants}
          className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <StatCard
            title="Total Brokers"
            value={totalBrokers}
            icon={Users}
            iconColor="text-blue-500"
            bgColor="bg-blue-50"
          />
          <StatCard
            title="Active Brokers"
            value={activeBrokers}
            icon={UserCheck}
            iconColor="text-emerald-500"
            bgColor="bg-emerald-50"
          />
          <StatCard
            title="Total Commission"
            value={formatCurrency(totalCommission)}
            icon={DollarSign}
            iconColor="text-purple-500"
            bgColor="bg-purple-50"
          />
          <StatCard
            title="Paid Commission"
            value={
              formatCurrency(
                Number.isInteger(paidCommission)
                  ? paidCommission
                  : Number(paidCommission)
              )
            }
            icon={CheckCircle}
            iconColor="text-green-500"
            bgColor="bg-green-50"
          />
          <StatCard
            title="Pending Commission"
            value={
              formatCurrency(
                Number.isInteger(pendingCommission)
                  ? pendingCommission
                  : Number(pendingCommission.toFixed(2))
              )
            }
            icon={Clock}
            iconColor="text-orange-500"
            bgColor="bg-orange-50"
          />
        </motion.div>
      )}

      <div className="p-4">
        <GenericTable
          columns={columns}
          data={brokers || []}
          onRowClick={handleRowClick}
          clickable={true}
          rowsPerPage={10}
        />
      </div>

      {/* PIN Modal */}
      {showPinModal && selectedBrokerDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              {selectedBrokerDetails?.isActive ? 'Deactivate' : 'Activate'}{' '}
              Broker
            </h2>
            <p className="mb-4 text-sm text-slate-600">
              {selectedBrokerDetails?.isActive
                ? `Are you sure you want to deactivate ${selectedBrokerDetails?.fullname || selectedBrokerDetails?.user?.fullname}?`
                : `Are you sure you want to activate ${selectedBrokerDetails?.fullname || selectedBrokerDetails?.user?.fullname}?`}
            </p>
            <p className="mb-2 text-sm font-medium text-slate-700">
              Enter Security PIN to confirm:
            </p>

            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                placeholder="Enter Security PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="border-gray-300 w-full rounded-lg border px-4 py-2 pr-10 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmStatusChange();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPin('');
                  setSelectedBroker(null);
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusChange}
                disabled={isUpdating}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${selectedBrokerDetails?.isActive
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-emerald-500 hover:bg-emerald-600'
                  } disabled:opacity-50`}
              >
                {isUpdating ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DisplayBroker;