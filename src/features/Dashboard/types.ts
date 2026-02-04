/* eslint-disable */
export interface Transaction {
  id: string;
  walletId: string;
  particular: string;
  receiverId: string | null;
  senderId: string | null;
  beneficiaryId: string | null;
  amount: number;
  amountType: string;
  accountType: string;
  type: 'CREDIT' | 'DEBIT';
  rejectReason: string | null;
  isPending: boolean;
  isRejected: boolean;
  createdAt: string;
  updatedAt: string;
  title?: string;
  date?: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
  category?: string;
  icon?: any;
  iconBgClass?: string;
  colorClass?: string;
  badgeClass?: string;
  amountColor?: string;
}

export interface User {
  fullname: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  dob: string | null;
  isVerified: boolean;
  isRejected: boolean;
}

export interface ApiTransactionResponse {
  id: string;
  walletId: string;
  particular: string;
  receiverId: string | null;
  senderId: string | null;
  beneficiaryId: string | null;
  amount: number;
  amountType: string;
  accountType: string;
  type: 'CREDIT' | 'DEBIT';
  rejectReason: string | null;
  isPending: boolean;
  isRejected: boolean;
  createdAt: string;
  updatedAt: string;
  beneficiary: any | null;
  user: User;
}
export interface ApiTransaction {
  id: string;
  walletId: string;
  particular: string;
  receiverId: string | null;
  senderId: string | null;
  beneficiaryId: string | null;
  amount: number;
  amountType: string;
  accountType: string;
  type: string;
  rejectReason: string | null;
  isPending: boolean;
  isRejected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiWallet {
  id: string;
  eprivateAccount: number;
  temporyAccount: number;
}

export interface ApiDashboardData {
  wallet: ApiWallet;
  transactions: ApiTransaction[];
}

export interface DashboardResponse {
  statusCode: number;
  status: boolean;
  message: string;
  data: ApiDashboardData;
  errors: null;
}
