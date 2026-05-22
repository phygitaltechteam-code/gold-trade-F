import {useMutation, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {resetPassword, resetPasswordPayload} from '../api/adminApi';

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
