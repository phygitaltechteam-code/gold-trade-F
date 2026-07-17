import React, {useState, useEffect} from 'react';
import {useNavigate} from '@tanstack/react-router';
import toast from 'react-hot-toast';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {useGetBrokerDataApi, useDeleteBrokerApi} from './brokerapi';
import {useAuthContext} from '@/context/AuthContext';

const DisplayBroker = ({refreshTrigger, onBrokerAdded}) => {
  const [brokers, setBrokers] = useState([]);
  const navigate = useNavigate();
  const {user} = useAuthContext();
  const {data: responseData, refetch} = useGetBrokerDataApi();
  const deleteBrokerMutation = useDeleteBrokerApi();

  const isSuperBroker =
    user?.role === 'SUPERBROKER' || user?.role === 'SUPER_BROKER';

  console.log('Broker response:', responseData);

  useEffect(() => {
    if (responseData?.data) {
      setBrokers(responseData.data);
    }
  }, [responseData?.data]);

  useEffect(() => {
    if (refreshTrigger) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  // Handle row click - navigate to broker profile
  const handleRowClick = (broker: any) => {
    navigate({to: `/broker/brokerprofile/${broker?.id}`});
  };

  const handleView = (broker: any) => {
    navigate({to: `/broker/brokerprofile/${broker?.id}`});
  };

  const handleEdit = (broker: any) => {
    navigate({to: `/broker/updatebroker/${broker?.id}`});
  };

  const handleDelete = async (broker: any) => {
    if (
      window.confirm(`Are you sure you want to delete ${broker?.fullname}?`)
    ) {
      try {
        await deleteBrokerMutation.mutateAsync(broker.id);
        refetch();
        toast.success('Broker deleted successfully!');
        if (onBrokerAdded) onBrokerAdded();
      } catch (error) {
        console.error('Error deleting broker:', error);
        toast.error('Failed to delete broker');
      }
    }
  };

  const columns = [
    {
      header: 'Broker Name',
      accessor: 'fullname',
      sortable: true,
      render: (row) => (
        <span className="text-gray-900 font-medium">{row.fullname}</span>
      ),
    },
    {
      header: 'Phone Number',
      accessor: 'phoneNumber',
    },
    {
      header: 'Area',
      accessor: 'area',
    },
    {
      header: 'Commission',
      accessor: (row) => `${row.commission || row.brokeragePercent || 0}%`,
    },
    {
      header: 'Aadhar Number',
      accessor: 'aadharCardNumber',
    },
{
  header: 'Status',
  accessor: (row) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
        row.isActive || row.IsOn
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${
        row.isActive || row.IsOn ? 'bg-green-500' : 'bg-red-500'
      }`}></span>
      {row.isActive || row.IsOn ? 'Active' : 'Inactive'}
    </span>
  ),
},


    {
      header: 'Created At',
      accessor: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString('en-IN')
          : '-',
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-gray-700 text-xl font-semibold">
          {isSuperBroker ? 'Broker List' : 'My Brokers'}
        </h2>
        <button
          onClick={() => navigate({to: '/broker/broker'})}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-white transition-all hover:from-orange-600 hover:to-red-600"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Broker
        </button>
      </div>

      <GenericTable
        columns={columns}
        data={brokers || []}
        onRowClick={handleRowClick}
        // onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        clickable={true}
        // viewTooltip="View Broker"
        editTooltip="Edit Broker"
        deleteTooltip="Delete Broker"
      />
    </div>
  );
};

export default DisplayBroker;
