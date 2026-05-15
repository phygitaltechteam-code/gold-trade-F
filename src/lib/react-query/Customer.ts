import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  acceptTheCustomer,
  getAllCustomer,
  getCustomerById,
  rejectTheCustomer,
  deleteCustomer,
  updateCustomer,
} from '../api/customer';
import toast from 'react-hot-toast';

export const useGetCustomer = () =>
  useQuery({
    queryKey: ['customer'],
    queryFn: () => getAllCustomer(),
  });

export const useGetCustomerById = (id: string) =>
  useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerById(id),
  });

export const useAcceptCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => acceptTheCustomer(id),

    onSuccess: () => {
      toast.success('Customer Accepted!');
      queryClient.invalidateQueries({queryKey: ['customer']});
      queryClient.invalidateQueries({queryKey: ['accept-customer']});
    },
    onError: () => {
      toast.error('Failed To Accept Customer!');
    },
  });
};

export const useRejectCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, note}: {id: string; note: string}) =>
      rejectTheCustomer(id, note),

    onSuccess: () => {
      toast.success('Customer Rejected!');
      queryClient.invalidateQueries({queryKey: ['customer']});
      queryClient.invalidateQueries({queryKey: ['reject-customer']});
    },
    onError: () => {
      toast.error('Failed To Reject Customer!');
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
    onError: () => {
      toast.error('Failed To Delete Customer!');
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, data}: {id: string; data: any}) => updateCustomer(id, data),

    onSuccess: () => {
      toast.success('Customer Updated Successfully!');
      queryClient.invalidateQueries({queryKey: ['customer']});
    },
    onError: () => {
      toast.error('Failed To Update Customer!');
    },
  });
};
