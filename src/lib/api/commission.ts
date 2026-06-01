import {api} from '@/utils/axios';
import {boolean} from 'zod';

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
    const response = await api.post(`company/commission`, {
      commission: commission,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching commission:', error);
    throw error;
  }
};

export const setTradingTime = async (
  stockHoldingLimit: number,
  holdingStatus: boolean,
  gttStatus?: boolean,
  stoplossStatus?: boolean,
  limitStatus?: boolean,
  targetStatus?: boolean,
  stoplossAndTargetStatus?: boolean,
) => {
  try {
    const response = await api.put(`company/profile/site`, {
      stockHoldingLimit: stockHoldingLimit,
      holdingStatus: holdingStatus,
      gttStatus: gttStatus,
      stoplossStatus: stoplossStatus,
      limitStatus: limitStatus,
      targetStatus: targetStatus,
      stoplossAndTargetStatus: stoplossAndTargetStatus,
    });
    return response.data;
  } catch (error) {
    console.error('Error to set:', error);
    throw error;
  }
};

export const getTradingTime = async () => {
  try {
    const response = await api.get(`company/profile/site`);
    return response.data;
  } catch (error) {
    console.error('Error to set:', error);
    throw error;
  }
};
