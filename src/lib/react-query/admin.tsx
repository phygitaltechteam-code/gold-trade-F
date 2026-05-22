import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getProfile,
  profilePayload,
  resetPassword,
  resetPasswordPayload,
  updateProfile,
} from '../api/adminApi';

export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({data}: {data: resetPasswordPayload}) => resetPassword(data),
    onSuccess: () => {
      toast.success('Password reset successfully!');
      queryClient.invalidateQueries({queryKey: ['password_reset']});
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
