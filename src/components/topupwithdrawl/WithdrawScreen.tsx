import React, {useState, useCallback} from 'react';
import {MdArrowBack, MdArrowForward, MdEditNote} from 'react-icons/md';
import {useNavigate} from '@tanstack/react-router';
import toast from 'react-hot-toast';

import {PaymentData, WalletAmount} from './TopupWithdrawlFlow'; // adjust import path
import CurrencySelector from '@/features/Payments/Components/CurrencySelector';
import AmountDisplay from '@/features/Payments/Components/AccountDisplay';
import {Keypad} from '../Profilehub/ui/Keypad';

type Props = {
  paymentData: PaymentData;
  setPaymentData: React.Dispatch<React.SetStateAction<PaymentData>>;
  nextStep: () => void;
  prevStep: () => void;
  walletAmmount?: WalletAmount; // optional with default
};

const WithdrawScreen: React.FC<Props> = ({
  paymentData,
  setPaymentData,
  nextStep,
  prevStep,
  walletAmmount = {E_PRIVATEACCOUNT: 0, E_TEMPORYACCOUNT: 0},
}) => {
  const navigate = useNavigate();

  // Only private account is used for top‑up withdrawals
  const privateBalance = walletAmmount.E_PRIVATEACCOUNT ?? 0;

  const enteredAmount = Number(paymentData.amount || 0);
  const isInsufficientBalance = enteredAmount > privateBalance;

  // ----- Keypad handlers -----
  const handleKeyPress = useCallback(
    (key: string) => {
      setPaymentData((prev) => {
        const value = prev.amount || '';

        // Prevent double decimal
        if (key === '.' && value.includes('.')) return prev;

        // Replace leading zero
        if (value === '0' && key !== '.') {
          const nextAmount = key;
          if (Number(nextAmount) > privateBalance) {
            toast.error('Insufficient wallet balance');
            return prev;
          }
          return {...prev, amount: nextAmount};
        }

        // Start with decimal
        if (value === '' && key === '.') {
          return {...prev, amount: '0.'};
        }

        // Limit to 2 decimal places
        if (value.includes('.')) {
          const [, decimals] = value.split('.');
          if (decimals?.length >= 2) return prev;
        }

        // Limit total digits (9 digits for crore range)
        if (value.replace('.', '').length >= 9) return prev;

        const nextAmount = value + key;
        if (Number(nextAmount) > privateBalance) {
          toast.error('Insufficient wallet balance');
          return prev;
        }

        return {...prev, amount: nextAmount};
      });
    },
    [privateBalance, setPaymentData],
  );

  const handleBackspace = useCallback(() => {
    setPaymentData((prev) => {
      const value = prev?.amount;
      if (!value || value.length <= 1) {
        return {...prev, amount: ''};
      }
      return {...prev, amount: value.slice(0, -1)};
    });
  }, [setPaymentData]);

  // ----- Continue -----
  const handleContinue = () => {
    if (isInsufficientBalance || enteredAmount <= 0) {
      toast.error('Insufficient wallet balance');
      return;
    }
    nextStep();
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f8f6f5] p-0 sm:p-4">
      <div className="bg-premium-pattern relative mx-auto flex h-[100dvh] w-full flex-col overflow-hidden bg-[#f8f6f5] shadow-2xl ring-1 ring-black/5 sm:h-[884px] sm:rounded-[40px] sm:bg-white">
        {/* Header */}
        <header className="relative z-10 mt-2 flex shrink-0 items-center justify-between px-4 py-4">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/50 active:scale-95"
            onClick={() => navigate({to: '/dashboard'})}
          >
            <MdArrowBack className="text-swiss-navy text-2xl" />
          </button>
          <h2 className="text-swiss-navy flex-1 pr-10 text-center text-lg font-bold leading-tight">
            Top Up Wallet
          </h2>
          <div className="w-10" /> {/* spacer */}
        </header>

        {/* Main content */}
        <main className="no-scrollbar relative z-0 flex flex-1 flex-col items-center overflow-y-auto px-4 pb-4 pt-4 md:px-8">
          {/* Private Account Balance Card */}
          <div className="mb-6 w-full max-w-xs rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-center shadow-sm md:max-w-md">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Private Account Balance
            </p>
            <p className="text-2xl font-bold text-slate-900">
              ₹{privateBalance.toLocaleString('en-IN')}
            </p>
          </div>

          <CurrencySelector />
          <AmountDisplay amount={paymentData?.amount} />

          <div className="mb-8" />

          {/* Optional note input */}
          {/* <div className="group relative mb-auto w-full max-w-xs md:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MdEditNote className="text-xl text-slate-400 transition-colors group-focus-within:text-primary" />
            </div>
            <input
              className="text-swiss-navy block w-full rounded-xl border-0 bg-white/70 py-3 pl-10 pr-4 shadow-sm outline-none backdrop-blur-sm transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              placeholder="Add a note (optional)"
              type="text"
              onChange={(e) =>
                setPaymentData((prev) => ({ ...prev, note: e.target.value }))
              }
            />
          </div> */}
        </main>

        {/* Keypad & Continue button */}
        <section className="z-20 rounded-t-[2.5rem] bg-white/90 px-6 pb-8 pt-6 backdrop-blur-md md:px-10">
          <Keypad onKeyPress={handleKeyPress} prevStep={handleBackspace} />

          <button
            className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-bold tracking-wide text-white shadow-lg shadow-primary/30 transition-all hover:bg-[#e06b2c] active:scale-[0.99]"
            onClick={handleContinue}
          >
            Continue
            <MdArrowForward className="text-xl transition-transform group-hover:translate-x-1" />
          </button>
        </section>
      </div>
    </div>
  );
};

export default WithdrawScreen;
