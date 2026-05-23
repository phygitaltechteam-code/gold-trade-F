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
    queryKey: ['get-broker'],
    queryFn: () => getBrokerData(),
    staleTime: 5 * 60 * 1000,
  });
export const useGetScriptsData = () =>
  useQuery({
    queryKey: ['get-scripts'],
    queryFn: getScriptsData,
  });
export const useGetSuperBrokerData = () =>
  useQuery({
    queryKey: ['get-superbroker'],
    queryFn: () => getSuperBrokerData(),
    staleTime: 5 * 60 * 1000,
  });

export const addBroker = async (data: FormData) => {
  try {
    console.log('Sending FormData to API');
    const response = await api.post(`/company/customer`, data, {
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
    const response = await api.delete(`/company/customer/${id}`);
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
    const response = await api.get(`/company/commission/scripts`);
    console.log('API response for scripts:', response);
    return response;
  } catch (error) {
    console.error('Error fetching scripts data:', error);
    throw error;
  }
};
const getSuperBrokerData = async () => {
  try {
    const response = await api.get(`/company/broker`);
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
