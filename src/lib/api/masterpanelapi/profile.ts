import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getClientLedger, getCommisssion, getProfile, getScriptsData, getTradingTime, profilePayload, resetPassword, resetPin, setCommission, setTradingTime, updateProfile, updateScriptStatus } from './profileapi';
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
  

    export const useSetComission = () => {
      const queryClient = useQueryClient();
    
      return useMutation({
        mutationFn: (commission: number) => setCommission(commission),
        onSuccess: () => {
          toast.success('Commission set successfully!');
          queryClient.invalidateQueries({queryKey: ['commission_single']});
        },
        onError: (error: Error) => {
          toast.error(error.message || 'Failed to set commission!');
        },
      });
    };

    export const  useGetCommission=()=>{
      return useQuery({
        queryKey: ['commission_single'],
        queryFn: () => getCommisssion(),
      });
    }

       export const  useGetScript=()=>{
      return useQuery({
        queryKey: ['commission_single'],
        queryFn: () => getScriptsData(),
      });
    }


    export const useUpdateScriptStatus = () => {
      const queryClient = useQueryClient();
    
      return useMutation({
        mutationFn: (id: string) => updateScriptStatus(id),
        onSuccess: () => {
          toast.success('Status Updated Successfully!');
          queryClient.invalidateQueries({queryKey: ['scripts']});
        },
        onError: (error: any) => {
          console.error('Delete error:', error);
          const backendMessage =
            error?.response?.data?.message || 'Failed to update Status';
          toast.error(backendMessage);
        },
      });
    };


export const useGetMasterClientLedger = (id: string) => {
  return useQuery({
    queryKey: ['ledger', id],
    queryFn: () => getClientLedger(id),
    enabled: !!id,
  });
};