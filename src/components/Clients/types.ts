export interface User {
  fullname: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  dob: string | null;
  isVerified: boolean;
  isRejected: boolean;
  isDemo: boolean;
}

export interface Wallet {
  id: string;
  customerId: string;
  amount: number | string;
  blockedAmount?: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Client {
  id: string;
  userId: string;
  passport: string;
  aadharCard: string;
  panCard: string;
  commission?: string;
  area?: string;
  address: string;
  passportNumber: string;
  aadharCardNumber: string | null;
  panCardNumber: string | null;
  accountNumber?: string;
  city: string;
  photo: string;
  state: string;
  country: string;
  pincode: string;
  securityPin: string;
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
  isKycCompleted: boolean | string | null;
  user: User;
  wallets: Wallet;
  walletBalance?: number;
  marginAmount?: number;
  assetUnderControl?: number;
  totalActiveTrade?: number;
  totalTrade?: number;
  pnl?: number;
  isDemo?: boolean;
  totalUnrealizedPnL?: number;
  totalRealizedPnL?: number;
  totalEquity?: number;
  _count?: {
    trades?: number;
    senderTransactions?: number;
  };
  broker?: {
    user: {
      fullname: string;
      email?: string;
      phoneNumber?: string;
    };
    superBroker?: {
      user: {
        fullname: string;
        email?: string;
        phoneNumber?: string;
      };
    };
  };
  superBroker?: {
    user: {
      fullname: string;
      email?: string;
      phoneNumber?: string;
    };
  };
}

export type ClientStatus = 'Active' | 'Suspended' | 'Pending Review';

export interface Transaction {
  id: string;
  type: 'Deposit' | 'Withdrawal' | 'Buy Gold' | 'Sell Gold';
  description: string;
  amount: number;
  dateTime: string;
  balanceAfter: number;
}

