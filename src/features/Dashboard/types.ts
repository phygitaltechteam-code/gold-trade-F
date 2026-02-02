import {IconType} from 'react-icons/lib';

export interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  icon: IconType;
  colorClass: string;
  iconBgClass: string;
  status?: 'Pending' | 'Approved' | 'Rejected';
  amountColor?: string;
  badgeClass?: string;
  accountType?: string;
  showAmount?: boolean;
  isRejected?: boolean;
  rejectReason?: string | null;
  rejectedDate?: string;
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
