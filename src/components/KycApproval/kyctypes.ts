export type KYCStatus = 'Pending' | 'In-Review' | 'Action Required' | 'Completed';

export interface KYCRequest {
  id: string;
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
}

export interface DashboardStats {
  totalRequests: number;
  newToday: number;
  pendingApprovals: number;
  completedKyc: number;
  approvalRate: number;
}
