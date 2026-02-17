import {BeneficiaryFormData} from '@/features/Payments/types';
import {api} from '@/utils/axios';
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
export type TransactionPayload = {
  amount: number;
  currency: string;
  securityCode: string;
  proof?: File;
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

// UPDATE BENEFICIARY
export const updateBeneficiary = async (
  id: string,
  data: BeneficiaryFormData,
) => {
  const response = await api.put(`/customer/wallet/beneficiary/${id}`, data);
  return response.data;
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
    const formData = formatToFormData(data);
    const response = await api.post(`/customer/wallet/transfer`, formData);
    return response.data;
  } catch (error) {
    console.error('Error fetching beneficiary details:', error);
    throw error;
  }
};
