// lib/api/addbroker.ts
import {api} from '@/utils/axios';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useMutation} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useAddBroker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBroker,
    onSuccess: () => {
      toast.success('Broker Registered Successfully!');
      queryClient.invalidateQueries({queryKey: ['get-broker']});
    },
    onError: (error: any) => {
      console.log('errors', error);

      if (error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        validationErrors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        const backendMessage =
          error?.response?.data?.message || 'Failed to register broker';
        toast.error(backendMessage);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['broker']});
    },
  });
};

export const useDeleteBroker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBroker,
    onSuccess: () => {
      toast.success('Broker Deleted Successfully!');
      queryClient.invalidateQueries({queryKey: ['get-broker']});
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      const backendMessage =
        error?.response?.data?.message || 'Failed to delete broker';
      toast.error(backendMessage);
    },
  });
};

export const useGetBrokerData = () =>
  useQuery({
    queryKey: ['alll-brockersss'],
    queryFn: () => getBrokerData(),
  
  });

  
export const useGetScriptsData = () =>
  useQuery({
    queryKey: ['scripts'],
    queryFn: getScriptsData,
  });
export const useGetSuperBrokerData = () =>
  useQuery({
    queryKey: ['get-superbroker'],
    queryFn: () => getSuperBrokerData(),
    staleTime: 5 * 60 * 1000,
  });

export const useUpdateScriptStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => updateScriptStatus(id),
    onSuccess: () => {
      toast.success('Status Updated Successfully!');
      queryClient.invalidateQueries({queryKey: ['scripts']});
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      const backendMessage =
        error?.response?.data?.message || 'Failed to update Status';
      toast.error(backendMessage);
    },
  });
};

export const addBroker = async (data: FormData) => {
  try {
    console.log('Sending FormData to API');
    const response = await api.post(`/company/broker`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error saving broker profile:', error);
    throw error;
  }
};

export const deleteBroker = async (id: string) => {
  try {
    const response = await api.delete(`/company/broker/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting broker:', error);
    throw error;
  }
};

const getBrokerData = async () => {
  try {
    const response = await api.get(`/company/broker`);
    return JSON.parse(JSON.stringify(response.data));
  } catch (error) {
    console.error('Error fetching broker data:', error);
    throw error;
  }
};
const getScriptsData = async () => {
  try {
    const response = await api.get(`/company/profile/assets`);
    console.log('API response for scripts:', response);
    return response;
  } catch (error) {
    console.error('Error fetching scripts data:', error);
    throw error;
  }
};

const updateScriptStatus = async (id: string) => {
  try {
    const response = await api.patch(`/company/profile/assets/${id}`);
    console.log('API response for scripts:', response);
    return response;
  } catch (error) {
    console.error('Error to status change:', error);
    throw error;
  }
};
const getSuperBrokerData = async () => {
  try {
    const response = await api.get(`/company/super-broker`);
    return JSON.parse(JSON.stringify(response.data));
  } catch (error) {
    console.error('Error fetching super broker data:', error);
    throw error;
  }
};

// FIXED: Updated approveBroker to include superBrokerId
export const approveBroker = async ({
  id,
  superBrokerId,
}: {
  id: string;
  superBrokerId: string;
}) => {
  try {
    const response = await api.put(`/company/broker/${id}/verify`, {
      superBrokerId: superBrokerId,
    });
    return response.data;
  } catch (error) {
    console.error('Error approving broker:', error);
    throw error;
  }
};

export const updateBroker = async ({id, data}: {id: string; data: any}) => {
  try {
    const response = await api.put(`/company/broker/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating broker:', error);
    throw error;
  }
};

// FIXED: Updated useApproveBroker to accept superBrokerId
export const useApproveBroker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveBroker,
    onSuccess: () => {
      toast.success('Broker Approved Successfully!');
      queryClient.invalidateQueries({queryKey: ['get-broker']});
    },
    onError: (error: any) => {
      const backendMessage =
        error?.response?.data?.message || 'Failed to approve broker';
      toast.error(backendMessage);
    },
  });
};

export const useUpdateBroker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBroker,
    onSuccess: () => {
      toast.success('Broker Updated Successfully!');
      queryClient.invalidateQueries({queryKey: ['get-broker']});
    },
    onError: (error: any) => {
      const backendMessage =
        error?.response?.data?.message || 'Failed to update broker';
      toast.error(backendMessage);
    },
  });
};

export const useGetAllAdminBrockerById = (id: string) =>
  useQuery({
    queryKey: ['brocker', id],
    queryFn: () => getAllAdminBrockerById(id),
  });

export const getAllAdminBrockerById = async (id: string) => {
  try {
    const response = await api.get(`/company/broker/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching brockers:', error);
    throw error;
  }
};

export const useUpdateAdminBrokerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: any}) =>
      api.put(`/company/broker/${id}`, data),

    onSuccess: () => {
      toast.success('Broker profile updated successfully!');
      queryClient.invalidateQueries({queryKey: ['brocker']});
      queryClient.invalidateQueries({queryKey: ['get-broker']});
      queryClient.invalidateQueries({queryKey: ['get-broker-data']});
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.message || 'Failed to update  broker profile';
      toast.error(errorMessage);
    },
  });
};

export const useAddAdminBrokerCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: any}) =>
      api.put(`/company/broker/${id}/pay`, data),

    onSuccess: () => {
      toast.success('Commission added successfully!');
      queryClient.invalidateQueries({queryKey: ['brocker']});
      queryClient.invalidateQueries({queryKey: ['get-broker']});
      queryClient.invalidateQueries({queryKey: ['get-broker-data']});
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.message || 'Failed to add commission';
      toast.error(errorMessage);
    },
  });
};

export const useUpdateBrokerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      pin,
      isActive,
    }: {
      id: string;
      pin: string;
      isActive: boolean;
    }) => {
      return api.put(`/company/broker/${id}/status`, {
        pin: pin,
        isActive: isActive,
      });
    },
    onSuccess: () => {
      toast.success('Broker Status Updated Successfully!');
      queryClient.invalidateQueries({queryKey: ['get-broker']});
    },
    onError: (error: any) => {
      const backendMessage =
        error?.response?.data?.message || 'Failed to update broker status';
      toast.error(backendMessage);
    },
  });
};


// Get broker ledger data
// Get broker ledger data
export const getBrokerLedger = async (brokerId: string) => {
  try {
    const response = await api.get(`/company/broker/ledger/${brokerId}`);
    // ✅ Return the nested data array
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching broker ledger:', error);
    throw error;
  }
};

// Get broker ledger data - Hook
export const useGetBrokerLedger = (brokerId: string) =>
  useQuery({
    queryKey: ['broker-ledger', brokerId],
    queryFn: () => getBrokerLedger(brokerId),
    enabled: !!brokerId, // Only runs when brokerId exists
  });


// Get broker payment history
// Get broker payment history
export const getBrokerPaymentHistory = async (brokerId: string) => {
  try {
    const response = await api.get(`company/broker/report/${brokerId}`);
    // Fix: The data array is at response.data.data, not response.data.data.data
    return response.data || [];
  } catch (error) {
    console.error('Error fetching broker payment history:', error);
    throw error;
  }
};

// Get broker payment history - Hook
export const useGetBrokerPaymentHistory = (brokerId: string) =>
  useQuery({
    queryKey: ['broker-payment-history', brokerId],
    queryFn: () => getBrokerPaymentHistory(brokerId),
    enabled: !!brokerId,
  });