import {
  DashboardFilters,
  DashboardFilterType,
  DashboardStats,
} from '@/components/Dashboard/types';
import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {result} from 'lodash';

import toast from 'react-hot-toast';


export const useGetCompanyDashboard = () => {
  return useQuery({
    queryKey: ['company-dashboard'],
    queryFn: () => api.get('company/profile/stats'),
  });
};

export const useGetSuperBrokerDashboard = () => {
  return useQuery({
    queryKey: ['super-broker-dashboard'],
    queryFn: () => api.get('super-broker/profile/stats'),
  });
};

export const useGetBrokerDashboard = () => {
  return useQuery({
    queryKey: ['broker-dashboard'],
    queryFn: () => api.get('broker/profile/stats'),
  });
};
