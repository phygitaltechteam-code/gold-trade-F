export interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  icon: string;
  colorClass: string;
  iconBgClass: string;
}

export interface BankCard {
  id: string;
  type: string;
  balance: number;
  currency: string;
  isPrimary: boolean;
  theme: 'orange' | 'dark';
}

export interface ActionItem {
  id: string;
  label: string;
  icon: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
}
