import { api } from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

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