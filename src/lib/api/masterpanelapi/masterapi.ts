import { api } from "@/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useGetMasterClients = () => {
  return useQuery({
    queryKey: ['clients'],

    queryFn: async () => {

      const response = await api.get('/master-broker/customer');

      console.log('GET Client', response);
      return response.data;
    },
  });
};

export const getMasterClientById = async (id: string) => {
  const response = await api.get(`/master-broker/customer/${id}`);
  console.log('GET Client By ID', response.data);
  return response.data;
};

export const useGetMasterClientById = (id: string) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => getMasterClientById(id),
    enabled: !!id,
  });
};



export const useMasterSendDeposite = () => {
  return useMutation({
    mutationFn: async (data: {
      amount: number;
      securityPin: string;
      customerId: string;
    }) => {
      const response = await api.post(
        `/master-broker/customer/${data.customerId}/deposite`,
        data,
      );
      return response.data;
    },
  });
};

export const useSendWithdraw = () => {
  return useMutation({
    mutationFn: async (data: {
      amount: number;
      securityPin: string;
      customerId: string;
    }) => {
      const response = await api.post(
        `/master-broker/customer/${data.customerId}/withdraw`,
        data,
      );
      return response.data;
    },
  });
};

export const addMargin = async (data: {
  customerId: string;
  intradayLeverage: number;
  deliveryLeverage: number;
  securityPin: string;
}) => {
  try {
    const response = await api.post(
      `/master-broker/customer/${data.customerId}/margin`,
      {
        intradayLeverage: data.intradayLeverage,
        deliveryLeverage: data.deliveryLeverage,
        securityPin: data.securityPin,
      },
    );
    return response;
  } catch (error) {
    console.error('Error adding margin:', error);
    throw error;
  }
};

