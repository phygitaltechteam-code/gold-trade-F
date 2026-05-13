import React, { useState, useEffect } from 'react';
import CustomBrokerTable from './CustomBrokerTable';
import toast from 'react-hot-toast';
import { useGetBrokerData, useDeleteBroker } from '@/lib/api/addbroker';
import { FiX } from 'react-icons/fi';
import { useNavigate } from '@tanstack/react-router';

const DisplayBroker = ({ refreshTrigger }) => {
  const [brokers, setBrokers] = useState([]);
  
  const { data: responseData, isLoading, error, refetch } = useGetBrokerData();
  const deleteBrokerMutation = useDeleteBroker();
  const navigate = useNavigate();

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
    navigate({ to: '/companybroker/BrokerProfile' });
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
    </div>
  );
};

export default DisplayBroker;