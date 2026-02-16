import React, {useState} from 'react';
import {MdExpandMore} from 'react-icons/md';

interface CurrencySelectorProps {
  accountType: 'E_PRIVATEACCOUNT' | 'E_TEMPORYACCOUNT';
  setAccountType: (type: 'E_PRIVATEACCOUNT' | 'E_TEMPORYACCOUNT') => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  accountType,
  setAccountType,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Map account type to display label
  const accountLabel =
    accountType === 'E_PRIVATEACCOUNT'
      ? ' E Private Account'
      : 'Temporarily Virtual Account';

  return (
    <div className="relative mb-6">
      <button
        className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 shadow-sm transition-colors hover:bg-slate-50 active:scale-95"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative flex h-4 w-6 items-center justify-center overflow-hidden rounded-sm bg-blue-800 text-[8px] text-white shadow-sm">
          {/* Simple CSS US Flag Approximation */}
          <div className="absolute inset-0 flex flex-col">
            <div className="mt-1 h-[2px] w-full bg-white opacity-20"></div>
            <div className="mt-1 h-[2px] w-full bg-white opacity-20"></div>
          </div>
        </div>
        <span className="text-sm text-slate-600">({accountLabel})</span>
        <MdExpandMore className="text-lg text-slate-500" />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-xl border border-slate-100 bg-white py-1 shadow-lg">
          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-slate-50"
            onClick={() => {
              setAccountType('E_PRIVATEACCOUNT');
              setIsOpen(false);
            }}
          >
            <span className="ml-2 text-slate-600"> E Private Account</span>
          </button>
          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm hover:bg-slate-50"
            onClick={() => {
              setAccountType('E_TEMPORYACCOUNT');
              setIsOpen(false);
            }}
          >
            <span className="ml-2 text-slate-600">
              Temporarily Virtual Account
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
