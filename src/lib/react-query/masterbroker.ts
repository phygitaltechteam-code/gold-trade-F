import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

import {api} from '@/utils/axios';
import { addMasterBrocker, getAllMasterBrocker, getAllMasterBrockerById, MasterBrocker } from '../api/masterbrokerapi';

export const useAddMasterBrocker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({data}: {data: MasterBrocker}) => addMasterBrocker(data),

    onSuccess: () => {
      toast.success('Master brocker Accepted!');
      queryClient.invalidateQueries({queryKey: ['Master_brocker']});
    },
    onError: () => {
      toast.error('Failed To add Master brocker!');
    },
  });
};

export const useGetAllMasterBrocker = () =>
  useQuery({
    queryKey: ['Master_brocker'],
    queryFn: () => getAllMasterBrocker(),
  });

export const useGetAllMasterBrockerById = (id: string) =>
  useQuery({
    queryKey: ['Master_brocker', id],
    queryFn: () => getAllMasterBrockerById(id),
  });

export const activeMasterBrocker = async (id: string, pin: string) => {
  try {
    const response = await api.put(`company/Master-broker/active/${id}`, {
      securityPin: pin,
    });
    return response;
  } catch (error) {
    console.error('Error updating Master broker status:', error);
    throw error;
  }
};

export const useActivateInActiveMasterBrocker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, pin}: {id: string; pin: string}) =>
      activeMasterBrocker(id, pin),

    onSuccess: (data, variables) => {
      // Invalidate both query keys to ensure data refresh
      queryClient.invalidateQueries({queryKey: ['get-Masterbroker']});
      queryClient.invalidateQueries({queryKey: ['Master_brocker']});
      queryClient.invalidateQueries({queryKey: ['get-Masterbroker-data']});

      // No need to show toast here as we show it in the component
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.message || 'Failed to change status';
      toast.error(errorMessage);
    },
  });
};

export const useUpdateMasterBrokerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: any}) =>
      api.put(`/company/Master-broker/${id}`, data),

    onSuccess: () => {
      toast.success('Master broker profile updated successfully!');
      queryClient.invalidateQueries({queryKey: ['Master_brocker']});
      queryClient.invalidateQueries({queryKey: ['get-Masterbroker']});
      queryClient.invalidateQueries({queryKey: ['get-Masterbroker-data']});
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.message || 'Failed to update Master broker profile';
      toast.error(errorMessage);
    },
  });
};

export const useAddCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: any}) =>
      api.put(`/company/Master-broker/${id}/pay`, data),

    onSuccess: () => {
      toast.success('Commission added successfully!');
      queryClient.invalidateQueries({queryKey: ['Master_brocker']});
      queryClient.invalidateQueries({queryKey: ['get-Masterbroker']});
      queryClient.invalidateQueries({queryKey: ['get-Masterbroker-data']});
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.message || 'Failed to add commission';
      toast.error(errorMessage);
    },
  });
};

export const useGetMasterbrokerProfile = () =>
  useQuery({
    queryKey: ['Master_brocker_profile'],
    queryFn: () => getMasterbrokerProfile(),
  });

export const getMasterbrokerProfile = async () => {
  const response = await api.get('/Master-broker/profile');
  return response.data;
};

export type MasterBrokerProfilePayload = {
  fullname: string;
  photo: File;
};
export const useEditMasterBrokerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({data}: {data: MasterBrokerProfilePayload}) =>
      updateMasterBrokerProfile(data),
    onSuccess: () => {
      toast.success('Profile edited successfully!');
      queryClient.invalidateQueries({queryKey: ['profile']});
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const updateMasterBrokerProfile = async (
  data: MasterBrokerProfilePayload,
) => {
  try {
    const formData = new FormData();

    formData.append('fullname', data.fullname);

    if (data.photo) {
      formData.append('photo', data.photo);
    }

    const response = await api.put(`/Master-broker/profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error while edit profile:', error);
    throw error;
  }
};
