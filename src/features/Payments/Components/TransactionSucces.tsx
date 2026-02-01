import React from 'react';
import {MdHelpOutline, MdCheck, MdIosShare} from 'react-icons/md';
import ReceiptCard from './ReceiptCard';

const TransactionSuccess: React.FC = () => {
  return (
    <div className="bg-background-light flex min-h-screen justify-center">
      {' '}
      <div className="bg-background-light relative flex min-h-screen w-full max-w-md flex-col overflow-hidden sm:my-auto sm:h-auto sm:min-h-[800px]">
        {/* Background Gradient Effect */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 0%, rgba(245, 129, 61, 0.15) 0%, transparent 60%)',
          }}
        ></div>

        <div className="relative z-10 flex w-full flex-1 flex-col px-6 pb-8 pt-12">
          {/* Top Bar */}
          <div className="mb-6 flex justify-end">
            <button className="text-text-secondary flex items-center justify-center rounded-full p-2 transition-colors hover:bg-black/5">
              <MdHelpOutline className="text-2xl" />
            </button>
          </div>

          {/* Success Indicator & Amount */}
          <div className="mb-10 flex flex-col items-center justify-center">
            <div className="relative mb-6 flex items-center justify-center">
              {/* Outer animated rings */}
              <div className="animate-pulse-slow absolute inset-[-12px] rounded-full bg-primary/10"></div>
              <div className="absolute inset-[-4px] animate-pulse rounded-full bg-primary/20"></div>

              {/* Main Icon */}
              <div className="relative rounded-full bg-primary p-5 text-white shadow-xl shadow-primary/30">
                <MdCheck className="text-5xl font-bold" />
              </div>
            </div>

            <h2 className="text-text-dark mb-2 text-center text-2xl font-bold tracking-tight">
              Transfer Successful
            </h2>
            <h1 className="text-text-dark text-center text-[40px] font-extrabold leading-tight tracking-tight">
              $60.00
            </h1>
          </div>

          {/* Receipt Card */}
          <div className="mb-auto">
            <ReceiptCard />
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-4">
            <button className="flex w-full transform items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/80 active:scale-[0.98]">
              <MdIosShare className="text-xl" />
              <span>Share Receipt</span>
            </button>

            <button className="text-text-secondary w-full rounded-xl bg-transparent py-3 text-base font-semibold transition-colors hover:bg-black/5">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSuccess;
