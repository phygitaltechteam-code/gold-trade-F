/*eslint-disable*/
export interface Transaction {
  id: string;
  particular: string;
  amount: number;
  amountType: string;
  type: 'CREDIT' | 'DEBIT';
  isPending: boolean;
  isRejected: boolean;
  rejectReason?: string | null;
  createdAt: string;
  beneficiary?: {
    fullName: string;
    accountNumber: string;
  } | null;
  accountType: 'E_PRIVATEACCOUNT' | 'E_TEMPORYACCOUNT';
}

export interface Wallet {
  id: string;
  customerId: string;
  eprivateAccount: number;
  eINRbalance: number;
  eUSDbalance: number;
  temporyAccount: number;
  temporyINRbalance: number;
  temporyUSDbalance: number;
  pendingTransfered: number;
  pendingTopup: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse {
  statusCode: number;
  status: boolean;
  message: string;
  data: {
    transactions: Transaction[];
    wallet: Wallet;
  };
  errors: null | any;
}

export interface ReportData {
  from: string;
  to: string;
  format: 'pdf' | 'csv' | 'excel';
  accountType?: 'E_PRIVATEACCOUNT' | 'E_TEMPORYACCOUNT';
}

// Add this new interface for the response structure you're using
export interface TransactionResponse {
  transactions: Transaction[];
  wallet: Wallet;
}