export const useAddMargin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addMargin,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['customer', 'client']});
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed to add margin';
      toast.error(errorMessage);
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({id, data}: {id: string; data: any}) => {
        console.log('data update', data , id);
      const response = await api.put(`/master-broker/customer/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Customer updated successfully!');
      queryClient.invalidateQueries({queryKey: ['customer']});
      queryClient.invalidateQueries({queryKey: ['client']});
      queryClient.invalidateQueries({queryKey: ['get-customer']});
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed to update customer';
      toast.error(errorMessage);
    },
  });
};

export const useGetTransactionLedger = () => {
  return useQuery({
    queryKey: ['transaction-ledger'],
    queryFn: () => api.get('/master-broker/profile/transaction-ledger'),
  });
};




export const useGetWithdrawal = () =>
  useQuery({
    queryKey: ['withdrawal'],
    queryFn: () => getWithdrawal(),
  });

export const useApproveWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveWithdrawal(id),

    onSuccess: () => {
      toast.success('Approves Succesfully!');
      queryClient.invalidateQueries({queryKey: ['withdrawal']});
    },
    onError: () => {
      toast.error('Failed To Approve!');
    },
  });
};

// export const useRejectWithdrawal = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (id: string) => rejectWithdrawal(id),

//     onSuccess: () => {
//       toast.success('Rejected Succesfully!');
//       queryClient.invalidateQueries({queryKey: ['withdrawal']});
//     },
//     onError: () => {
//       toast.error('Failed To Reject!');
//     },
//   });
// };


export const useRejectWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      reason,
    }: {
      id: string;
      reason: string;
    }) => rejectWithdrawal(id, reason),

    onSuccess: () => {
      toast.success('Rejected Successfully!');
      queryClient.invalidateQueries({ queryKey: ['withdrawal'] });
    },

    onError: () => {
      toast.error('Failed To Reject!');
    },
  });
};



  
  
 // widraw request

 
 export const getWithdrawal = async () => {
   try {
     const response = await api.get(`/master-broker/commission/withdrawals/pending`);
     return response.data;
   } catch (error) {
     console.error('Error fetching withdrawal:', error);
     throw error;
   }
 };
 
 export const approveWithdrawal = async (id: string) => {
   try {
     const response = await api.patch(
       `/master-broker/commission/withdrawals/${id}/approve`,
     );
     return response.data;
   } catch (error) {
     console.error('Error approve withdrawal:', error);
     throw error;
   }
 };
 
 // export const rejectWithdrawal = async (id: string) => {
 //   try {
 //     const response = await api.patch(
 //       `/company/commission/withdrawals/${id}/reject`,
 
 //     );
 //     return response.data;
 //   } catch (error) {
 //     console.error('Error reject withdrawal:', error);
 //     throw error;
 //   }
 // };
 
 export const rejectWithdrawal = async (
   id: string,
   reason: string
 ) => {
   try {
     const response = await api.patch(
       `/master-broker/commission/withdrawals/${id}/reject`,
       {
         reason,
       }
     );
 
     return response.data;
   } catch (error) {
     console.error('Error reject withdrawal:', error);
     throw error;
   }
 };
 

 // customer 

 // lib/api/customer.ts
 
 export const getAllCustomer = async () => {
   try {
     const response = await api.get(`master-broker/customer`);
     return response.data;
   } catch (error) {
     console.error('Error fetching customers:', error);
     throw error;
   }
 };
 
 export const getCustomerById = async (id: string) => {
   try {
     const response = await api.get(`master-broker/customer/${id}`);
     return response.data;
   } catch (error) {
     console.error('Error fetching customers:', error);
     throw error;
   }
 };
 
 // FIXED: Changed from /accept/${id} to /${id}/verify
 export const acceptTheCustomer = async (id: string) => {
   try {
     const response = await api.put(`master-broker/customer/${id}/verify`);
     return response.data;
   } catch (error) {
     console.error('Error to accept customer:', error);
     throw error;
   }
 };
 
 export const rejectTheCustomer = async (id: string, note: string) => {
   try {
     const response = await api.put(`master-broker/customer/reject/${id}`, {
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
     const response = await api.delete(`master-broker/customer/${id}`);
     return response.data;
   } catch (error) {
     console.error('Error deleting customer:', error);
     throw error;
   }
 };
 
 export const updateCustomer = async (id: string, data: any) => {
   try {
     const response = await api.put(`master-broker/customer/${id}`, data);
     return response.data;
   } catch (error) {
     console.error('Error updating customer:', error);
     throw error;
   }
 };
 




//  export const useGetCustomer = () =>
//    useQuery({
//      queryKey: ['customer'],
//      queryFn: () => getAllCustomer(),
//    });



export const useGetCustomer = () =>
  useQuery({
    queryKey: ['customer'],
    queryFn: () => getAllCustomer(),
  });

export const useGetCustomerById = (id: string) =>
  useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });

// Updated to use the verify endpoint
export const useAcceptCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => acceptTheCustomer(id),

    onSuccess: () => {
      toast.success('Customer Verified Successfully!');
      queryClient.invalidateQueries({queryKey: ['customer']});
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed To Verify Customer!';
      toast.error(errorMessage);
    },
  });
};

export const useRejectCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, note}: {id: string; note: string}) =>
      rejectTheCustomer(id, note),

    onSuccess: () => {
      toast.success('Customer Rejected Successfully!');
      queryClient.invalidateQueries({queryKey: ['customer']});
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed To Reject Customer!';
      toast.error(errorMessage);
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),

    onSuccess: () => {
      toast.success('Customer Deleted Successfully!');
      queryClient.invalidateQueries({queryKey: ['customer']});
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || 'Failed To Delete Customer!';
      toast.error(errorMessage);
    },
  });
};

// export const useUpdateCustomer = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({id, data}: {id: string; data: any}) =>
//       updateCustomer(id, data),

//     onSuccess: () => {
//       toast.success('Customer Updated Successfully!');
//       queryClient.invalidateQueries({queryKey: ['customer']});
//     },
//     onError: (error: any) => {
//       const errorMessage =
//         error?.response?.data?.message || 'Failed To Update Customer!';
//       toast.error(errorMessage);
//     },
//   });
// };

export const useGetPendingBrokers = (id: string) => {
  return useQuery({
    queryKey: ['pending-brokers'],
    queryFn: () => getPendingBrokers(id),
  });
};

export const getPendingBrokers = async (id: string) => {
  const response = await api.get(`/company/broker/${id}`);
  return response.data;
};


export const useActivateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, pin}: {id: string; pin: string}) =>
      activeCustomer(id, pin),

    onSuccess: () => {
      toast.success('Status Changes!');
      queryClient.invalidateQueries({queryKey: ['customer']});
    },
    onError: () => {
      toast.error('Failed To Change Status!');
    },
  });
};


export const activeCustomer = async (id: string, pin: string) => {
  try {
    const response = await api.put(`/master-broker/customer/${id}/active`, {
      securityPin: pin,
    });
    return response.data;
  } catch (error) {
    console.error('Error accept', error);
    throw error;
  }
};