import {api} from '@/utils/axios';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useMutation} from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Helper to get token
const getAccessToken = (): string | null => {
  try {
    const tokenStr = localStorage.getItem('token');
    if (!tokenStr) return null;

    try {
      const parsed = JSON.parse(tokenStr);
      return parsed?.accessToken || parsed?.token || null;
    } catch {
      return tokenStr;
    }
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const useBroker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBroker,
    onSuccess: () => {
      toast.success('Broker Registered Successfully!');
      queryClient.invalidateQueries({queryKey: ['get-broker']});
    },
    onError: (error: any) => {
      console.log(
        'Registration error:',
        error?.response?.data?.message || error?.message,
      );
      const backendMessage =
        error?.response?.data?.message || 'Failed to register broker';
      toast.error(backendMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ['broker']});
    },
  });
};

export const addBroker = async (data: FormData) => {
  try {
    const token = getAccessToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await api.post(`/super-broker/broker`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error saving broker:', error);
    throw error;
  }
};

export const useDeleteBrokerApi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBroker,
    onSuccess: () => {
      toast.success('Broker Deleted Successfully!');
      queryClient.invalidateQueries({queryKey: ['get-broker']});
    },
    onError: (error: any) => {
      console.error('Delete error:', error?.response?.data?.message);
      const backendMessage =
        error?.response?.data?.message || 'Failed to delete broker';
      toast.error(backendMessage);
    },
  });
};

export const useGetBrokerDataApi = () =>
  useQuery({
    queryKey: ['get-broker'],
    queryFn: () => getBrokerData(),
  });

export const useGetSuperBrokerDataApi = () =>
  useQuery({
    queryKey: ['get-superbroker'],
    queryFn: () => getSuperBrokerData(),
  });

export const deleteBroker = async (id: string) => {
  try {
    const token = getAccessToken();
    const response = await api.delete(`/super-broker/broker/${id}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting broker:', error);
    throw error;
  }
};

const getBrokerData = async () => {
  try {
    const token = getAccessToken();

    const response = await api.get(`/super-broker/broker`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    // Log only serializable info
    console.log('Broker API response status:', response.status);

    return response.data;
  } catch (error: any) {
    console.error('Error fetching broker data:', error?.response?.status);
    throw error;
  }
};

const getSuperBrokerData = async () => {
  try {
    const token = getAccessToken();
    const response = await api.get(`/super-broker/broker`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching super broker data:', error);
    throw error;
  }
};

export const updateBroker = async ({id, data}: {id: string; data: any}) => {
  try {
    const token = getAccessToken();
    const response = await api.put(`/super-broker/broker/${id}`, data, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating broker:', error);
    throw error;
  }
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

export const useGetAllBrockerById = (id: string) =>
  useQuery({
    queryKey: ['super_brocker', id],
    queryFn: () => getAllBrockerById(id),
  });

export const getAllBrockerById = async (id: string) => {
  try {
    const response = await api.get(`/super-broker/broker/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching brockers:', error);
    throw error;
  }
};

export const useGetBrokersDataApi = () => {
  return useQuery({
    queryKey: ['get-broker'],
    queryFn: getSuperBrokerDataApi,
  });
};

export const getSuperBrokerDataApi = async () => {
  try {
    const token = getAccessToken();
    const response = await api.get(`/super-broker/broker`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching super broker data:', error?.response?.status);
    throw error;
  }
};

export const useUpdateBrokerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: any}) =>
      api.put(`/super-broker/broker/${id}`, data),

    onSuccess: () => {
      toast.success('Super broker profile updated successfully!');
      queryClient.invalidateQueries({queryKey: ['super_brocker']});
      queryClient.invalidateQueries({queryKey: ['get-superbroker']});
      queryClient.invalidateQueries({queryKey: ['get-superbroker-data']});
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.message || 'Failed to update super broker profile';
      toast.error(errorMessage);
    },
  });
};


export const useAddBrokerCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: any}) =>
      api.post(`/super-broker/broker/${id}/commission`, data),

    onSuccess: () => {
      toast.success('Commission added successfully!');
      queryClient.invalidateQueries({queryKey: ['super_brocker']});
      queryClient.invalidateQueries({queryKey: ['get-superbroker']});
      queryClient.invalidateQueries({queryKey: ['get-superbroker-data']});
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.message || 'Failed to add commission';
      toast.error(errorMessage);
    },
  });
};