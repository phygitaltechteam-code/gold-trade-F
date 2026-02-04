import React, {useState, useCallback} from 'react';
import {MdArrowBack, MdArrowForward, MdEditNote} from 'react-icons/md';
import AccountSelector from '../Components/AccountSelector';
import CurrencySelector from '../Components/CurrencySelector';
import AmountDisplay from '../Components/AccountDisplay';
import Keypad from '../Components/KeyPad';
import {useNavigate} from '@tanstack/react-router';
import {
  PaymentData,
  SetPaymentData,
  SetSelectedWalletType,
  StepProps,
  walletAmmount,
} from './PaymentWrapper';
import toast from 'react-hot-toast';

export type WalletType = 'E_PRIVATEACCOUNT' | 'E_TEMPORYACCOUNT';
type props = StepProps & {
  paymentData: PaymentData;
  setPaymentData: SetPaymentData;
  walletAmmount: walletAmmount;
  setSelectedWalletType: SetSelectedWalletType;
  selectedWalletType: WalletType;
};

const PaymentSend: React.FC<props> = ({
  paymentData,
  setPaymentData,
  nextStep,
  prevStep,
  walletAmmount,
  selectedWalletType,
  setSelectedWalletType,
}) => {
  console.log('wallet ammountt', walletAmmount);
  console.log(selectedWalletType);
  const navigate = useNavigate();

  const selectedWalletBalance = walletAmmount?.[selectedWalletType] ?? 0;

  const enteredAmount = Number(paymentData.amount || 0);

  const isInsufficientBalance = enteredAmount > selectedWalletBalance;

  const handleKeyPress = useCallback(
    (key: string) => {
      setPaymentData((prev) => {
        const value = prev.amount || '';

        if (key === '.' && value.includes('.')) return prev;

        if (value === '0' && key !== '.') {
          const nextAmount = key;
          if (Number(nextAmount) > selectedWalletBalance) {
            toast.error('Insufficient wallet balance');
            return prev;
          }
          return {...prev, amount: nextAmount};
        }

        if (value === '' && key === '.') {
          return {...prev, amount: '0.'};
        }
        if (value.includes('.')) {
          const [, decimals] = value.split('.');
          if (decimals?.length >= 2) return prev;
        }
        if (value.replace('.', '').length >= 7) return prev;

        const nextAmount = value + key;

        if (Number(nextAmount) > selectedWalletBalance) {
          toast.error('Insufficient wallet balance');
          return prev;
        }

        return {
          ...prev,
          amount: nextAmount,
        };
      });
    },
    [selectedWalletBalance],
  );

  const handleBackspace = useCallback(() => {
    setPaymentData((prev) => {
      const value = prev?.amount;

      if (!value || value.length <= 1) {
        return {
          ...prev,
          amount: '',
        };
      }

      return {
        ...prev,
        amount: value.slice(0, -1),
      };
    });
  }, []);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f8f6f5] p-0 sm:p-4">
      <div className="bg-premium-pattern relative mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-[#f8f6f5] shadow-2xl ring-1 ring-black/5 sm:h-[884px] sm:rounded-[40px] sm:bg-white">
        <header className="relative z-10 mt-2 flex shrink-0 items-center justify-between px-4 py-4">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/50 active:scale-95"
            onClick={() => navigate({to: '/wallet/paymentdashbord'})}
          >
            <MdArrowBack className="text-swiss-navy text-2xl" />
          </button>
          <h2 className="text-swiss-navy flex-1 pr-10 text-center text-lg font-bold leading-tight">
            Send Money
          </h2>
        </header>
        <main className="no-scrollbar relative z-0 flex flex-1 flex-col items-center overflow-y-auto px-4 pb-4 pt-4">
          <AccountSelector
            selectedWalletType={selectedWalletType}
            setSelectedWalletType={setSelectedWalletType}
            walletAmmount={walletAmmount}
          />
          <CurrencySelector />
          <AmountDisplay amount={paymentData?.amount} />

          <div className="mb-8"></div>
          <div className="group relative mb-auto w-full max-w-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MdEditNote className="text-xl text-slate-400 transition-colors group-focus-within:text-primary" />
            </div>
            <input
              className="text-swiss-navy block w-full rounded-xl border-0 bg-white/70 py-3 pl-10 pr-4 shadow-sm outline-none backdrop-blur-sm transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              placeholder="Add a note (optional)"
              type="text"
            />
          </div>
        </main>

        <section className="z-20 rounded-t-[2.5rem] border-t border-white/50 bg-white/90 px-6 pb-8 pt-6 shadow-[0_-10px_40px_-10px_rgba(13,30,58,0.05)] backdrop-blur-md">
          <Keypad onKeyPress={handleKeyPress} onBackspace={handleBackspace} />

          <button
            // disabled={isInsufficientBalance || enteredAmount <= 0}
            className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-bold tracking-wide text-white shadow-lg shadow-primary/30 transition-all hover:bg-[#e06b2c] active:scale-[0.99]"
            onClick={() => {
              if (isInsufficientBalance || enteredAmount <= 0) {
                toast.error('Insufficient wallet balance');
                return;
              }

              nextStep();
            }}
          >
            Continue
            <MdArrowForward className="text-xl transition-transform group-hover:translate-x-1" />
          </button>
        </section>
      </div>
    </div>
  );
};

export default PaymentSend;
