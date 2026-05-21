import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  addSuperBrocker,
  getAllSuperBrocker,
  getAllSuperBrockerById,
  SuperBrocker,
} from '../api/superbrocker';

export const useAddSuperBrocker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({data}: {data: SuperBrocker}) => addSuperBrocker(data),

    onSuccess: () => {
      toast.success('Super brocker Accepted!');
      queryClient.invalidateQueries({queryKey: ['super_brocker']});
    },
    onError: () => {
      toast.error('Failed To add super brocker!');
    },
  });
};

export const useGetAllSuperBrocker = () =>
  useQuery({
    queryKey: ['super_brocker'],
    queryFn: () => getAllSuperBrocker(),
  });

export const useGetAllSuperBrockerById = (id: string) =>
  useQuery({
    queryKey: ['super_brocker', id],
    queryFn: () => getAllSuperBrockerById(id),
  });
