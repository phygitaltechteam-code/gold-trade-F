import React from 'react';
import {
  MdSend,
  MdReceiptLong,
  MdQrCodeScanner,
  MdAddCircle,
  MdWallet,
  MdOutlineCurrencyExchange,
} from 'react-icons/md';
import {useNavigate} from '@tanstack/react-router';
import {ActionItem} from '../types';

const actions: ActionItem[] = [
  {id: 'topup', label: 'Top Up', icon: MdAddCircle},
  {
    id: 'currency',
    label: 'Currency Converter',
    icon: MdOutlineCurrencyExchange,
  },
  {id: 'withdraw', label: 'Withdraw', icon: MdWallet},
  {id: 'transactions', label: 'Transactions', icon: MdReceiptLong},
];

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const handleActionClick = (actionId: string) => {
    switch (actionId) {
      case 'topup':
        navigate({to: '/wallet/toupscreen'});
        break;
      case 'withdraw':
        navigate({to: '/topupwithdrawl/walletwithdrawl'});
        break;

      case 'transactions':
        navigate({to: '/wallet/paymentdashbord'});
        // Handle bills navigation
        break;
      case 'currency':
        navigate({to: '/currencyconverter'});

        // Handle scan navigation
        break;
      default:
        break;
    }
  };

  return (
    <div className="px-6 py-6">
      <div className="grid grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.id)}
              className="group flex flex-col items-center gap-2 outline-none"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-200 group-active:scale-90 dark:bg-primary/20">
                <Icon size={28} />
              </div>

              <span className="text-xs font-medium text-slate-600 transition-colors group-hover:text-primary dark:text-slate-300">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
