import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';

// APIs will be added later
import {
  BrokerprofilePayload,
  getBrokerProfile,
  updateBrokerProfile,
} from '../api/brokerprofileapi';

export const useGetBrokerProfile = () =>
  useQuery({
    queryKey: ['brokerprofile'],
    queryFn: () => getBrokerProfile(),
  });

export const useUpdateBrokerProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({data}: {data: BrokerprofilePayload}) =>
      updateBrokerProfile(data),

    onSuccess: () => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({
        queryKey: ['brokerprofile'],
      });
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
