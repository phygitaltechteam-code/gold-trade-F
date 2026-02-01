/*eslint-disable*/
import {LucideIcon} from 'lucide-react';

export interface QuickContact {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline?: boolean;
}

export interface Recipient {
  id: string;
  name: string; // The bold title (e.g., Chase Bank)
  detail: string; // The subtext (e.g., Alice Smith • Checking ...4592)
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  isFavorite: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}
export interface KeypadButtonProps {
  value: string | number;
  onClick: (value: string | number) => void;
  isAction?: boolean;
}

export interface AccountData {
  id: string;
  name: string;
  number: string;
  balance: number;
}

export interface BeneficiaryFormData {
  fullName: string;
  relationship: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  bankCountry: string;
  currency: string;
  accountNumber: string;
  accountType: string;
  SWIFTBIC: string;
  IFSC: string;
  bankName: string;
  branchName: string;
  contryCode: String;
}

export interface ValidationError {
  field: string;
  message: string;
}
