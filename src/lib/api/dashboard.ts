import {
  DashboardFilters,
  DashboardFilterType,
  DashboardStats,
} from '@/components/Dashboard/types';
import {api} from '@/utils/axios';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {result} from 'lodash';

import toast from 'react-hot-toast';

export type dashGraph = {
  from: string;
  to: string;
};

const mapPeriodToFilter = (period: string): DashboardFilterType => {
  switch (period) {
    case '30d':
      return '30Days';
    case '7d':
      return '7Days';
    case '24h':
      return '24Hours';
    case 'custom':
      return 'custom';
    default:
      return '30Days';
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

export const buildDashboardFilters = (
  period: string,
  customDateRange?: {start: string; end: string},
): DashboardFilters => {
  const filter: DashboardFilterType = mapPeriodToFilter(period);

  const apiFilters: DashboardFilters = {filter};

  if (filter === 'custom' && customDateRange?.start && customDateRange?.end) {
    apiFilters.from = formatDate(customDateRange.start);
    apiFilters.to = formatDate(customDateRange.end);
  }

  return apiFilters;
};

export const useGetDashToUpGraph = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: dashGraph) => getDashboardTopUpGrap(data),

    onSuccess: () => {
      // toast.success('fech data sucessfully!');
      queryClient.invalidateQueries({queryKey: ['top-up-graph']});
    },
    onError: () => {
      // toast.error('Failed To get data!');
    },
  });
};

export const getDashboardData = async (
  filters: DashboardFilters,
): Promise<DashboardStats> => {
  try {
    const response = await api.put('/admin/dashboard', filters);
    console.log('Raw API Response:', response);

    if (!response.data) {
      throw new Error('No data received from API');
    }
    const dashboardData = response.data;
    // Return the mapped data with proper structure
    const result: DashboardStats = {
      TOTAL_DEPOSITS: dashboardData.TOTAL_DEPOSITS ?? 0,
      WITHDRAWALS: dashboardData.WITHDRAWALS ?? 0,
      PLATFORM_PROFIT: dashboardData.PLATFORM_PROFIT ?? 0,
      OPEN_EXPOSURE: dashboardData.OPEN_EXPOSURE ?? 0,
      MARGIN_UTIL: dashboardData.MARGIN_UTIL ?? 0,
    };

    return result;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to load dashboard data';

    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

export const getDashboardTopUpGrap = async (data: dashGraph) => {
  try {
    const response = await api.get(
      `/admin/transaction/cash-flow/graphs/weekly`,
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
export const useGetfeeChart = () =>
  useQuery({
    queryKey: ['fee-chart'],
    queryFn: async () => {
      const response = await api.get('admin/transaction/fee/chart');
      // console.log('GETDATATAREREREWR', response.data);
      return response.data;
    },
  });

export const useGetCompanyDashboard = () => {
  return useQuery({
    queryKey: ['company-dashboard'],
    queryFn: () => api.get('company/profile/stats'),
  });
};
