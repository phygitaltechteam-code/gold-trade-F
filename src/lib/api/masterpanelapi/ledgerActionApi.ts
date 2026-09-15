import { api } from '@/utils/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const getEndpointPrefix = (role?: string) => {
  const r = role?.toUpperCase();
  if (r === 'COMPANY' || r === 'ADMIN' || r === 'SUPERADMIN' || r === 'SUPER_ADMIN') {
    return '/company/customer';
  }
  if (r === 'SUPER_BROKER' || r === 'SUPERBROKER') {
    return '/super-broker/customer';
  }
  if (r === 'BROKER') {
    return '/broker/customer';
  }
  return '/master-broker/customer';
};


export const closePosition = async (orderId: string | number, payload: any = {}, role?: string) => {
  try {
    const prefix = getEndpointPrefix(role);
    try {
      const response = await api.post(`${prefix}/closeposition/${orderId}`, payload);
      return response.data;
    } catch (err: any) {
      // Fallback if 404
      if (prefix === '/company/customer') {
        try {
          const res = await api.post(`/company/customer/closeposition/${orderId}`, payload);
          return res.data;
        } catch (_) { }
      }
      throw err;
    }
  } catch (error: any) {
    console.error('Error closing position:', error);
    throw error;
  }
};


export const reverseEntry = async (
  orderIdOrPayload: any,
  payloadOrRole?: any,
  maybeRole?: string
) => {
  try {
    let orderId: string | number | undefined;
    let payload: any = {};
    let role: string | undefined;

    if (typeof orderIdOrPayload === 'object' && orderIdOrPayload !== null) {
      payload = orderIdOrPayload;
      role = typeof payloadOrRole === 'string' ? payloadOrRole : undefined;
    } else {
      orderId = orderIdOrPayload;
      payload = typeof payloadOrRole === 'object' && payloadOrRole !== null ? payloadOrRole : {};
      role = maybeRole;
    }

    const prefix = getEndpointPrefix(role);
    const body: any = {
      ...(payload || {}),
    };

    if (orderId && !body.orderId) {
      body.orderId = orderId;
    }
    if ('buyOrderId' in payload) body.buyOrderId = payload.buyOrderId;
    if ('sellOrderId' in payload) body.sellOrderId = payload.sellOrderId;
    if ('buyId' in payload) body.buyId = payload.buyId;
    if ('sellId' in payload) body.sellId = payload.sellId;

    try {
      const response = await api.put(`${prefix}/revert`, body);
      return response.data;
    } catch (err: any) {
      if (prefix === '/company/customer') {
        try {
          const res = await api.put(`/company/customer/revert`, body);
          return res.data;
        } catch (_) { }
      }
      throw err;
    }
  } catch (error: any) {
    console.error('Error reversing entry:', error);
    throw error;
  }
};



export const editEntry = async (orderId: string | number, data: any, role?: string) => {
  try {
    const prefix = getEndpointPrefix(role);

    // Normalize prices and quantities
    const buyPriceRaw = data?.newBuyPrice ?? data?.buyPrice;
    const sellPriceRaw = data?.newSellPrice ?? data?.sellPrice;
    const priceRaw = data?.newPrice ?? data?.price;
    const qtyRaw = data?.newQty ?? data?.qty;

    const validBuyPrice =
      buyPriceRaw !== undefined && buyPriceRaw !== null && buyPriceRaw !== '' && !isNaN(Number(buyPriceRaw))
        ? Number(buyPriceRaw)
        : undefined;

    const validSellPrice =
      sellPriceRaw !== undefined && sellPriceRaw !== null && sellPriceRaw !== '' && !isNaN(Number(sellPriceRaw))
        ? Number(sellPriceRaw)
        : undefined;

    const validPrice =
      priceRaw !== undefined && priceRaw !== null && priceRaw !== '' && !isNaN(Number(priceRaw))
        ? Number(priceRaw)
        : undefined;

    // Determine updateType
    let updateType = data?.updateType;
    if (!updateType) {
      if (validBuyPrice !== undefined && validSellPrice !== undefined) {
        updateType = 'both';
      } else if (validBuyPrice !== undefined) {
        updateType = 'buy';
      } else if (validSellPrice !== undefined) {
        updateType = 'sell';
      } else if (validPrice !== undefined) {
        updateType = 'both';
      } else {
        updateType = 'both';
      }
    }

    const payload: any = {
      orderId,
      updateType,
      ...data,
    };


    const buyOrderId = data?.buyOrderId ?? data?.buyId;
    const sellOrderId = data?.sellOrderId ?? data?.sellId;

    if (updateType === 'buy') {
      if (buyOrderId) {
        payload.buyOrderId = buyOrderId;
        payload.buyId = buyOrderId;
      }
      delete payload.sellOrderId;
      delete payload.sellId;
    } else if (updateType === 'sell') {
      if (sellOrderId) {
        payload.sellOrderId = sellOrderId;
        payload.sellId = sellOrderId;
      }
      delete payload.buyOrderId;
      delete payload.buyId;
    } else if (updateType === 'both') {
      if (buyOrderId) {
        payload.buyOrderId = buyOrderId;
        payload.buyId = buyOrderId;
      }
      if (sellOrderId) {
        payload.sellOrderId = sellOrderId;
        payload.sellId = sellOrderId;
      }
    }

    if (validBuyPrice !== undefined) {
      payload.newBuyPrice = validBuyPrice;
      payload.buyPrice = validBuyPrice;
    }
    if (validSellPrice !== undefined) {
      payload.newSellPrice = validSellPrice;
      payload.sellPrice = validSellPrice;
    }
    if (validPrice !== undefined) {
      payload.newPrice = validPrice;
      payload.price = validPrice;
    } else {
      if (validBuyPrice !== undefined && validSellPrice === undefined) {
        payload.newPrice = validBuyPrice;
      } else if (validSellPrice !== undefined && validBuyPrice === undefined) {
        payload.newPrice = validSellPrice;
      } else if (validBuyPrice !== undefined && validSellPrice !== undefined) {
        payload.newPrice = validBuyPrice;
      }
    }

    // If updateType is 'both' and one of the prices is missing, provide both to satisfy validation
    if (updateType === 'both') {
      if (payload.newBuyPrice !== undefined && payload.newSellPrice === undefined) {
        payload.newSellPrice = payload.newBuyPrice;
      } else if (payload.newSellPrice !== undefined && payload.newBuyPrice === undefined) {
        payload.newBuyPrice = payload.newSellPrice;
      }
    }

    if (qtyRaw !== undefined && qtyRaw !== null && qtyRaw !== '') {
      payload.newQty = Number(qtyRaw) || qtyRaw;
      payload.qty = Number(qtyRaw) || qtyRaw;
    }

    try {
      const response = await api.put(`${prefix}/editorder`, payload);
      return response.data;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        try {
          const resParam = await api.put(`${prefix}/editorder`, payload);
          return resParam.data;
        } catch (_) { }
      }
      throw err;
    }
  } catch (error: any) {
    console.error('Error editing entry/order:', error);
    throw error;
  }
};

