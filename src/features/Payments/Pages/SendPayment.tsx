import React, {useState, useCallback} from 'react';
import {MdArrowBack, MdArrowForward, MdEditNote} from 'react-icons/md';
import AccountSelector from '../Components/AccountSelector';
import CurrencySelector from '../Components/CurrencySelector';
import AmountDisplay from '../Components/AccountDisplay';
import Keypad from '../Components/KeyPad';
import {useNavigate} from '@tanstack/react-router';

const PaymentSend: React.FC = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>('60.00');

  const handleKeyPress = useCallback((key: string) => {
    setAmount((prev) => {
      if (key === '.' && prev.includes('.')) return prev;
      if (prev === '0' && key !== '.') return key;
      if (prev === '' && key === '.') return '0.';
      if (prev.includes('.')) {
        const [, decimals] = prev.split('.');
        if (decimals && decimals.length >= 2) return prev;
      }
      if (prev.replace('.', '').length >= 7) return prev;

      return prev + key;
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setAmount((prev) => {
      if (prev.length <= 1) return '';
      return prev.slice(0, -1);
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
          <AccountSelector />
          <CurrencySelector />
          <AmountDisplay amount={amount} />

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
            className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-bold tracking-wide text-white shadow-lg shadow-primary/30 transition-all hover:bg-[#e06b2c] active:scale-[0.99]"
            onClick={() => navigate({to: '/transactionreview'})}
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
