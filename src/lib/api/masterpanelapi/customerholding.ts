import { api } from "@/utils/axios";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useCustomerHolding = () => {
    return useMutation({
        mutationFn: async (data: {
            customerLimits: { customerId: string; stockHoldingLimit: string }[];

        }) => {
            const response = await api.put(
                `/master-broker/profile/limit`,
                data,
            );
            return response.data;
        },
    });
};

export const useCustomerHoldingAdmin = () => {
    return useMutation({
        mutationFn: async (data: {
            customers: { customerId: string; stockHoldingLimit: string }[];

        }) => {
            const response = await api.put(
                `/admin/profile/limit`,
                data,
            );
            return response.data;
        },
    });
};
export const useUpdateMarginMaster = () => {
    return useMutation({
        mutationFn: async (data: {
            customers: {customerId: string; intradayMargin:number; deliveryMargin:number}[]; 

        }) => {
            const response = await api.patch(
                `/master-broker/profile/limit`,
                data,
            );
            return response.data;
        },
    });
};

export const useGetSlipPageClientsMaster = () => {
  return useQuery({
    queryKey: ['clients'],

    queryFn: async () => {

      const response = await api.get('/master-broker/profile/slipage');
      console.log('GET Client', response.data);
      return response.data;
    },
  });
};

export const useUpdateSlippageMaster = () => {
  return useMutation({
    mutationFn: async (data: {
      customers: Array<{
        customerId: string;
        sellSlippage: number;
        buySlippage: number;
      }>;
      securityPin: string;
    }) => {
      const response = await api.patch('/master-broker/profile/slipage', data);
      return response.data;
    },
  });
};