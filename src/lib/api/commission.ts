import { useAuthContext } from '@/context/AuthContext';
import AuthContextProvider from '@/context/AuthContextProvider';
import { api } from '@/utils/axios';
import { boolean } from 'zod';


export const getCommisssion = async () => {
  try {
    const response = await api.get(`company/commission`);
    return response.data;
  } catch (error) {
    console.error('Error fetching commission:', error);
    throw error;
  }
};

export const setCommission = async (commission: number, securityPin: string) => {
  try {
    const response = await api.post(`company/commission`, {
      commission: commission,
      securityPin: securityPin
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching commission:', error);
    throw error;
  }
};

export const setTradingTime = async (data: {
  holdingStatus: boolean;
  stockHoldingLimit: number;
  gttStatus: boolean;
  stoplossStatus: boolean;
  limitStatus: boolean;
  targetStatus: boolean;
  stoplossAndTargetStatus: boolean;
  securityPin: string;
}) => {
  try {
    const response = await api.put(`company/profile/site`, {
      stockHoldingLimit: data.stockHoldingLimit,
      holdingStatus: data.holdingStatus,
      gttStatus: data.gttStatus,
      stoplossStatus: data.stoplossStatus,
      limitStatus: data.limitStatus,
      targetStatus: data.targetStatus,
      stoplossAndTargetStatus: data.stoplossAndTargetStatus,
      securityPin: data.securityPin,
    });
    return response.data;
  } catch (error) {
    console.error('Error to set trading time:', error);
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
