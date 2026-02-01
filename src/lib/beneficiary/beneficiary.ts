import {BeneficiaryFormData} from '@/features/Payments/types';
import {api} from '@/utils/axios';

export const addBenefishiary = async (data: BeneficiaryFormData) => {
  try {
    const response = await api.post(`customer/wallet/beneficiary`, data);
    return response.data;
  } catch (error) {
    console.error('Error fetching client by ID:', error);
    throw error;
  }
};
