import React from 'react';
import {
  MdAccountBalance,
  MdCall,
  MdLock,
  MdArrowBack,
  MdError,
  MdLockOutline,
} from 'react-icons/md';
import {TransactionData} from './WalletFlow';
import {useNavigate} from '@tanstack/react-router';

interface ProcessingScreenProps {
  transactionData: TransactionData;
  onBack?: () => void;
  isAdminApproved?: boolean;
  errorMessage?: string;
  isSubmitting?: boolean;
}

const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  transactionData,
  onBack,
  isAdminApproved = false,
  errorMessage = '',
  isSubmitting = false,
}) => {
  const navigate = useNavigate();
  const isPending = transactionData.status === 'pending';
  const isApproved = transactionData.status === 'processing';

  // Check if it's a PIN error
  const isPinError =
    errorMessage.toLowerCase().includes('pin') ||
    errorMessage.toLowerCase().includes('security') ||
    errorMessage.toLowerCase().includes('password') ||
    errorMessage.toLowerCase().includes('invalid');

  return (
    <div className="font-display bg-gray-50 text-gray-900 dark:bg-gray-900 flex h-screen flex-col overflow-hidden antialiased dark:text-white">
      {/* Fixed Header */}
      <div className="border-gray-200 dark:border-gray-800 dark:bg-gray-900 shrink-0 border-b bg-white px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <button
            onClick={() => navigate({to: '/dashboard'})}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex size-10 items-center justify-center rounded-full transition-colors"
          >
            <MdArrowBack className="text-xl" />
          </button>
          <h2 className="text-base font-bold md:text-lg">
            {isPending ? 'Payment Processing' : 'Payment Processing'}
          </h2>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Main Content - Fixed height, no scrolling */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-4 md:px-6 md:py-6">
          {/* Icon */}
          <div className="relative mb-4 flex items-center justify-center md:mb-6">
            {isPending ? (
              // ERROR STATE
              <>
                <div className="h-20 w-20 rounded-full border-4 border-red-500/10 md:h-24 md:w-24"></div>
                <div className="border-gray-100 dark:border-gray-800 dark:bg-gray-900 absolute flex h-14 w-14 items-center justify-center rounded-full border bg-white shadow-lg md:h-16 md:w-16">
                  {isPinError ? (
                    <MdLockOutline className="text-3xl text-red-600 md:text-4xl" />
                  ) : (
                    <MdError className="text-3xl text-red-600 md:text-4xl" />
                  )}
                </div>
              </>
            ) : (
              // PROCESSING/PENDING STATE
              <>
                <div className="h-20 w-20 animate-spin rounded-full border-4 border-orange-500/10 border-t-orange-500 md:h-24 md:w-24"></div>
                <div className="border-gray-100 dark:border-gray-800 dark:bg-gray-900 absolute flex h-14 w-14 items-center justify-center rounded-full border bg-white shadow-lg md:h-16 md:w-16">
                  <MdAccountBalance className="text-2xl text-orange-500 md:text-3xl" />
                </div>
              </>
            )}
          </div>

          <div className="w-full max-w-xs space-y-3 text-center md:max-w-sm md:space-y-4">
            <h2 className="text-xl font-extrabold tracking-tight md:text-2xl">
              {isPending ? 'Transfer in Progress' : 'Transfer in Progress'}
            </h2>

            {/* Admin Status - Show when pending */}
            {isPending && (
              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 md:text-sm">
                <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500"></div>
                Awaiting Admin Approval
              </div>
            )}

            {/* Amount Display - Show for all states */}
            {transactionData.amount && (
              <div
                className={`rounded-xl border px-4 py-3 ${
                  isApproved
                    ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20'
                    : 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20'
                }`}
              >
                <p className="mb-1 text-base font-semibold md:text-lg">
                  ₹{transactionData.amount}
                </p>
                <p className="text-xs opacity-80 md:text-sm">
                  Account:{' '}
                  {transactionData.accountType === 'private'
                    ? 'Private Account'
                    : 'Virtual Account'}
                </p>
              </div>
            )}

            {/* Status Message */}
            <p
              className={`text-xs leading-relaxed md:text-sm ${
                isApproved
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {isApproved
                ? errorMessage
                : isPending
                  ? 'Your transaction is awaiting admin approval. This usually takes 2-5 minutes.'
                  : 'Your transaction is being processed...'}
            </p>

            {/* Admin Approved Status */}
            {isAdminApproved && isPending && (
              <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300 md:text-sm">
                ✓ Approved by Admin
              </div>
            )}
          </div>

          <button
            onClick={() => navigate({to: '/dashboard'})}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-transparent text-center text-base font-semibold text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white sm:h-14 sm:text-lg"
          >
            Back to Dashboard
          </button>

          {/* Retry Button for Error State - Adjusted spacing */}
          {isPending && (
            <button
              onClick={onBack}
              className="mt-4 flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 md:mt-6 md:text-base"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessingScreen;
