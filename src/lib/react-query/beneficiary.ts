/*eslint-disable*/

import {useQueryClient, useMutation, useQuery} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  addBenefishiary,
  getBeneficiaryById,
  getBenefishiary,
  getWalletByCustomer,
  payment,
  TransactionPayload,
  updateBeneficiary,
} from '../beneficiary/beneficiary';
import {BeneficiaryFormData} from '@/features/Payments/types';
import axios from 'axios';

export const useAddBeneficiary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BeneficiaryFormData) => addBenefishiary(data),
    onSuccess: () => {
      toast.success(' Beneficiary added successfully');
      queryClient.invalidateQueries({queryKey: ['beneficiary']});
    },
    onError: (error) => {
      toast.error('Failed to add  Beneficiary: ' + error.message);
    },
  });
};

// UPDATE BENEFICIARY MUTATION
export const useUpdateBeneficiary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: BeneficiaryFormData}) =>
      updateBeneficiary(id, data),

    onSuccess: () => {
      toast.success('Beneficiary updated successfully');

      // refresh beneficiary list + single beneficiary cache
      queryClient.invalidateQueries({queryKey: ['beneficiary']});
    },

    onError: (error: any) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Update failed'
        : 'Update failed';

      toast.error(message);
    },
  });
};

export const useGetBeneficiary = () =>
  useQuery({
    queryKey: ['beneficiary'],
    queryFn: () => getBenefishiary(),
  });

export const useGetWalletByCustomer = () =>
  useQuery({
    queryKey: ['wallet'],
    queryFn: () => getWalletByCustomer(),
  });

// Add this to your existing beneficiary query hooks
export const useGetBeneficiaryById = (id: string) => {
  return useQuery({
    queryKey: ['beneficiary', id],
    queryFn: () => getBeneficiaryById(id),
    enabled: !!id, // Only run query if id exists
  });
};

export const usePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payment,
    onSuccess: () => {
      toast.success('Payment successfully');
      queryClient.invalidateQueries({queryKey: ['payment']});
    },
    onError: (error: any) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || 'Payment failed'
        : 'Payment failed';

      toast.error(message);
    },
  });
};
