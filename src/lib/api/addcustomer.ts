import { api } from '@/utils/axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';


// ============= ADD CUSTOMER =============
export const addCustomer = async (data: FormData) => {
  try {
    console.log('Sending customer registration data');
    const response = await api.post(`/users/register`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error registering customer:', error);
    throw error;
  }
};

export const useAddCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCustomer,
    onSuccess: () => {
      toast.success('Customer Registered Successfully!');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['brocker'] });
      queryClient.invalidateQueries({ queryKey: ['get-broker'] });
    },
    onError: (error: any) => {
      console.log('Customer registration error:', error);

      if (error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        validationErrors.forEach((err: any) => {
          // toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        const backendMessage =
          error?.response?.data?.message || 'Failed to register customer';
        toast.error(backendMessage);
      }
    },
  });
};

// ============= GET ALL CUSTOMERS =============
export const useGetAllCustomers = () =>
  useQuery({
    queryKey: ['customers'],
    queryFn: getAllCustomers,
  });

export const getAllCustomers = async () => {
  try {
    const response = await api.get(`/company/customers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

// ============= GET CUSTOMER BY ID =============
export const useGetCustomerById = (id: string) =>
  useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });

export const getCustomerById = async (id: string) => {
  try {
    const response = await api.get(`/company/customer/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
};

// ============= UPDATE CUSTOMER =============
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateCustomer(id, data),
    onSuccess: () => {
      toast.success('Customer Updated Successfully!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
    },
    onError: (error: any) => {
      console.error('Update error:', error);
      const backendMessage =
        error?.response?.data?.message || 'Failed to update customer';
      toast.error(backendMessage);
    },
  });
};

export const updateCustomer = async (id: string, data: any) => {
  try {
    const response = await api.put(`/company/customer/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

// ============= DELETE CUSTOMER =============
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      toast.success('Customer Deleted Successfully!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      const backendMessage =
        error?.response?.data?.message || 'Failed to delete customer';
      toast.error(backendMessage);
    },
  });
};

export const deleteCustomer = async (id: string) => {
  try {
    const response = await api.delete(`/company/customer/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// ============= UPDATE CUSTOMER STATUS =============
export const useUpdateCustomerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateCustomerStatus(id, isActive),
    onSuccess: () => {
      toast.success('Customer Status Updated Successfully!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: any) => {
      const backendMessage =
        error?.response?.data?.message || 'Failed to update customer status';
      toast.error(backendMessage);
    },
  });
};

export const updateCustomerStatus = async (id: string, isActive: boolean) => {
  try {
    const response = await api.patch(`/company/customer/${id}/status`, {
      isActive,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating customer status:', error);
    throw error;
  }
};