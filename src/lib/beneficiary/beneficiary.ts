import {BeneficiaryFormData} from '@/features/Payments/types';
import {api} from '@/utils/axios';

export type TransactionPayload = {
  amount: number;
  currency: string;
  securityCode: string;
  accountType: 'E_PRIVATEACCOUNT' | 'E_TEMPORYACCOUNT';
  beneficiaryId: string;
};

export const addBenefishiary = async (data: BeneficiaryFormData) => {
  try {
    const response = await api.post(`customer/wallet/beneficiary`, data);
    return response.data;
  } catch (error) {
    console.error('Error fetching client by ID:', error);
    throw error;
  }
};

export const getBenefishiary = async () => {
  try {
    const response = await api.get(`customer/wallet/beneficiary`);
    return response.data;
  } catch (error) {
    console.error('Error fetching client by ID:', error);
    throw error;
  }
};

export const getWalletByCustomer = async () => {
  try {
    const response = await api.get(`/customer/wallet/wallet`);
    return response.data;
  } catch (error) {
    console.error('Error fetching wallet details:', error);
    throw error;
  }
};

export const getBeneficiaryById = async (id: string) => {
  try {
    const response = await api.get(`/customer/wallet/beneficiary/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching beneficiary details:', error);
    throw error;
  }
};

export const payment = async (data: TransactionPayload) => {
  try {
    const response = await api.post(`/customer/wallet/transfer`, data);
    return response.data;
  } catch (error) {
    console.error('Error fetching beneficiary details:', error);
    throw error;
  }
};
