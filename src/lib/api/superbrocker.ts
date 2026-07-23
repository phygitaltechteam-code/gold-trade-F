import {api} from '@/utils/axios';

export type SuperBrocker = {
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

export const addSuperBrocker = async (data: SuperBrocker) => {
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

    const response = await api.post(`company/super-broker`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error adding super broker:', error);
    throw error;
  }
};

export const getAllSuperBrocker = async () => {
  try {
    const response = await api.get(`company/super-broker`);
    return response.data;
  } catch (error) {
    console.error('Error fetching brockers:', error);
    throw error;
  }
};

export const getAllSuperBrockerById = async (id: string) => {
  try {
    const response = await api.get(`company/super-broker/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching brockers:', error);
    throw error;
  }
};

export const getAllSuperBrockerBrokers = async (id: string) => {
  try {
    const response = await api.get(`company/super-broker/brokers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching brockers:', error);
    throw error;
  }
};