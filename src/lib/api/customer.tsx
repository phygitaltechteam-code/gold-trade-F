
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import toast from 'react-hot-toast';
import { acceptTheCustomer, deleteCustomer, getAllCustomer, getCustomerById, rejectTheCustomer, updateCustomer } from '../react-query/Customer';

export const useGetCustomer = () =>
  useQuery({
    queryKey: ['customer'],
    queryFn: () => getAllCustomer(),
  });

export const useGetCustomerById = (id: string) =>
  useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });

// Updated to use the verify endpoint
export const useAcceptCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => acceptTheCustomer(id),

    onSuccess: () => {
      toast.success('Customer Verified Successfully!');
      queryClient.invalidateQueries({queryKey: ['customer']});
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed To Verify Customer!';
      toast.error(errorMessage);
    },
  });
};

export const useRejectCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, note}: {id: string; note: string}) =>
      rejectTheCustomer(id, note),

    onSuccess: () => {
      toast.success('Customer Rejected Successfully!');
      queryClient.invalidateQueries({queryKey: ['customer']});
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed To Reject Customer!';
      toast.error(errorMessage);
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),

    onSuccess: () => {
      toast.success('Customer Deleted Successfully!');
      queryClient.invalidateQueries({queryKey: ['customer']});
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed To Delete Customer!';
      toast.error(errorMessage);
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: any}) =>
      updateCustomer(id, data),

    onSuccess: () => {
      toast.success('Customer Updated Successfully!');
      queryClient.invalidateQueries({queryKey: ['customer']});
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed To Update Customer!';
      toast.error(errorMessage);
    },
  });
};
