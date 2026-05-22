export type KYCStatus =
  | 'Pending'
  | 'In-Review'
  | 'Action Required'
  | 'Completed';

export interface KYCRequest {
  id: string;
  userId?: string;
  CRN?: string;
  legalName: string;
  email: string;
  submissionDate: string;
  submissionTime: string;
  aadhaarNumber: string;
  documentType: string;
  status: KYCStatus;
  dob: string;
  nationality: string;
  taxId: string;
  address: string;
  phoneNumber: string;
  occupation: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  nomineeName: string;
  nomineeRelationship: string;
  createdAt?: string;
  aadharCard?: string | null;
  panCard?: string | null;
  passport?: string | null;
  photo?: string | null;
  user?: {
    id?: string;
    fullname: string;
    email: string;
    phoneNumber: string;
    isActive?: boolean;
    isVerified: boolean;
    isRejected: boolean;
    dob?: string | null;
  };
  aadharCardNumber?: string | null;
  panCardNumber?: string | null;
  passportNumber?: string | null;
  country?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isKycCompleted?: boolean | null;
  brokeragePercent?: string;
  companyId?: string;
  brokerId?: string;
}

export interface DashboardStats {
  totalRequests: number;
  newToday: number;
  pendingApprovals: number;
  completedKyc: number;
  approvalRate: number;
}
