// @/lib/react-query/client.ts
import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useGetClients = () => {
  return useQuery({
    queryKey: ['clients'],

    queryFn: async () => {
      const response = await api.get('company/customer');
      console.log('GET Client', response.data);
      return response.data;
    },
  });
};

export const useGetCustomerById = (id: string) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await api.get(`/admin/customer/${id}`);
      console.log('GET Customer By ID', response.data);
      return response.data;
    },
    enabled: !!id, // prevents API call if id is undefined
  });
};

export const useActivateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, pin}: {id: string; pin: string}) =>
      activeCustomer(id, pin),

    onSuccess: () => {
      toast.success('Status Changes!');
      queryClient.invalidateQueries({queryKey: ['customer']});
    },
    onError: () => {
      toast.error('Failed To Change Status!');
    },
  });
};

export const activeCustomer = async (id: string, pin: string) => {
  try {
    const response = await api.put(`/company/customer/${id}/active`, {
      securityPin: pin,
    });
    return response.data;
  } catch (error) {
    console.error('Error accept', error);
    throw error;
  }
};

export const useGettransactionCustomerById = (id: string) => {
  return useQuery({
    queryKey: ['customerTransactions', id],
    queryFn: async () => {
      const response = await api.get(`/admin/transaction/customer/${id}`);
      console.log('GET Customer By ID', response.data);
      return response.data;
    },
    enabled: !!id, // prevents API call if id is undefined
  });
};
