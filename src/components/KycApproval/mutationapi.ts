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
  } else if (item.isKycCompleted === false || item.isKycCompleted === null) {
    status = 'In-Review';
  }

  // Get document type and number
  let documentType = 'Aadhaar Card';
  let documentNumber = item.aadharCardNumber || 'N/A';
  let documentImage = item.aadharCard;

  if (item.panCard && !item.aadharCard) {
    documentType = 'PAN Card';
    documentNumber = item.panCardNumber || 'N/A';
    documentImage = item.panCard;
  } else if (item.passport && !item.aadharCard && !item.panCard) {
    documentType = 'Passport';
    documentNumber = item.passportNumber || 'N/A';
    documentImage = item.passport;
  }

  // Format aadhaar number for display (masked)
  const maskedAadhaar =
    documentNumber !== 'N/A' && documentNumber.length >= 4
      ? `XXXX XXXX ${documentNumber.slice(-4)}`
      : 'XXXX XXXX XXXX';

  // Build address from components
  const fullAddress = [
    item.address,
    item.city,
    item.state,
    item.country,
    item.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  return {
    id: item.id,
    userId: item.userId,
    CRN: item.CRN,
    legalName: item.user?.fullname || 'Unknown',
    email: item.user?.email || 'N/A',
    submissionDate: formattedDate,
    submissionTime: formattedTime,
    aadhaarNumber: maskedAadhaar,
    documentType: documentType,
    status: status,
    dob: item.user?.dob || 'Not provided',
    nationality: item.country || 'India',
    taxId: item.panCardNumber || 'N/A',
    address: fullAddress || 'Not provided',
    phoneNumber: item.user?.phoneNumber || 'N/A',
    occupation: 'N/A',
    bankName: item.bank_Name || 'Not provided',
    accountNumber: item.Account_Number || 'N/A',
    ifscCode: item.Routing_IFSC || 'N/A',
    nomineeName: item.Nominee_Name || 'Not provided',
    nomineeRelationship: item.Relationship || 'Not provided',
    createdAt: item.createdAt,
    aadharCard: item.aadharCard,
    panCard: item.panCard,
    passport: item.passport,
    user: item.user,
    isKycCompleted: item.isKycCompleted,
    photo: item.photo,
    brokeragePercent: item.brokeragePercent,
    companyId: item.companyId,
    brokerId: item.brokerId,
  };
};

// API function for fetching all KYC requests
export const getAllKYCRequests = async () => {
  try {
    const response = await api.get(`/company/customer`);

    console.log('API Response:', response.data);

    // Handle the response structure: statusCode 200 with data array
    if (
      response.data?.statusCode === 200 &&
      Array.isArray(response.data?.data)
    ) {
      const mappedData = response.data.data.map(mapToKYCRequest);
      console.log('Mapped KYC Requests:', mappedData.length);
      return mappedData;
    }

    // Fallback for other possible response structures
    if (Array.isArray(response.data)) {
      return response.data.map(mapToKYCRequest);
    }

    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data.map(mapToKYCRequest);
    }

    console.warn('Unexpected response format:', response.data);
    return [];
  } catch (error: any) {
    console.error('Error fetching KYC requests:', error);
    throw error;
  }
};

// API function for fetching single KYC request by ID
export const getKYCRequestById = async (id: string) => {
  try {
    const response = await api.get(`/company/customer/${id}`);

    console.log('Single KYC Response:', response.data);

    // Handle response structure
    if (response.data?.statusCode === 200 && response.data?.data) {
      return mapToKYCRequest(response.data.data);
    }

    if (response.data?.data) {
      return mapToKYCRequest(response.data.data);
    }

    return mapToKYCRequest(response.data);
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

// useQuery hook for fetching KYC requests
export const useGetAllKYCRequests = () => {
  return useQuery({
    queryKey: KYC_QUERY_KEY,
    queryFn: getAllKYCRequests,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
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
    const response = await api.put(`/company/customer/accept/${id}`);

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
    const response = await api.put(`/company/customer/reject/${id}`, {
      note: note,
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
      queryClient.invalidateQueries({queryKey: KYC_QUERY_KEY});
    },
  });
};
