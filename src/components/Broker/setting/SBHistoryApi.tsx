import { api } from "@/utils/axios";

export const useGetSuperBrokerHistory = async () => {
  const response = await api.get(`/super-broker/commission/history`);
  return response;
};