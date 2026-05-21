import {api} from '@/utils/axios';

export type SuperBrocker = {
  fullname: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  commission: number;
  dob: Date;
  aadharCardNumber: string;
  panCardNumber?: string;
  aadharCardF?: File;
  aadharCardB?: File;
  photo?: File;
};

export const addSuperBrocker = async (data: SuperBrocker) => {
  try {
    const formData = new FormData();

    formData.append('fullname', data.fullname);
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('commission', String(data.commission));

    formData.append('dob', data.dob ? new Date(data.dob).toISOString() : '');

    formData.append('aadharCardNumber', data.aadharCardNumber);

    formData.append('panCardNumber', data.panCardNumber || '');

    if (data.aadharCardF) {
      formData.append('aadharCardF', data.aadharCardF);
    }

    if (data.aadharCardB) {
      formData.append('aadharCardB', data.aadharCardB);
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
