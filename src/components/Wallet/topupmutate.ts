import {api} from '@/utils/axios';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import toast from 'react-hot-toast';

interface TopupPayload {
  amount: number;
  currency: string;
  securityCode: string;
  accountType: string;
}

interface TopupResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export const useTopupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<TopupResponse, Error, TopupPayload>({
    mutationFn: submittopup,
    onSuccess: (data) => {
      toast.success('Topup Payment submitted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit topup');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['wallet'],
      });
      queryClient.invalidateQueries({
        queryKey: ['transactions'],
      });
    },
  });
};

export const submittopup = async (
  data: TopupPayload,
): Promise<TopupResponse> => {
  try {
    const response = await api.post<TopupResponse>(
      `/customer/wallet/topup`,
      data,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to submit topup',
      );
    }
    throw error;
  }
};

export const useWithdrawMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<TopupResponse, Error, TopupPayload>({
    mutationFn: submitWithdraw,
    onSuccess: (data) => {
      toast.success('Withdraw Payment submitted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit topup');
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['wallet'],
      });
      queryClient.invalidateQueries({
        queryKey: ['transactions'],
      });
    },
  });
};

export const submitWithdraw = async (
  data: TopupPayload,
): Promise<TopupResponse> => {
  try {
    const response = await api.post<TopupResponse>(
      `/customer/wallet/withdraw`,
      data,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to submit topup',
      );
    }
    throw error;
  }
};
