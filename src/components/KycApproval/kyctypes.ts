export type KYCStatus =
  | 'Pending'
  | 'In-Review'
  | 'Action Required'
  | 'Completed';

export interface User {
  fullname: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  dob: string | null;
  isVerified: boolean;
  isRejected: boolean;
}

export interface Wallet {
  id: string;
  customerId: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface KYCRequest {
  id: string;
  userId: string;
  passport: string | null;
  aadharCard: string | null;
  panCard: string | null;
  passportNumber: string | null;
  aadharCardNumber: string | null;
  panCardNumber: string | null;
  accountNumber: string;
  address: string;
  city: string;
  photo: string;
  state: string;
  country: string;
  pincode: string;
  rejectedReason: string | null;
  bank_Name: string | null;
  Routing_IFSC: string | null;
  Account_Type: string | null;
  createdAt: string;
  updatedAt: string;
  Nominee_Name: string | null;
  Relationship: string | null;
  Contact: string | null;
  Allocation: string | null;
  isKycCompleted: boolean | null;
  user: User;
  wallets: Wallet;
  _count: {
    senderTransactions: number;
  };
  // Computed fields for display
  legalName?: string;
  email?: string;
  submissionDate?: string;
  submissionTime?: string;
  aadhaarNumber?: string;
  documentType?: string;
  status?: KYCStatus;
  dob?: string;
  nationality?: string;
  taxId?: string;
  phoneNumber?: string;
  occupation?: string;
  bankName?: string;
  ifscCode?: string;
  nomineeName?: string;
  nomineeRelationship?: string;
}

export interface DashboardStats {
  totalRequests: number;
  newToday: number;
  pendingApprovals: number;
  completedKyc: number;
  approvalRate: number;
}