/**
 * Entry Delete API (Uses /revert endpoint: PUT /master-broker/customer/revert or /company/customer/revert)
 */
export const deleteEntry = async (
  orderIdOrPayload: any,
  maybeRole?: string,
  maybePayload?: any
) => {
  try {
    let orderId: string | number | undefined;
    let payload: any = {};
    let role: string | undefined = maybeRole;

    if (typeof orderIdOrPayload === 'object' && orderIdOrPayload !== null) {
      payload = orderIdOrPayload;
      role = typeof maybeRole === 'string' ? maybeRole : undefined;
    } else {
      orderId = orderIdOrPayload;
      payload = typeof maybePayload === 'object' && maybePayload !== null ? maybePayload : {};
      role = maybeRole;
    }

    const prefix = getEndpointPrefix(role);
    const body: any = {
      ...(payload || {}),
    };

    if (orderId && !body.orderId) {
      body.orderId = orderId;
    }
    if ('buyOrderId' in payload) body.buyOrderId = payload.buyOrderId;
    if ('sellOrderId' in payload) body.sellOrderId = payload.sellOrderId;
    if ('buyId' in payload) body.buyId = payload.buyId;
    if ('sellId' in payload) body.sellId = payload.sellId;

    try {
      const response = await api.put(`${prefix}/revert`, body);
      return response.data;
    } catch (err: any) {
      if (prefix === '/company/customer') {
        try {
          const res = await api.put(`/company/customer/revert`, body);
          return res.data;
        } catch (_) { }
      }
      try {
        const resDel = await api.delete(`${prefix}/deleteorder/${orderId}`);
        return resDel.data;
      } catch (_) { }
      throw err;
    }
  } catch (error: any) {
    console.error('Error deleting entry:', error);
    throw error;
  }
};

/**
 * Hook for closing a position
 */
export const useClosePosition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
      role,
    }: {
      orderId: string | number;
      payload?: any;
      role?: string;
    }) => closePosition(orderId, payload, role),
    onSuccess: (data) => {
      const message = data?.message || 'Position closed successfully!';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['transaction-ledger'] });
      queryClient.refetchQueries({ queryKey: ['transaction-ledger'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to close position!';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for reversing a trade entry
 */
export const useReverseEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
      role,
    }: {
      orderId: string | number;
      payload?: any;
      role?: string;
    }) => reverseEntry(orderId, payload, role),
    onSuccess: (data) => {
      const message = data?.message || 'Entry reversed successfully!';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['transaction-ledger'] });
      queryClient.refetchQueries({ queryKey: ['transaction-ledger'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to reverse entry!';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for editing a trade entry
 */
export const useEditEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      data,
      role,
    }: {
      orderId: string | number;
      data: any;
      role?: string;
    }) => editEntry(orderId, data, role),
    onSuccess: (data) => {
      const message = data?.message || 'Rate updated successfully!';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['transaction-ledger'] });
      queryClient.refetchQueries({ queryKey: ['transaction-ledger'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to update entry!';
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook for deleting a trade entry
 */
export const useDeleteEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
      role,
    }: {
      orderId: string | number;
      payload?: any;
      role?: string;
    }) => deleteEntry(orderId, role, payload),
    onSuccess: (data) => {
      const message = data?.message || 'Entry deleted successfully!';
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['transaction-ledger'] });
      queryClient.refetchQueries({ queryKey: ['transaction-ledger'] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to delete entry!';
      toast.error(errorMessage);
    },
  });
};
