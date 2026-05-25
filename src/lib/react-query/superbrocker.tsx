import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  addSuperBrocker,
  getAllSuperBrocker,
  getAllSuperBrockerById,
  SuperBrocker,
} from '../api/superbrocker';
import {api} from '@/utils/axios';

export const useAddSuperBrocker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({data}: {data: SuperBrocker}) => addSuperBrocker(data),

    onSuccess: () => {
      toast.success('Super brocker Accepted!');
      queryClient.invalidateQueries({queryKey: ['super_brocker']});
    },
    onError: () => {
      toast.error('Failed To add super brocker!');
    },
  });
};

export const useGetAllSuperBrocker = () =>
  useQuery({
    queryKey: ['super_brocker'],
    queryFn: () => getAllSuperBrocker(),
  });

export const useGetAllSuperBrockerById = (id: string) =>
  useQuery({
    queryKey: ['super_brocker', id],
    queryFn: () => getAllSuperBrockerById(id),
  });

export const activeSuperBrocker = async (id: string, pin: string) => {
  try {
    const response = await api.put(`company/super-broker/active/${id}`, {
      securityPin: pin,
    });
    return response;
  } catch (error) {
    console.error('Error updating super broker status:', error);
    throw error;
  }
};

export const useActivateInActiveSuperBrocker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, pin}: {id: string; pin: string}) =>
      activeSuperBrocker(id, pin),

    onSuccess: (data, variables) => {
      // Invalidate both query keys to ensure data refresh
      queryClient.invalidateQueries({queryKey: ['get-superbroker']});
      queryClient.invalidateQueries({queryKey: ['super_brocker']});
      queryClient.invalidateQueries({queryKey: ['get-superbroker-data']});

      // No need to show toast here as we show it in the component
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.message || 'Failed to change status';
      toast.error(errorMessage);
    },
  });
};


export const useUpdateSuperBrokerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: any}) =>
      api.put(`/company/super-broker/${id}`, data),

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

export const useAddCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: any}) =>
      api.post(`/company/super-broker/${id}/commission`, data),

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
