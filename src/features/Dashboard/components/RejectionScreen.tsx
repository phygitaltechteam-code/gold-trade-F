import React from 'react';
import {
  MdArrowBack,
  MdError,
  MdInfo,
  MdLock,
  MdReceiptLong,
  MdCalendarToday,
  MdAccountBalance,
} from 'react-icons/md';
import {Transaction} from '../types';

interface RejectionScreenProps {
  transaction: Transaction;
  onBack: () => void;
}

const RejectionScreen: React.FC<RejectionScreenProps> = ({
  transaction,
  onBack,
}) => {
  // Default rejection reason if none provided
  const rejectionReason =
    transaction.rejectReason ||
    'Transaction was rejected due to security verification failure or insufficient funds.';

  // Format rejection date or use transaction date
  const rejectionDate = transaction.rejectedDate || transaction.date;

  return (
    <div className="font-display bg-background-light dark:bg-background-dark relative mx-auto flex h-screen w-full max-w-md flex-col overflow-y-auto shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 p-4 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/95">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          <MdArrowBack className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-bold text-[#0d131c] dark:text-white">
          Transaction Declined
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Status Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <MdError className="h-16 w-16 text-red-600 dark:text-red-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-500">
              <span className="text-sm font-bold text-white">!</span>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-[#0d131c] dark:text-white">
            Transaction Declined
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Your transaction was not completed
          </p>
        </div>

        {/* Transaction Details Card */}
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-900/10">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MdReceiptLong className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h3 className="font-bold text-[#0d131c] dark:text-white">
                Transaction Details
              </h3>
            </div>
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
              DECLINED
            </span>
          </div>

          <div className="space-y-4">
            {/* Amount */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Amount</span>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                -${transaction.amount.toFixed(2)}
              </span>
            </div>

            <div className="h-px bg-red-200 dark:bg-red-900/50"></div>

            {/* Transaction ID */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">ID</span>
              <span className="font-medium text-[#0d131c] dark:text-white">
                {transaction.id}
              </span>
            </div>

            {/* Title */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">
                Description
              </span>
              <span className="font-medium text-[#0d131c] dark:text-white">
                {transaction.title}
              </span>
            </div>

            {/* Category */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">
                Category
              </span>
              <span className="font-medium text-[#0d131c] dark:text-white">
                {transaction.category}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Date</span>
              <div className="flex items-center gap-1">
                <MdCalendarToday className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-[#0d131c] dark:text-white">
                  {rejectionDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rejection Reason Card */}
        <div className="mb-8 rounded-xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-900/50 dark:bg-orange-900/10">
          <div className="mb-4 flex items-center gap-2">
            <MdInfo className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <h3 className="font-bold text-[#0d131c] dark:text-white">
              Reason for Rejection
            </h3>
          </div>

          <div className="rounded-lg bg-white p-4 dark:bg-slate-800/50">
            <p className="text-slate-700 dark:text-slate-300">
              {rejectionReason}
            </p>
          </div>

          {/* Common rejection reasons */}
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              Common reasons include:
            </p>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500"></span>
                Insufficient funds in account
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500"></span>
                Security verification failed
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500"></span>
                Daily transaction limit exceeded
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500"></span>
                Account verification required
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              // Implement retry logic
              console.log('Retry transaction:', transaction.id);
            }}
            className="w-full rounded-xl bg-red-600 py-3 font-semibold text-white transition-colors hover:bg-red-700"
          >
            Try Again
          </button>

          <button
            onClick={() => {
              // Implement contact support
              console.log('Contact support for:', transaction.id);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Contact Support
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <MdLock className="h-3 w-3" />
          <span>Your funds are secure. No amount was deducted.</span>
        </div>
      </main>
    </div>
  );
};

export default RejectionScreen;
