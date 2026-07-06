import {api} from '@/utils/axios';

export type MasterBrocker = {
  fullname: string;
  password: string;
  phoneNumber: string;
  commission: number;
  area: string;
  panCardNumber?: string;
  aadharCardNumber?: string;
  aadharCardF?: File;
  panCard?: File;
  photo?: File;
};

export const addMasterBrocker = async (data: MasterBrocker) => {
  try {
    const formData = new FormData();

    formData.append('fullname', data.fullname);

    formData.append('password', data.password);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('commission', Number(data.commission).toString());
    formData.append('area', data.area);

    if (data.aadharCardNumber) {
      formData.append('aadharCardNumber', data.aadharCardNumber);
    }

    if (data.panCardNumber) {
      formData.append('panCardNumber', data.panCardNumber);
    }

    if (data.aadharCardF) {
      formData.append('aadharCardF', data.aadharCardF);
    }

    if (data.panCard) {
      formData.append('panCard', data.panCard);
    }

    if (data.photo) {
      formData.append('photo', data.photo);
    }

    const response = await api.post(`company/master-broker`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error adding Master broker:', error);
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
