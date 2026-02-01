import {useMutation} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {addBenefishiary} from '../beneficiary/beneficiary';
import {BeneficiaryFormData} from '@/features/Payments/types';

export const useAddBeneficiary = () => {
  return useMutation({
    mutationFn: (data: BeneficiaryFormData) => addBenefishiary(data),
    onSuccess: () => {
      toast.success(' Beneficiary added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add  Beneficiary: ' + error.message);
    },
  });
};
