/* eslint-disable */
import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import toast from 'react-hot-toast';

export const useGetProfile = () => {
  return useQuery({
    queryKey: ['get-data'],
    queryFn: getProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => updateProfile(data),
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({queryKey: ['get-data']});
      window.history.back();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      // Invalidate any related queries if needed
      queryClient.invalidateQueries({
        queryKey: ['user-profile'],
      });
    },
  });
};

export const useChangePin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changePin,
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      // Invalidate any related queries if needed
      queryClient.invalidateQueries({
        queryKey: ['user-profile'],
      });
    },
  });
};

export const getProfile = async () => {
  try {
    if (localStorage.getItem('token')) {
      const res = await api.get('/customer/profile');
      return res.data;
    }
  } catch (error: any) {
    toast.error(error?.response?.data?.message || 'Failed to get profile');
    throw error;
  }
};

export const updateProfile = async (data: FormData) => {
  try {
    const res = await api.put('/customer/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  try {
    const response = await api.post(`/users/change-password`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to change password',
      );
    }
    throw error;
  }
};

export const changePin = async (data: {currentPin: string; newPin: string}) => {
  try {
    const response = await api.post(`/users/change-pin`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message || 'Failed to change password',
      );
    }
    throw error;
  }
};
