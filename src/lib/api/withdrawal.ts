import {api} from '@/utils/axios';

export const getWithdrawal = async () => {
  try {
    const response = await api.get(`/company/commission/withdrawals/pending`);
    return response.data;
  } catch (error) {
    console.error('Error fetching withdrawal:', error);
    throw error;
  }
};

export const approveWithdrawal = async (id: string) => {
  try {
    const response = await api.patch(
      `/company/commission/withdrawals/${id}/approve`,
    );
    return response.data;
  } catch (error) {
    console.error('Error approve withdrawal:', error);
    throw error;
  }
};

export const rejectWithdrawal = async (id: string) => {
  try {
    const response = await api.patch(
      `/company/commission/withdrawals/${id}/reject`,
    );
    return response.data;
  } catch (error) {
    console.error('Error reject withdrawal:', error);
    throw error;
  }
};
