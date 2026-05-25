import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getProfile,
  profilePayload,
  resetPassword,
  resetPin,
  updateProfile,
} from '../api/adminApi';

export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully!');
      queryClient.invalidateQueries({queryKey: ['password_reset']});
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
export const useResetPin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetPin,
    onSuccess: () => {
      toast.success('Pin reset successfully!');
      queryClient.invalidateQueries({queryKey: ['pin_reset']});
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
export const useEditProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({data}: {data: profilePayload}) => updateProfile(data),
    onSuccess: () => {
      toast.success('Profile edited successfully!');
      queryClient.invalidateQueries({queryKey: ['profile']});
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useGetProfile = () =>
  useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile(),
  });
