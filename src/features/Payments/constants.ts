import {
  Landmark,
  Building2,
  PiggyBank,
  Banknote,
  GraduationCap,
} from 'lucide-react';
import {QuickContact, Recipient} from './types';

export const RECIPIENTS: Recipient[] = [
  {
    id: 'r1',
    name: 'Chase Bank',
    detail: 'Alice Smith • Checking ...4592',
    icon: Landmark,
    iconBgColor: 'bg-blue-600',
    iconColor: 'text-white',
    isFavorite: true,
  },
  {
    id: 'r2',
    name: 'Bank of America',
    detail: 'Robert Doe • Savings ...8821',
    icon: Building2,
    iconBgColor: 'bg-red-600',
    iconColor: 'text-white',
    isFavorite: false,
  },
  {
    id: 'r3',
    name: 'Citibank',
    detail: 'Landlord • Rent ...1102',
    icon: PiggyBank,
    iconBgColor: 'bg-teal-600',
    iconColor: 'text-white',
    isFavorite: false,
  },
  {
    id: 'r4',
    name: 'Wells Fargo',
    detail: 'Utilities • Electric ...3321',
    icon: Banknote,
    iconBgColor: 'bg-yellow-500',
    iconColor: 'text-white',
    isFavorite: false,
  },
  {
    id: 'r5',
    name: 'University Fund',
    detail: 'Tuition • Checking ...9982',
    icon: GraduationCap,
    iconBgColor: 'bg-purple-600',
    iconColor: 'text-white',
    isFavorite: false,
  },
];
