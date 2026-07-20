import { api } from "@/utils/axios";
import { useQuery } from "@tanstack/react-query";
export const useGetBrokerClientById = (id: string) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => getBrokerClientById(id),
    enabled: !!id,
  });
}; 

export const getBrokerClientById = async (id: string) => {
  const response = await api.get(`/broker/customer/${id}`);
  return response.data;
};

export const useGetBrokerClientLedgerById = (id: string) => {
  return useQuery({
    queryKey: ['clientLedger', id],
    queryFn: () => getBrokerClientLedgerById(id),
    enabled: !!id,
  });
};
const getBrokerClientLedgerById = async (id: string) => {
  const response = await api.get(`/broker/customer/ledger/${id}`);
  return response.data;
};

export const useGetBrokerClients = () => {
  return useQuery({
    queryKey: ['clients'],

    queryFn: async () => {

      const response = await api.get('/broker/customer');
      console.log('GET Client', response.data);
      return response.data;
    },
  });
};

export const useBrokerGetAllSuperBrocker = () =>
  useQuery({
    queryKey: ['super_brocker'],
    queryFn: () => getBrokerAllSuperBrocker(),
  });

  export const getBrokerAllSuperBrocker = async () => {
  try {
    const response = await api.get(`/broker/customer/trader`);
    return response.data;
  } catch (error) {
    console.error('Error fetching brockers:', error);
    throw error;
  }
};
