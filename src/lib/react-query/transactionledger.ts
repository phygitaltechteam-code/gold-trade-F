import {api} from '@/utils/axios';
import {useQuery} from '@tanstack/react-query';

export const useGetTransactionLedger = () => {
  return useQuery({
    queryKey: ['transaction-ledger'],
    queryFn: () => api.get('/company/profile/transaction-ledger'),
  });
};
