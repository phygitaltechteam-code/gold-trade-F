import {api} from '@/utils/axios';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import toast from 'react-hot-toast';

interface TopupPayload {
  amount: number;
  currency: string;
  securityCode: string;
  accountType: string;
  proof?: File; // URL or identifier for the uploaded receipt
}
interface TopupResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  proof?: File; // URL or identifier for the uploaded receipt
}
function formatToFormData(data: any): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'proof' && value instanceof File) {
      formData.append(key, value);
    } else if (key !== 'proof') {
      formData.append(key, String(value));
    }
  });
  return formData;
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
      formatToFormData(data),
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
