import React, { useState, useEffect } from 'react';
import CustomBrokerTable from './SuperBrokerTable';
import toast from 'react-hot-toast';
import { useGetBrokerData, useDeleteBroker, useGetSuperBrokerData } from '@/lib/api/addbroker';
import { FiX } from 'react-icons/fi';
import { useNavigate } from '@tanstack/react-router';

const DisplaySuperBroker = ({ refreshTrigger }) => {
  const [brokers, setBrokers] = useState([]);
  const navigate = useNavigate();
  
  const { data: responseData, isLoading, error, refetch } = useGetSuperBrokerData();

  
  const deleteBrokerMutation = useDeleteBroker();

  // Process data when it changes
  useEffect(() => {
    // Generate mock data since there's no API yet
    const mockBrokers = [
      {
        id: '1',
        SBID: 'SB-1001',
        fullname: 'Rajesh Kumar',
        phoneNumber: '9876543210',
        area: 'Mumbai North',
        commission: '2.5',
        totalBrokers: 12,
        totalBusiness: 450000,
        totalCommission: 11250,
        pendingCommission: 1500,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        SBID: 'SB-1002',
        fullname: 'Priya Sharma',
        phoneNumber: '8765432109',
        area: 'Delhi Central',
        commission: '3.0',
        totalBrokers: 8,
        totalBusiness: 320000,
        totalCommission: 9600,
        pendingCommission: 0,
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '3',
        SBID: 'SB-1003',
        fullname: 'Amit Patel',
        phoneNumber: '7654321098',
        area: 'Ahmedabad West',
        commission: '2.0',
        totalBrokers: 5,
        totalBusiness: 150000,
        totalCommission: 3000,
        pendingCommission: 500,
        isActive: false,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: '4',
        SBID: 'SB-1004',
        fullname: 'Neha Gupta',
        phoneNumber: '9012345678',
        area: 'Bangalore South',
        commission: '2.8',
        totalBrokers: 15,
        totalBusiness: 600000,
        totalCommission: 16800,
        pendingCommission: 2500,
        isActive: true,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      }
    ];

    // Always use mock data until API is ready
    
      setBrokers(mockBrokers);
    
  }, [responseData]);

  // Refetch when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const handleView = (broker) => {
    navigate({ to: '/companybroker/superBrokerProfile' });
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

  // Bypassed loading and error states for mock data testing
  /*
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
  */

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

export default DisplaySuperBroker;