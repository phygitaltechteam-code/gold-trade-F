import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getProfile, getTradingTime, profilePayload, resetPassword, resetPin, setTradingTime, updateProfile } from './profileapi';
import { api } from '@/utils/axios';


export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully!');
      queryClient.invalidateQueries({queryKey: ['password_reset']});
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
export const useResetPin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetPin,
    onSuccess: () => {
      toast.success('Pin reset successfully!');
      queryClient.invalidateQueries({queryKey: ['pin_reset']});
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
export const useEditProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({data}: {data: profilePayload}) => updateProfile(data),
    onSuccess: () => {
      toast.success('Profile edited successfully!');
      queryClient.invalidateQueries({queryKey: ['profile']});
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useGetProfile = () =>
  useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile(),
  });






  export const useSetTradingTime = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({
        holdingStatus,
        gttStatus,
        stoplossStatus,
        limitStatus,
        targetStatus,
        stoplossAndTargetStatus,
      }: {
        holdingStatus: boolean;
        gttStatus?: boolean;
        stoplossStatus?: boolean;
        limitStatus?: boolean;
        targetStatus?: boolean;
        stoplossAndTargetStatus?: boolean;
      }) =>
        setTradingTime({
          holdingStatus,
          gttStatus,
          stoplossStatus,
          limitStatus,
          targetStatus,
          stoplossAndTargetStatus,
        }),
      onSuccess: () => {
        toast.success('set successfully!');
        queryClient.invalidateQueries({queryKey: ['trading_time']});
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to set!');
      },
    });
  };


  export const useGetTradeTime = () =>
    useQuery({
      queryKey: ['trading_time'],
      queryFn: () => getTradingTime(),
    });
  