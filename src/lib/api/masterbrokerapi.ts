import { api } from '@/utils/axios';


export type MasterBrocker = {
  fullname: string;
  password: string;
  phoneNumber: string;
  commission: number;
  customerLimit: number;
  area: string;
  panCardNumber?: string;
  aadharCardNumber?: string;
  aadharCardF?: File;
  panCard?: File;
  photo?: File;
  allowSlipage?: boolean;
};

export const addMasterBrocker = async (data: MasterBrocker) => {
  try {
    const formData = new FormData();

    // Required fields
    formData.append('fullname', data.fullname);
    formData.append('password', data.password);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('commission', data.commission.toString());
    formData.append('customerLimit', data.customerLimit.toString());
    formData.append('area', data.area);
    // Send  as string - the backend will parse it
    formData.append('allowSlipage', String(data.allowSlipage ?? false));

    // Optional fields
    if (data.aadharCardNumber) {
      formData.append('aadharCardNumber', data.aadharCardNumber);
    }

    if (data.panCardNumber) {
      formData.append('panCardNumber', data.panCardNumber);
    }

    // File uploads
    if (data.aadharCardF) {
      formData.append('aadharCardF', data.aadharCardF);
    }

    if (data.panCard) {
      formData.append('panCard', data.panCard);
    }

    if (data.photo) {
      formData.append('photo', data.photo);
    }

    // Log all form data for debugging
    console.log('📋 FormData entries:');
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`  ${pair[0]}: [File] ${pair[1].name} (${pair[1].size} bytes)`);
      } else {
        console.log(`  ${pair[0]}: ${pair[1]}`);
      }
    }

    const response = await api.post(`company/master-broker`, formData);
    console.log('✅ Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error adding Master broker:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};
export const getAllMasterBrocker = async () => {
  try {
    const response = await api.get(`company/master-broker`);
    return response.data;
  } catch (error) {
    console.error('Error fetching brockers:', error);
    throw error;
  }
};

export const getAllMasterBrockerById = async (id: string) => {
  try {
    const response = await api.get(`company/master-broker/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching brockers:', error);
    throw error;
  }
};