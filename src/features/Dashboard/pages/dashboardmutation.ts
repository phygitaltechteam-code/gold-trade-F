/*eslint-disable*/
import {api} from '@/utils/axios';
import {useQuery} from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface ApiTransaction {
  id: string;
  walletId: string;
  particular: string;
  receiverId: string | null;
  senderId: string | null;
  beneficiaryId: string | null;
  amount: number;
  amountType: string;
  accountType: string;
  type: 'CREDIT' | 'DEBIT';
  rejectReason: string | null;
  isPending: boolean;
  isRejected: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WalletData {
  id: string;
  eprivateAccount: number;
  temporyAccount: number;
}

interface DashboardData {
  wallet: WalletData;
  transactions: ApiTransaction[];
}

interface ApiResponse {
  statusCode: number;
  status: boolean;
  message: string;
  data: DashboardData;
  errors: null;
}

export const useGetProfileMutation = () => {
  return useQuery<ApiResponse>({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<ApiResponse> => {
      try {
        const response = await api.get('/customer/profile/dashboard');
        return response.data;
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || 'Failed to get profile';
        toast.error(errorMessage);
        throw error;
      }
    },
    retry: 1,
  });
};
