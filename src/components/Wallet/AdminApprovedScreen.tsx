// AdminApprovedScreen.tsx
import React, {useEffect} from 'react';
import {
  MdCheckCircle,
  MdVerifiedUser,
  MdAccountBalance,
  MdArrowBack,
  MdTimer,
} from 'react-icons/md';
import {TransactionData} from './WalletFlow';

interface AdminApprovedScreenProps {
  transactionData: TransactionData;
  onBack?: () => void;
  onContinue?: () => void;
}

const AdminApprovedScreen: React.FC<AdminApprovedScreenProps> = ({
  transactionData,
  onBack,
  onContinue,
}) => {
  // Auto navigate to success after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onContinue) {
        onContinue();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="font-display dark:from-gray-900 dark:to-gray-800 flex h-screen flex-col overflow-hidden bg-gradient-to-b from-green-50 to-white antialiased">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onBack}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex size-10 items-center justify-center rounded-full transition-colors"
        >
          <MdArrowBack className="text-2xl" />
        </button>
        <h2 className="text-gray-900 text-lg font-bold dark:text-white">
          Admin Approved
        </h2>
        <div className="w-10"></div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-4">
        {/* Success Icon with Checkmark */}
        <div className="relative mb-8">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <MdVerifiedUser className="h-20 w-20 text-green-600 dark:text-green-400" />
          </div>
          <div className="absolute -bottom-2 -right-2 flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-orange-500">
            <MdCheckCircle className="h-8 w-8 text-white" />
          </div>
        </div>

        <div className="w-full max-w-xs space-y-6 text-center">
          <h1 className="text-gray-900 text-3xl font-bold dark:text-white">
            Approved! ✅
          </h1>

          <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
            Your transaction has been approved by the admin
          </p>

          {/* Transaction Details */}
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
            <div className="mb-3 flex items-center justify-center gap-2">
              <MdAccountBalance className="h-6 w-6 text-green-600 dark:text-green-400" />
              <h3 className="text-gray-900 text-lg font-bold dark:text-white">
                Transaction Details
              </h3>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Amount:
                </span>
                <span className="text-gray-900 font-bold dark:text-white">
                  ₹{transactionData.amount}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Account:
                </span>
                <span className="text-gray-900 font-medium dark:text-white">
                  {transactionData.accountType === 'private'
                    ? 'Private Account'
                    : 'Virtual Account'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">ID:</span>
                <span className="text-gray-900 text-sm font-medium dark:text-white">
                  {transactionData.transactionId?.substring(0, 12)}...
                </span>
              </div>
            </div>
          </div>

          {/* Auto Redirect Message */}
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-900/20">
            <div className="flex items-center justify-center gap-2">
              <MdTimer className="h-5 w-5 animate-pulse text-orange-600 dark:text-orange-400" />
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Redirecting to success screen in 3 seconds...
              </p>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 text-lg font-bold text-white shadow-lg shadow-green-600/30 transition-colors hover:bg-green-700"
          >
            <MdCheckCircle className="h-6 w-6" />
            Continue to Success
          </button>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="text-gray-500 dark:text-gray-400 text-center text-sm">
          <p>
            Transaction approved by admin at {new Date().toLocaleTimeString()}
          </p>
          <p className="mt-1">Your funds will be available shortly</p>
        </div>
      </div>
    </div>
  );
};

export default AdminApprovedScreen;
