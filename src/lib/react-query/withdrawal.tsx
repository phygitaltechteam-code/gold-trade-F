import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  approveWithdrawal,
  getdepositcompany,
  getdepositmasterbroker,
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

// export const useRejectWithdrawal = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (id: string) => rejectWithdrawal(id),

//     onSuccess: () => {
//       toast.success('Rejected Succesfully!');
//       queryClient.invalidateQueries({queryKey: ['withdrawal']});
//     },
//     onError: () => {
//       toast.error('Failed To Reject!');
//     },
//   });
// };


export const useRejectWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      reason,
    }: {
      id: string;
      reason: string;
    }) => rejectWithdrawal(id, reason),

    onSuccess: () => {
      toast.success('Rejected Successfully!');
      queryClient.invalidateQueries({ queryKey: ['withdrawal'] });
    },

    onError: () => {
      toast.error('Failed To Reject!');
    },
  });
};


export const useGetDepositeCompany = () =>
  useQuery({
    queryKey: ['deposi-company'],
    queryFn: () => getdepositcompany(),
  });

  export const useGetDepositeMaster = () =>
  useQuery({
    queryKey: ['deposit'],
    queryFn: () => getdepositmasterbroker(),
  });

