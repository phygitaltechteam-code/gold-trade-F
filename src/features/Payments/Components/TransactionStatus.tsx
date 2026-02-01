import React from 'react';
import {MdAccountBalance, MdLock, MdCall} from 'react-icons/md';
import {FiPaperclip} from 'react-icons/fi';
import {CircularSpinner} from './CircularSpinner';

export const TransferStatusScreen: React.FC = () => {
  return (
    <div className="bg-gray-50 flex min-h-screen justify-center">
      <div className="flex min-h-screen w-full max-w-md flex-col bg-white shadow-sm">
        <div className="relative flex flex-1 flex-col px-6 py-8">
          <div className="-mt-10 flex flex-1 flex-col items-center justify-center">
            <div className="relative mb-8">
              <CircularSpinner size={140} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                  <MdAccountBalance className="text-4xl text-primary" />
                </div>
              </div>
            </div>

            <h1 className="text-gray-900 mb-6 text-center text-2xl font-bold">
              Transfer in Progress
            </h1>

            {/* Transaction Details Card */}
            <div className="mb-6 w-full rounded-2xl border border-blue-50 bg-blue-50/40 p-6 text-center">
              <div className="flex flex-col items-center">
                <span className="text-gray-900 mb-1 text-2xl font-bold">
                  $60.00
                </span>
                <span className="text-gray-500 mb-4 font-medium">
                  to Rahul Sharma
                </span>

                <div className="bg-gray-200/60 mb-3 h-px w-full"></div>

                <p className="text-gray-400 mb-3 text-xs">
                  Includes payment charges of $0.35 (0.59%)
                </p>

                <button className="flex items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-80">
                  <FiPaperclip className="rotate-45 transform text-base" />
                  <span>View Attachment</span>
                </button>
              </div>
            </div>

            {/* Description Text */}
            <p className="text-gray-500 mx-auto mb-8 max-w-xs text-center text-sm leading-relaxed">
              We are securely processing your payment to Rahul Sharma. This
              usually takes a few seconds. Please do not close the app.
            </p>

            {/* Small Horizontal Progress Indicator */}
            <div className="bg-gray-100 h-1 w-32 overflow-hidden rounded-full">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-primary/40"></div>
            </div>
          </div>

          {/* Footer / Bottom Actions */}
          <div className="mt-auto w-full space-y-6">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 py-4 font-semibold text-primary transition-colors hover:bg-primary/10 active:scale-[0.98]">
              <MdCall className="text-xl" />
              <span>Need help? Call Support</span>
            </button>

            <div className="text-gray-300 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest">
              <MdLock className="text-xs" />
              <span>Secure End-to-End Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
