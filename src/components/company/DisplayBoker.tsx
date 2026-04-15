import React, { useState, useEffect } from 'react';
import CustomBrokerTable from './CustomBrokerTable';
import toast from 'react-hot-toast';
import { useGetBrokerData, useDeleteBroker } from '@/lib/api/addbroker';
import { FiX } from 'react-icons/fi';

const DisplayBroker = ({ refreshTrigger }) => {
  const [brokers, setBrokers] = useState([]);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const { data: responseData, isLoading, error, refetch } = useGetBrokerData();
  const deleteBrokerMutation = useDeleteBroker();

  // Process data when it changes
  useEffect(() => {
    if (responseData) {
      try {
        // Safe data extraction without JSON.stringify
        let brokerList = [];
        
        if (responseData?.data?.data) {
          brokerList = responseData.data.data;
        } else if (responseData?.data) {
          brokerList = responseData.data;
        } else if (Array.isArray(responseData)) {
          brokerList = responseData;
        }
        
        setBrokers(Array.isArray(brokerList) ? brokerList : []);
      } catch (err) {
        console.error('Error processing data:', err);
        setBrokers([]);
      }
    }
  }, [responseData]);

  // Refetch when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const handleView = (broker) => {
    setSelectedBroker(broker);
    setShowDetailModal(true);
  };

  const handleEdit = (broker) => {
    toast.success(`Edit ${broker?.fullname || 'Broker'}`);
    console.log('Edit broker:', broker);
  };

  const handleDelete = async (broker) => {
    if (window.confirm(`Are you sure you want to delete ${broker?.fullname}?`)) {
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

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-lg font-semibold">Loading...</div>
          <div className="text-sm text-gray-500">Please wait while we fetch broker data</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-2 text-lg font-semibold text-red-600">Error Loading Data</div>
          <div className="text-sm text-gray-500">Failed to fetch broker data. Please try again.</div>
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

  return (
    <div className="p-4">
      <CustomBrokerTable
        data={brokers}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        refreshTrigger={refreshTrigger}
      />

      {/* Detail Modal */}
      {showDetailModal && selectedBroker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="sticky top-0 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500 p-4">
              <h2 className="text-xl font-bold text-white">Broker Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute right-4 top-4 text-white hover:text-gray-200"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">BK ID</label>
                  <p className="text-gray-900">{selectedBroker?.BKId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900">{selectedBroker?.fullname || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Username</label>
                  <p className="text-gray-900">{selectedBroker?.username || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{selectedBroker?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-gray-900">{selectedBroker?.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Aadhar Number</label>
                  <p className="text-gray-900">{selectedBroker?.aadharCardNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">KYC Status</label>
                  <p className="text-gray-900">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      selectedBroker?.isKycCompleted
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedBroker?.isKycCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-gray-900">
                    {selectedBroker?.createdAt ? new Date(selectedBroker.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              {(selectedBroker?.photo || selectedBroker?.aadharCardF || selectedBroker?.aadharCardB) && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="mb-3 font-semibold">Documents</h3>
                  <div className="flex gap-4">
                    {selectedBroker?.photo && (
                      <div>
                        <p className="text-sm text-gray-500">Photo</p>
                        <img src={selectedBroker.photo} alt="Photo" className="mt-1 h-24 w-24 cursor-pointer rounded-lg object-cover" onClick={() => window.open(selectedBroker.photo, '_blank')} />
                      </div>
                    )}
                    {selectedBroker?.aadharCardF && (
                      <div>
                        <p className="text-sm text-gray-500">Aadhar Front</p>
                        <img src={selectedBroker.aadharCardF} alt="Aadhar Front" className="mt-1 h-24 w-24 cursor-pointer rounded-lg object-cover" onClick={() => window.open(selectedBroker.aadharCardF, '_blank')} />
                      </div>
                    )}
                    {selectedBroker?.aadharCardB && (
                      <div>
                        <p className="text-sm text-gray-500">Aadhar Back</p>
                        <img src={selectedBroker.aadharCardB} alt="Aadhar Back" className="mt-1 h-24 w-24 cursor-pointer rounded-lg object-cover" onClick={() => window.open(selectedBroker.aadharCardB, '_blank')} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayBroker;