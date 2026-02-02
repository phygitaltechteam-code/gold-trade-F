import {useQueryClient, useMutation, useQuery} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {addBenefishiary, getBenefishiary} from '../beneficiary/beneficiary';
import {BeneficiaryFormData} from '@/features/Payments/types';

export const useAddBeneficiary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BeneficiaryFormData) => addBenefishiary(data),
    onSuccess: () => {
      toast.success(' Beneficiary added successfully');
      queryClient.invalidateQueries({queryKey: ['beneficiary']});
    },
    onError: (error) => {
      toast.error('Failed to add  Beneficiary: ' + error.message);
    },
  });
};

export const useGetBeneficiary = () =>
  useQuery({
    queryKey: ['beneficiary'],
    queryFn: () => getBenefishiary(),
  });
