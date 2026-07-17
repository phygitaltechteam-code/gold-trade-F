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