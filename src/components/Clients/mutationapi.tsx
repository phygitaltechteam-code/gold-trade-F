import {api} from '@/utils/axios';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const CLIENTS_QUERY_KEY = ['clients'];

export const getAllClients = async () => {
  const response = await api.get(`/admin/customer`);
  return response.data;
};

export const useGetAllClients = () => {
  return useQuery({
    queryKey: CLIENTS_QUERY_KEY,
    queryFn: getAllClients,
  });
};

export const getClientById = async (id: string) => {
  const response = await api.get(`/admin/customer/${id}`);
  return response.data;
};

export const useGetClientById = (id: string) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => getClientById(id),
    enabled: !!id,
  });
};
