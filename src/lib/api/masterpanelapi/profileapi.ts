import { api } from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

export const getProfile = async () => {
  try {
    const response = await api.get(`master-broker/profile`);
    return response.data;
  } catch (error) {
    console.error('Error while edit date:', error);
    throw error;
  }
};

export type profilePayload = {
  fullname: string;
  photo: File;
};


export type resetPasswordPayload = {
  currentPassword: string;
  newPassword: string;
};
export const resetPassword = async (data: resetPasswordPayload) => {
  try {
    await api.post(`users/change-password`, data);
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        'Failed to reset password';

      throw new Error(errorMessage);
    }

    throw error;
  }
};


export type resetPinPayload = {
  currentPin: string;
  newPin: string;
};
export const resetPin = async (data: resetPinPayload) => {
  try {
    await api.post(`users/change-pin`, data);
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.errors?.[0]?.message ||
        error.response?.data?.message ||
        'Failed to reset pin';

      throw new Error(errorMessage);
    }

    throw error;
  }
};




export const updateProfile = async (data: profilePayload) => {
  try {
    const formData = new FormData();

    formData.append('fullname', data.fullname);

    if (data.photo) {
      formData.append('photo', data.photo);
    }

    const response = await api.put(`master-broker/profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error while edit profile:', error);
    throw error;
  }
};


  export type TradingTimePayload = {
  stockHoldingLimit?: number;
  holdingStatus?: boolean;
  gttStatus?: boolean;
  stoplossStatus?: boolean;
  limitStatus?: boolean;
  targetStatus?: boolean;
  stoplossAndTargetStatus?: boolean;
};

export const setTradingTime = async (data: TradingTimePayload) => {
  try {
    const response = await api.put(`master-broker/profile/site`, data);
    return response.data;
  } catch (error) {
    console.error('Error to set:', error);
    throw error;
  }
};


  export const getTradingTime = async () => {
  try {
    const response = await api.get(`master-broker/profile/site`);
    return response.data;
  } catch (error) {
    console.error('Error to set:', error);
    throw error;
  }
};

export const setCommission = async (commission: number) => {
  try {
    const response = await api.post(`master-broker/commission`, {
      commission: commission,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching commission:', error);
    throw error;
  }
};

export const getCommisssion = async () => {
  try {
    const response = await api.get(`master-broker/commission`);
    return response.data;
  } catch (error) {
    console.error('Error fetching commission:', error);
    throw error;
  }
};


export const getScriptsData = async () => {
  try {
    const response = await api.get(`/master-broker/profile/assets`);
    console.log('API response for scripts:', response);
    return response;
  } catch (error) {
    console.error('Error fetching scripts data:', error);
    throw error;
  }
};

export const  updateScriptStatus = async (id: string) => {
  try {
    const response = await api.patch(`/master-broker/profile/assets/${id}`);
    console.log('API response for scripts:', response);
    return response;
  } catch (error) {
    console.error('Error to status change:', error);
    throw error;
  }
};

export const getClientLedger = async (id:string) => {
    console.log("call api" , id)
  try {
    const response = await api.get(`/master-broker/customer/ledger/${id}`);
    console.log('ledger datam api ', response);
    return response;
  } catch (error) {
    console.error('Error fetching scripts data:', error);
    throw error;
  }
};