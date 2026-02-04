import React, {useState} from 'react';
import {MdExpandMore} from 'react-icons/md';
import {SetSelectedWalletType, walletAmmount} from '../Pages/PaymentWrapper';

type props = {
  walletAmmount: walletAmmount;
  setSelectedWalletType: SetSelectedWalletType;
  selectedWalletType: string;
};

const AccountSelector: React.FC<props> = ({
  walletAmmount,
  selectedWalletType,
  setSelectedWalletType,
}) => {
  const [open, setOpen] = useState(false);

  const wallets = [
    {
      type: 'E_PRIVATEACCOUNT',
      label: 'E Private Account',
      amount: walletAmmount.E_PRIVATEACCOUNT,
    },
    {
      type: 'E_TEMPORYACCOUNT',
      label: 'Temporary Account',
      amount: walletAmmount.E_TEMPORYACCOUNT,
    },
  ];

  const selectedWallet = wallets.find((w) => w.type === selectedWalletType);

  return (
    <div className="relative mb-8 w-fit">
      {/* Selected wallet */}
      <button
        onClick={() => setOpen(!open)}
        className="group flex w-fit items-center gap-3 rounded-full border border-white/60 bg-white/80 py-2 pl-2 pr-4 shadow backdrop-blur-sm transition-all"
      >
        <div className="flex h-8 w-12 items-center justify-center rounded bg-slate-100">
          💼
        </div>

        <div className="flex flex-col items-start">
          <p className="text-swiss-navy text-xs font-semibold">
            {selectedWallet?.label}
          </p>
          <p className="text-[10px] text-slate-500">
            ₹{selectedWallet?.amount} Available
          </p>
        </div>

        <MdExpandMore
          className={`ml-1 text-xl transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-10 mt-2 w-full rounded-xl bg-white shadow">
          {wallets.map((wallet) => (
            <div
              key={wallet.type}
              onClick={() => {
                setSelectedWalletType(wallet.type);
                setOpen(false);
              }}
              className={`cursor-pointer px-4 py-2 text-sm hover:bg-slate-100 ${
                wallet.type === selectedWalletType
                  ? 'bg-primary/10 font-semibold'
                  : ''
              }`}
            >
              <div>{wallet.label}</div>
              <div className="text-xs text-slate-500">
                ₹{wallet.amount} Available
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountSelector;
