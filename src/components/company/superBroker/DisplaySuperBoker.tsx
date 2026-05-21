import React, {useState, useEffect} from 'react';
import toast from 'react-hot-toast';
import {useDeleteBroker} from '@/lib/api/addbroker';
import {useNavigate} from '@tanstack/react-router';
import {useGetAllSuperBrocker} from '@/lib/react-query/superbrocker';
import GenericTable from '@/components/Forms/Table/GenericTable';

const DisplaySuperBroker = ({refreshTrigger}) => {
  const [brokers, setBrokers] = useState([]);
  const navigate = useNavigate();
  const {data: responseData, refetch} = useGetAllSuperBrocker();
  console.log('respoeeee', responseData);
  const deleteBrokerMutation = useDeleteBroker();
  useEffect(() => {
    setBrokers(responseData?.data);
  }, [responseData?.data]);

  useEffect(() => {
    if (refreshTrigger) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const handleView = (broker) => {
    navigate({to: `/companybroker/SuperbrockerProfile/${broker?.id}`});
  };

  const handleEdit = (broker) => {
    toast.success(`Edit ${broker?.fullname || 'Broker'}`);
    console.log('Edit broker:', broker);
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
  const columns = [
    {
      header: 'Work Name',
      accessor: 'fullname',
      sortable: true,
      render: (row) => (
        <span
          onClick={() => {
            navigate({to: `/companybroker/SuperbrockerProfile/${row.id}`});
          }}
          className="cursor-pointer text-[#0284C7] hover:underline"
        >
          {row.fullname}
        </span>
      ),
    },
    {header: 'PhoneNumber', accessor: 'phoneNumber'},
    {header: 'BKId', accessor: 'BKId'},

    {header: 'Commission', accessor: 'commission'},
    {header: 'Total Brokers', accessor: 'totalBrokers'},
    {header: 'Total Business', accessor: 'totalBusiness'},
    {header: 'Total Commission', accessor: 'totalCommission'},
    {header: 'Pending Commission', accessor: 'pendingCommission'},
  ];

  return (
    <div className="p-4">
      <GenericTable
        columns={columns}
        data={brokers || []}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default DisplaySuperBroker;
