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

export const useGetBeneficiaryById = (id: string) =>
  useQuery({
    queryKey: ['beneficiary', id],
    queryFn: () => getBeneficiaryById(id),
  });

export const usePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionPayload) => payment(data),
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
