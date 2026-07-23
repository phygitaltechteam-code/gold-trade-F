import { api } from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";

export const useCustomerHolding = () => {
    return useMutation({
        mutationFn: async (data: {
            customerLimits: { customerId: string; stockHoldingLimit: string }[];

        }) => {
            const response = await api.put(
                `/company/customer/limit`,
                data,
            );
            return response.data;
        },
    });
};

export const useUpdateMargin = () => {
    return useMutation({
        mutationFn: async (data: {
            customers: {customerId: string; intradayMargin:number; deliveryMargin:number}[]; 

        }) => {
            const response = await api.patch(
                `/company/customer/limit`,
                data,
            );
            return response.data;
        },
    });
};
