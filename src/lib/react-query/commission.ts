import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {api} from '@/utils/axios';
import toast from 'react-hot-toast';
import {
  getCommisssion,
  getTradingTime,
  setCommission,
  setTradingTime,
} from '../api/commission';

interface CommissionFormData {
  name: string;
  percentage: number;
  type: 'TOP_UP' | 'WITHDRAWAL' | 'TRANSFER';
  amount: number;
  description: string;
}

export const addCommission = async (data: CommissionFormData) => {
  try {
    const response = await api.put('/admin/transaction/fee', data);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to add commission');
    }
    throw error;
  }
};

export const useAddComission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCommission,
    onSuccess: () => {
      toast.success('Commission added successfully!');
      queryClient.invalidateQueries({queryKey: ['commission']});
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add commission!');
    },
  });
};

export const useGetComissionAll = () =>
  useQuery({
    queryKey: ['commission'],
    queryFn: () => getAllComission(),
  });

export const useGetComission = () =>
  useQuery({
    queryKey: ['commission_single'],
    queryFn: () => getCommisssion(),
  });

export const getAllComission = async () => {
  try {
    const response = await api.get(`/admin/transaction/fee`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const useSetComission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commission: number) => setCommission(commission),
    onSuccess: () => {
      toast.success('Commission set successfully!');
      queryClient.invalidateQueries({queryKey: ['commission_single']});
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set commission!');
    },
  });
};

export const useSetTradingTime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      stockHoldingLimit,
      holdingStatus,
      gttStatus,
      stoplossStatus,
      limitStatus,
      targetStatus,
      stoplossAndTargetStatus,

    }: {
      time: number;
      holdingStatus: boolean;
      gttStatus?: boolean;
      stoplossStatus?: boolean;
      limitStatus?: boolean;
      targetStatus?: boolean;
      stoplossAndTargetStatus?: boolean;
    }) => setTradingTime(stockHoldingLimit, holdingStatus , gttStatus, stoplossStatus, limitStatus, targetStatus, stoplossAndTargetStatus),
    onSuccess: () => {
      toast.success('set successfully!');
      queryClient.invalidateQueries({queryKey: ['trading_time']});
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to set!');
    },
  });
};

export const useGetTradeTime = () =>
  useQuery({
    queryKey: ['trading_time'],
    queryFn: () => getTradingTime(),
  });
