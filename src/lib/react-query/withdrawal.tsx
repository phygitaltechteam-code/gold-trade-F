import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  approveWithdrawal,
  getWithdrawal,
  rejectWithdrawal,
} from '../api/withdrawal';
import toast from 'react-hot-toast';

export const useGetWithdrawal = () =>
  useQuery({
    queryKey: ['withdrawal'],
    queryFn: () => getWithdrawal(),
  });

export const useApproveWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveWithdrawal(id),

    onSuccess: () => {
      toast.success('Approves Succesfully!');
      queryClient.invalidateQueries({queryKey: ['withdrawal']});
    },
    onError: () => {
      toast.error('Failed To Approve!');
    },
  });
};

export const useRejectWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rejectWithdrawal(id),

    onSuccess: () => {
      toast.success('Rejected Succesfully!');
      queryClient.invalidateQueries({queryKey: ['withdrawal']});
    },
    onError: () => {
      toast.error('Failed To Reject!');
    },
  });
};
