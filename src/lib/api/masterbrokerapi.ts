import {api} from '@/utils/axios';

export type MasterBrocker = {
  fullname: string;
  password: string;
  phoneNumber: string;
  commission: number;
  customerLimit: number;
  area: string;
  panCardNumber?: string;
  aadharCardNumber?: string;
  aadharCardF?: File;
  panCard?: File;
  photo?: File;
  allowSlippage?: boolean;
  buySlippage?: number;
  sellSlippage?: number;
  buySlipagePercent?: number;
  sellSlipagePercent?: number;
};

export const addMasterBrocker = async (data: MasterBrocker) => {
  try {
    console.log("📤 Sending data:", data);
    const formData = new FormData();

    // Required fields
    formData.append('fullname', data.fullname);
    formData.append('password', data.password);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('commission', data.commission.toString());
    formData.append('customerLimit', data.customerLimit.toString());
    formData.append('area', data.area);

    // Slippage fields - ONLY send if allowSlippage is true and values exist
    if (data.allowSlippage === true) {
      // Get the buy slippage value
      let buyValue = data.buySlippage ?? data.buySlipagePercent;
      let sellValue = data.sellSlippage ?? data.sellSlipagePercent;

      // Only append if values are valid numbers and greater than 0
      if (buyValue !== undefined && buyValue !== null && !isNaN(buyValue) && buyValue > 0) {
        // Try all possible field name variations
        formData.append('buySlipagePercent', buyValue.toString());
       
        console.log(`✅ Buy slippage: ${buyValue}`);
      } else {
        console.log('ℹ️ Buy slippage value is 0 or invalid, skipping');
      }

      if (sellValue !== undefined && sellValue !== null && !isNaN(sellValue) && sellValue > 0) {
        formData.append('sellSlipagePercent', sellValue.toString());
      
        console.log(`✅ Sell slippage: ${sellValue}`);
      } else {
        console.log('ℹ️ Sell slippage value is 0 or invalid, skipping');
      }
    } else {
      console.log('ℹ️ Slippage not allowed, skipping slippage fields');
      // Explicitly don't append slippage fields
    }

    // Optional fields
    if (data.aadharCardNumber) {
      formData.append('aadharCardNumber', data.aadharCardNumber);
    }

    if (data.panCardNumber) {
      formData.append('panCardNumber', data.panCardNumber);
    }

    // File uploads
    if (data.aadharCardF) {
      formData.append('aadharCardF', data.aadharCardF);
    }

    if (data.panCard) {
      formData.append('panCard', data.panCard);
    }

    if (data.photo) {
      formData.append('photo', data.photo);
    }

    // Log all form data for debugging
    console.log('📋 FormData entries:');
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`  ${pair[0]}: [File] ${pair[1].name} (${pair[1].size} bytes)`);
      } else {
        console.log(`  ${pair[0]}: ${pair[1]}`);
      }
    }

    const response = await api.post(`company/master-broker`, formData);
    console.log('✅ Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error adding Master broker:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

export const getAllMasterBrocker = async () => {
  try {
    const response = await api.get(`company/master-broker`);
    return response.data;
  } catch (error) {
    console.error('Error fetching brockers:', error);
    throw error;
  }
};

export const getAllMasterBrockerById = async (id: string) => {
  try {
    const response = await api.get(`company/master-broker/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching brockers:', error);
    throw error;
  }
};