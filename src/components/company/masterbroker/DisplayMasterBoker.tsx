import React, {useState, useEffect, useRef} from 'react';
import toast from 'react-hot-toast';
import {useDeleteBroker} from '@/lib/api/addbroker';
import {useNavigate} from '@tanstack/react-router';
import {
  useGetAllMasterBrocker,
  useActivateInActiveMasterBrocker,
} from '@/lib/react-query/masterbroker';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {Eye, EyeOff} from 'lucide-react';

const STORAGE_KEY = 'Master_broker_status';

const DisplayMasterBroker = ({refreshTrigger}) => {
  const [brokers, setBrokers] = useState([]);
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<any>(null);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const navigate = useNavigate();
  const {data: responseData, refetch, isLoading} = useGetAllMasterBrocker();
  console.log("responseData",responseData)
  const {mutateAsync: activateInActiveMasterBrocker, isPending} =
    useActivateInActiveMasterBrocker();

  // Load stored statuses from localStorage on component mount
  const loadStoredStatuses = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }
    return {};
  };

  // Store statuses to localStorage
  const storeStatuses = (statuses: Record<string, boolean>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
  };

  useEffect(() => {
    if (!responseData) return;

    let brokerData: any[] = [];

    if (responseData?.data?.data) {
      brokerData = responseData.data.data;
    } else if (responseData?.data) {
      brokerData = responseData.data;
    } else if (Array.isArray(responseData)) {
      brokerData = responseData;
    }

    const storedStatuses = loadStoredStatuses();

    const normalizedData = brokerData?.map((broker) => {
      // Check localStorage first, then API, then default to false
      const storedStatus = storedStatuses[broker.id];
      const finalStatus =
        storedStatus !== undefined ? storedStatus : broker.isActive === true;

      return {
        ...broker,
        isActive: finalStatus,
      };
    });

    setBrokers(normalizedData || []);
  }, [responseData]);

  useEffect(() => {
    if (refreshTrigger) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const handleRowClick = (broker) => {
    navigate({to: `/companybroker/master-brockerProfile/${broker?.id}`});
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
      // Update localStorage immediately
      const storedStatuses = loadStoredStatuses();
      storedStatuses[selectedBroker.id] = newStatus;
      storeStatuses(storedStatuses);

      // Update local state immediately for instant UI feedback
      setBrokers((prevBrokers) =>
        prevBrokers.map((broker) =>
          broker.id === selectedBroker.id
            ? {...broker, isActive: newStatus}
            : broker,
        ),
      );

      // Close modal
      setShowPinModal(false);
      setPin('');
      setSelectedBroker(null);

      // Call API
      const result = await activateInActiveMasterBrocker({
        id: selectedBroker.id,
        pin: pin,
      });

      toast.success(
        `Master Broker ${newStatus ? 'activated' : 'deactivated'} successfully!`,
      );

      // Refresh in background to sync with backend
      setTimeout(() => {
        refetch();
      }, 3000);
    } catch (error: any) {
      // If API fails, revert the status
      const oldStatus = !newStatus;
      const storedStatuses = loadStoredStatuses();
      storedStatuses[selectedBroker.id] = oldStatus;
      storeStatuses(storedStatuses);

      setBrokers((prevBrokers) =>
        prevBrokers.map((broker) =>
          broker.id === selectedBroker.id
            ? {...broker, isActive: oldStatus}
            : broker,
        ),
      );
      toast.error(
        error?.response?.data?.message ||
          'Failed to update status. Invalid PIN?',
      );
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'fullname',
      sortable: true,
      render: (row) => (
        <span className="font-medium">
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
      header: 'Customer Limit',
      accessor: 'customerLimit',
      render: (row) => (
        <span className="font-mono text-sm">{row.customerLimit }</span>
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
    // {
    //   header: 'Total Brokers',
    //   accessor: 'totalBrokers',
    //   render: (row) => (
    //     <span>{row.totalBrokers || row._count?.brokers || 0}</span>
    //   ),
    // },
    // {
    //   header: 'Total Business',
    //   accessor: 'totalBusiness',
    //   render: (row) => (
    //     <span>₹{(row.totalBusiness || 0).toLocaleString()}</span>
    //   ),
    // },
    // {
    //   header: 'Total Commission',
    //   accessor: 'totalCommission',
    //   render: (row) => (
    //     <span>₹{(row.totalCommission || 0).toLocaleString()}</span>
    //   ),
    // },
    // {
    //   header: 'Pending Commission',
    //   accessor: 'pendingCommission',
    //   render: (row) => (
    //     <span>₹{(row.pendingCommission || 0).toLocaleString()}</span>
    //   ),
    // },
    {
      header:'Active Trader',
      accessor:'activeCustomerCount'

    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row) => {
        const isActive = row.isActive === true;
        return (
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={isActive}
                onChange={(e) => handleStatusToggle(row, e)}
                disabled={isPending}
              />
              <div className="relative h-5 w-9 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-4 peer-disabled:opacity-50" />
              {/* <span className="ml-2 w-12 text-left text-[10px] font-bold uppercase text-slate-500">
                {isActive ? 'Active' : 'Inactive'}
              </span> */}
            </label>
          </div>
        );
      },
    },
  ];

  // Get the selected broker for PIN modal
  const selectedBrokerDetails = brokers.find(
    (b) => b.id === selectedBroker?.id,
  );

  return (
    <>
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
              Master Broker
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
                disabled={isPending}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                  selectedBrokerDetails?.isActive
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                } disabled:opacity-50`}
              >
                {isPending ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DisplayMasterBroker;
