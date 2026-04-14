import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

export type admin = {
  id?: string;
  startDate: Date;
  endDate: Date;
  address: string;
  plan: string;
  user: {
    fullname: string;
    email: string;
    secondaryPhoneNumber?: string;
    phoneNumber: string;

    password: string;
    role: string;
  };
};
export const useSaveAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveAdminProfile,
    onSuccess: () => {
      toast.success('admin Registered!');
    },
    onError: (error) => {
      console.log('errors', error);

      const backendMessage =
        error?.response?.data?.message || 'Failed to register admin';

      toast.error(backendMessage);

      //   toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin'],
      });
    },
  });
};

export const useDeleteAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      toast.success('admin deleted!');
    },
    onError: (error) => {
      console.log('errors', error);

      const backendMessage =
        error?.response?.data?.message || 'Failed to delete admin';

      toast.error(backendMessage);

      //   toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin'],
      });
    },
  });
};

export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({id, data}: {id: string; data: adminPayload}) => {
      return editAdmin(id, data);
    },
    onSuccess: () => {
      toast.success('Admin edited!');
    },
    onError: (error: any) => {
      console.log('errors', error);
      const backendMessage =
        error?.response?.data?.message || 'Failed to edit admin';
      toast.error(backendMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin'],
      });
    },
  });
};

export const useGetAdmin = () =>
  useQuery<admin[]>({
    queryKey: ['admin'],
    queryFn: () => getAdmins(),
  });

export const useGetCompanyById = (id: string) =>
  useQuery<admin[]>({
    queryKey: ['admin'],
    queryFn: () => getCompanyById(id),
  });




export type adminPayload = {
  id?: string;
  fullname: string;
  email: string;
  secondaryPhoneNumber?: string;
  phoneNumber: string;
  address: string;
  password: string;
  role: string;
  plan: string;
  startDate: Date;
  endDate: Date;
};
export const saveAdminProfile = async (data: adminPayload) => {
  try {
    console.log('api data', data);
    const response = await api.post(`admin`, data);
    return response.data;
  } catch (error) {
    console.error('Error saving admin profile:', error);
    throw error;
  }
};

export const getAdmins = async () => {
  try {
    const response = await api.get(`admin/`);
    return response.data;
  } catch (error) {
    console.error('Error gating admin:', error);
    throw error;
  }
};

export const deleteAdmin = async (id: string) => {
  try {
    const response = await api.delete(`admin/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
};

export const editAdmin = async (id: string, data: adminPayload) => {
  try {
    const response = await api.put(`admin/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error editing admin:', error);
    throw error;
  }
};

export const getCompanyById = async (id: string) => {
  try {
    const response = await api.get(`admin/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting company by id:', error);
    throw error;
  }
};

