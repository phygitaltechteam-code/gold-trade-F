/* eslint-disable  */
import {api} from '@/utils/axios';
import {useQuery} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useGetWalletAmount = () => {
  return useQuery({
    queryKey: ['walletAmount'],
    queryFn: async () => {
      try {
        const response = await api.get('/customer/wallet/wallet');
        return response.data;
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || 'Failed to get wallet amount';
        toast.error(errorMessage);
        throw error;
      }
    },
    retry: 1,
  });
};
