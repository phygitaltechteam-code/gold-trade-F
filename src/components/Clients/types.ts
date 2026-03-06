import { LucideIcon } from "lucide-react";

export type ClientStatus = 'Active' | 'Suspended' | 'Pending Review';

export interface Client {
  id: string;
  name: string;
  email: string;
  avatar: string;
  assetUnderControl: number;
  balance: number;
  totalPnL: number;
  status: ClientStatus;
  uid: string;
  phone: string;
  joinedDate: string;
  region: string;
  kycLevel: number;
  address: string;
  dob: string;
  nationality: string;
  taxId: string;
  bankName: string;
  accountNumber: string;
  routingIfsc: string;
  accountType: string;
  nomineeName: string;
  nomineeRelationship: string;
  nomineeContact: string;
  nomineeAllocation: string;
}

export interface Transaction {
  id: string;
  type: 'Deposit' | 'Buy Gold' | 'Fee' | 'Withdrawal' | 'Dividend';
  description: string;
  amount: number;
  dateTime: string;
  balanceAfter: number;
}
