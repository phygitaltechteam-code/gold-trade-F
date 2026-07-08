// lib/api/customer.ts
import {api} from '@/utils/axios';

export const getAllCustomer = async () => {
  try {
    const response = await api.get(`company/customer`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }   
};

export const getCustomerById = async (id: string) => {
  try {
    const response = await api.get(`company/customer/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

// FIXED: Changed from /accept/${id} to /${id}/verify
export const acceptTheCustomer = async (id: string) => {
  try {
    const response = await api.put(`company/customer/${id}/verify`);
    return response.data;
  } catch (error) {
    console.error('Error to accept customer:', error);
    throw error;
  }
};

export const rejectTheCustomer = async (id: string, note: string) => {
  try {
    const response = await api.put(`company/customer/reject/${id}`, {
      note: note,
    });
    return response.data;
  } catch (error) {
    console.error('Error to reject customer:', error);
    throw error;
  }
};

export const deleteCustomer = async (id: string) => {
  try {
    const response = await api.delete(`company/customer/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

export const updateCustomer = async (id: string, data: any) => {
  try {
    const response = await api.put(`company/customer/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};
