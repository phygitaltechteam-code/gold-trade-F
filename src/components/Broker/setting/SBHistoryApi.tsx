import {api} from '@/utils/axios';
import {useQuery} from '@tanstack/react-query';

export const getSuperBrokerHistory = async () => {
  try {
    const response = await api.get(`/super-broker/commission/history`);
    console.log('Raw API Response:', response);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const useGetSuperBrokerHistory = () => {
  return useQuery({
    queryKey: ['super-broker-history'],
    queryFn: getSuperBrokerHistory,
  });
};

export const getBrokerHistory = async () => {
  try {
    const response = await api.get(`/broker/commission/history`);
    console.log('Raw API Response:', response);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const useGetBrokerHistory = () => {
  return useQuery({
    queryKey: ['broker-history'],
    queryFn: getBrokerHistory,
  });
};
