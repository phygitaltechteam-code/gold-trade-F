import {api} from '@/utils/axios';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const CLIENTS_QUERY_KEY = ['clients'];

export const getAllClients = async () => {
  const response = await api.get(`/company/customer`);
  return response.data;
};

export const useGetAllClients = () => {
  return useQuery({
    queryKey: CLIENTS_QUERY_KEY,
    queryFn: getAllClients,
  });
};

export const getClientById = async (id: string) => {
  const response = await api.get(`/company/customer/${id}`);
  return response.data;
};

export const useGetClientById = (id: string) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => getClientById(id),
    enabled: !!id,
  });
};
const getClientLedgerById = async (id: string) => {
  const response = await api.get(`/company/customer/ledger/${id}`);
  return response.data;
};

export const useGetClientLedgerById = (id: string) => {
  return useQuery({
    queryKey: ['clientLedger', id],
    queryFn: () => getClientLedgerById(id),
    enabled: !!id,
  });
};
export const useSendDeposite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      amount: number;
      securityPin: string;
      customerId: string;
    }) => {
      const response = await api.post(
        `/company/customer/${data.customerId}/deposite`,
        data,
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success('Deposite sent successfully');
      queryClient.invalidateQueries({
        queryKey: ['client', variables.customerId],
      });
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response.data.message);
    },
  });
};

export const useSendWithdraw = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      amount: number;
      securityPin: string;
      customerId: string;
    }) => {
      const response = await api.post(
        `/company/customer/${data.customerId}/withdraw`,
        data,
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success('Withdraw sent successfully');
      queryClient.invalidateQueries({
        queryKey: ['client', variables.customerId],
      });
      return data;
    },
    onError: (error: any) => {
      toast.error(error.response.data.message);
    },
  });
};

export const addMargin = async (data: {
  customerId: string;
  intradayLeverage: number;
  deliveryLeverage: number;
  securityPin: string;
}) => {
  try {
    const response = await api.post(
      `/company/customer/${data.customerId}/margin`,
      {
        intradayLeverage: data.intradayLeverage,
        deliveryLeverage: data.deliveryLeverage,
        securityPin: data.securityPin,
      },
    );
    return response;
  } catch (error) {
    console.error('Error adding margin:', error);
    throw error;
  }
};

export const useAddMargin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addMargin,
    onSuccess: (data, variables) => {
      toast.success('Margin added successfully');
      queryClient.invalidateQueries({
        queryKey: ['customer', 'client', variables.customerId],
      });
      return data;
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed to add margin';
      toast.error(errorMessage);
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({id, data}: {id: string; data: any}) => {
      const response = await api.put(`/company/customer/${id}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success('Customer updated successfully!');
      queryClient.invalidateQueries({queryKey: ['customer']});
      queryClient.invalidateQueries({queryKey: ['client', variables.id]});
      queryClient.invalidateQueries({queryKey: ['get-customer']});
      return data;
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed to update customer';
      toast.error(errorMessage);
    },
  });
};
