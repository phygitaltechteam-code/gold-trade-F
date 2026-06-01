import {api} from '@/utils/axios';

export type BrokerprofilePayload = {
  fullname: string;
  photo: File;
};

export const updateBrokerProfile = async (data: BrokerprofilePayload) => {
  try {
    const formData = new FormData();

    formData.append('fullname', data.fullname);

    if (data.photo) {
      formData.append('photo', data.photo);
    }

    const response = await api.put(`broker/profile`, formData, {
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

export const getBrokerProfile = async () => {
  try {
    const response = await api.get(`broker/profile`);
    return response.data;
  } catch (error) {
    console.error('Error while edit date:', error);
    throw error;
  }
};
