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
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate({to: '/dashboard'})}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex size-10 items-center justify-center rounded-full transition-colors"
        >
          <MdArrowBack className="text-2xl" />
        </button>
        <h2 className="text-lg font-bold">
          {isPending ? 'Payment Processing' : 'Payment Processing'}
        </h2>
        <div className="w-10"></div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-4">
        {/* Icon */}
        <div className="relative mb-8 flex items-center justify-center">
          {isPending ? (
            // ERROR STATE
            <>
              <div className="h-28 w-28 rounded-full border-4 border-red-500/10"></div>
              <div className="border-gray-100 dark:border-gray-800 dark:bg-gray-900 absolute flex h-20 w-20 items-center justify-center rounded-full border bg-white shadow-lg">
                {isPinError ? (
                  <MdLockOutline className="text-[48px] text-red-600" />
                ) : (
                  <MdError className="text-[48px] text-red-600" />
                )}
              </div>
            </>
          ) : (
            // PROCESSING/PENDING STATE
            <>
              <div className="h-28 w-28 animate-spin rounded-full border-4 border-orange-500/10 border-t-orange-500"></div>
              <div className="border-gray-100 dark:border-gray-800 dark:bg-gray-900 absolute flex h-20 w-20 items-center justify-center rounded-full border bg-white shadow-lg">
                <MdAccountBalance className="text-[40px] text-orange-500" />
              </div>
            </>
          )}
        </div>

        <div className="w-full max-w-xs space-y-4 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight">
            {isPending ? 'Transfer in Progress' : 'Transfer in Progress'}
          </h2>

          {/* Admin Status - Show when pending */}
          {isPending && (
            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
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
              <p className="mb-1 text-lg font-semibold">
                ₹{transactionData.amount}
              </p>
              <p className="text-sm opacity-80">
                Account:{' '}
                {transactionData.accountType === 'private'
                  ? 'Private Account'
                  : 'Virtual Account'}
              </p>
            </div>
          )}

          {/* Status Message */}
          <p
            className={`text-sm leading-relaxed ${
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
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
              ✓ Approved by Admin
            </div>
          )}
        </div>

        {/* Retry Button for Error State */}
        {isPending && (
          <button
            onClick={onBack}
            className="mt-6 flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Try Again
          </button>
        )}
      </div>

      {/* Footer - Only show for non-error states */}
      {!isPending && (
        <div className="px-6 py-4">
          <div className="mx-auto max-w-md">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 py-3 font-semibold text-orange-600 transition-colors hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30">
              <MdCall className="text-xl" />
              <span>Need help? Call Support</span>
            </button>

            <div className="text-gray-500 dark:text-gray-400 mt-4 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
              <MdLock className="text-[12px]" />
              <span>Secure End-to-End Encryption</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingScreen;
