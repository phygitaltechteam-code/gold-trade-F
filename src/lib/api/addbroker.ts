import { api } from "@/utils/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useAddBroker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBroker,
    onSuccess: () => {
      toast.success('Broker Registered Successfully!');
      queryClient.invalidateQueries({ queryKey: ['get-broker'] });
    },
    onError: (error) => {
      console.log('errors', error);

      if (error?.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        validationErrors.forEach((err) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        const backendMessage =
          error?.response?.data?.message || 'Failed to register broker';
        toast.error(backendMessage);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['broker'] });
    },
  });
};

export const useDeleteBroker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBroker,
    onSuccess: () => {
      toast.success('Broker Deleted Successfully!');
      queryClient.invalidateQueries({ queryKey: ['get-broker'] });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      const backendMessage = error?.response?.data?.message || 'Failed to delete broker';
      toast.error(backendMessage);
    },
  });
};

export const useGetBrokerData = () =>
  useQuery({
    queryKey: ['get-broker'],
    queryFn: () => getBrokerData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  export const useGetSuperBrokerData = () =>
  useQuery({
    queryKey: ['get-superbroker'],
    queryFn: () => getSuperBrokerData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const addBroker = async (data: FormData) => {
  try {
    console.log('Sending FormData to API');
    const response = await api.post(`/company/broker`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error saving broker profile:', error);
    throw error;
  }
};

export const deleteBroker = async (id: string) => {
  try {
    const response = await api.delete(`/company/broker/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting broker:', error);
    throw error;
  }
};

const getBrokerData = async () => {
  try {
    const response = await api.get(`/company/broker`);
    // Return only the serializable data
    return JSON.parse(JSON.stringify(response.data));
  } catch (error) {
    console.error('Error fetching broker data:', error);
    throw error;
  }
};

const getSuperBrokerData = async () => {
  try {
    const response = await api.get(`/company/superbroker`);
    // Return only the serializable data
    return JSON.parse(JSON.stringify(response.data));
  } catch (error) {
    console.error('Error fetching broker data:', error);
    throw error;
  }
};