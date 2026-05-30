import {api} from '@/utils/axios';
import {useQuery} from '@tanstack/react-query';

export const useGetTransactionLedger = () => {
  return useQuery({
    queryKey: ['transaction-ledger'],
    queryFn: () => api.get('/company/profile/transaction-ledger'),
  });
};

export const useGetSuperBrokerTransactionLedger = () => {
  return useQuery({
    queryKey: ['transaction-ledger'],
    queryFn: () => api.get('/super-broker/transaction-ledger'),
  });
};

export const useGetBrokerTransactionLedger = () => {
  return useQuery({
    queryKey: ['transaction-ledger'],
    queryFn: () => api.get('/broker/transaction-ledger'),
  });
};
