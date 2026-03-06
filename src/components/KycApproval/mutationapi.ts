import {api} from '@/utils/axios';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {KYCRequest, KYCStatus} from './kyctypes';

export const KYC_QUERY_KEY = ['kyc-requests'];

// Helper function to map API response to KYCRequest format
const mapToKYCRequest = (item: any): KYCRequest => {
  const submissionDate = new Date(item.createdAt);
  const formattedDate = submissionDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = submissionDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Determine KYC status based on user data
  let status: KYCStatus = 'Pending';
  if (item.user?.isVerified) {
    status = 'Completed';
  } else if (item.user?.isRejected) {
    status = 'Action Required';
  } else if (item.isKycCompleted === false) {
    status = 'In-Review';
  }

  // Get document type (prefer aadharCard, then panCard, then passport)
  let documentType = 'Aadhaar Card';
  let documentNumber = item.aadharCardNumber || 'N/A';

  if (item.panCard && !item.aadharCard) {
    documentType = 'PAN Card';
    documentNumber = item.panCardNumber || 'N/A';
  } else if (item.passport && !item.aadharCard && !item.panCard) {
    documentType = 'Passport';
    documentNumber = item.passportNumber || 'N/A';
  }

  // Format aadhaar number for display (masked)
  const maskedAadhaar =
    documentNumber !== 'N/A' && documentNumber.length >= 4
      ? `XXXX XXXX ${documentNumber.slice(-4)}`
      : 'XXXX XXXX XXXX';

  return {
    ...item,
    legalName: item.user?.fullname || 'Unknown',
    email: item.user?.email || 'N/A',
    submissionDate: formattedDate,
    submissionTime: formattedTime,
    aadhaarNumber: maskedAadhaar,
    documentType: documentType,
    status: status,
    dob: item.user?.dob || 'N/A',
    nationality: item.country || 'India',
    taxId: item.panCardNumber || 'N/A',
    address: `${item.address || ''}, ${item.city || ''}, ${item.state || ''}, ${item.country || ''} - ${item.pincode || ''}`,
    phoneNumber: item.user?.phoneNumber || 'N/A',
    occupation: 'N/A',
    bankName: item.bank_Name || 'N/A',
    accountNumber: item.accountNumber || 'N/A',
    ifscCode: item.Routing_IFSC || 'N/A',
    nomineeName: item.Nominee_Name || 'N/A',
    nomineeRelationship: item.Relationship || 'N/A',
  };
};

// API function for fetching all KYC requests
export const getAllKYCRequests = async () => {
  try {
    const response = await api.get(`/admin/customer`);

    // Handle response structure
    if (response.data?.statusCode === 200 && response.data?.data) {
      const mappedData = response.data.data.map(mapToKYCRequest);
      return mappedData;
    } else if (Array.isArray(response.data)) {
      return response.data.map(mapToKYCRequest);
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data.map(mapToKYCRequest);
    } else {
      console.error('Unexpected response format:', response.data);
      return [];
    }
  } catch (error: any) {
    console.error('Error fetching KYC requests:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch KYC requests';
    toast.error(errorMessage);
    throw error;
  }
};

// useQuery hook for fetching KYC requests
export const useGetAllKYCRequests = () => {
  return useQuery({
    queryKey: KYC_QUERY_KEY,
    queryFn: getAllKYCRequests,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

// API function for fetching single KYC request by ID
export const getKYCRequestById = async (id: string) => {
  try {
    const response = await api.get(`/admin/customer/${id}`);

    if (response.data?.statusCode === 200 && response.data?.data) {
      return mapToKYCRequest(response.data.data);
    } else {
      return mapToKYCRequest(response.data);
    }
  } catch (error: any) {
    console.error('Error fetching KYC request:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch KYC request details';
    toast.error(errorMessage);
    throw error;
  }
};

// useQuery hook for fetching single KYC request
export const useGetKYCRequestById = (id: string) => {
  return useQuery({
    queryKey: ['kyc-request', id],
    queryFn: () => getKYCRequestById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// API function for approving KYC
export const approveKYC = async ({id}: {id: string}) => {
  try {
    const response = await api.put(`/admin/customer/accept/${id}`);

    toast.success('KYC approved successfully');
    return response.data;
  } catch (error: any) {
    console.error('Error approving KYC:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to approve KYC';
    toast.error(errorMessage);
    throw error;
  }
};

// API function for rejecting KYC with note
export const rejectKYC = async ({id, note}: {id: string; note: string}) => {
  try {
    const response = await api.put(`/admin/customer/reject/${id}`, {
      note,
    });

    toast.success('KYC rejected successfully');
    return response.data;
  } catch (error: any) {
    console.error('Error rejecting KYC:', error);
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to reject KYC';
    toast.error(errorMessage);
    throw error;
  }
};

// useMutation hook for approving KYC
export const useApproveKYC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveKYC,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({queryKey: KYC_QUERY_KEY});
    },
  });
};

// useMutation hook for rejecting KYC
export const useRejectKYC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectKYC,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({queryKey: KYC_QUERY_KEY});
    },
  });
};
