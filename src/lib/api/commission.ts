import {api} from '@/utils/axios';

export const getCommisssion = async () => {
  try {
    const response = await api.get(`company/commission`);
    return response.data;
  } catch (error) {
    console.error('Error fetching commission:', error);
    throw error;
  }
};

export const setCommission = async (commission: number) => {
  try {
    const response = await api.post(`company/commision`, {
      commission: commission,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching commission:', error);
    throw error;
  }
};
