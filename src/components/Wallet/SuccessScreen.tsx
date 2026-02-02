import React from 'react';
import {
  MdCheckCircle,
  MdShare,
  MdPrint,
  MdDownload,
  MdHome,
} from 'react-icons/md';
import {TransactionData} from './WalletFlow';

interface SuccessScreenProps {
  transactionData: TransactionData;
  onBack?: () => void;
  onComplete?: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({
  transactionData,
  onBack,
  onComplete,
}) => {
  const handleShare = () => {
    // Implement share functionality
    console.log('Sharing receipt');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement download receipt functionality
    const receiptContent = `
      Transaction Receipt
      --------------------
      Transaction ID: ${transactionData.transactionId}
      Amount: ₹${transactionData.amount}
      Account Type: ${transactionData.accountType}
      Date: ${new Date(transactionData.timestamp).toLocaleString()}
      Status: ${transactionData.status}
    `;

    const blob = new Blob([receiptContent], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${transactionData.transactionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="font-inter dark:from-gray-900 dark:to-gray-800 min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto max-w-md px-4 py-8">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <MdCheckCircle className="h-20 w-20 text-green-600 dark:text-green-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 flex h-12 w-12 animate-bounce items-center justify-center rounded-full bg-orange-500">
              <span className="font-bold text-white">✓</span>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="mb-8 text-center">
          <h1 className="text-gray-900 mb-2 text-3xl font-bold dark:text-white">
            Payment Successful!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your wallet has been topped up successfully
          </p>
        </div>

        {/* Receipt Card */}
        <div className="dark:bg-gray-800 border-gray-100 dark:border-gray-700 mb-8 rounded-2xl border bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-gray-900 text-lg font-bold dark:text-white">
              Receipt
            </h2>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
              COMPLETED
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Amount</span>
              <span className="text-gray-900 text-2xl font-bold dark:text-white">
                ₹{transactionData.amount}
              </span>
            </div>

            <div className="bg-gray-200 dark:bg-gray-700 h-px"></div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Transaction ID
                </span>
                <span className="text-gray-900 font-medium dark:text-white">
                  {transactionData.transactionId}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Account Type
                </span>
                <span className="text-gray-900 font-medium capitalize dark:text-white">
                  {transactionData.accountType}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Date & Time
                </span>
                <span className="text-gray-900 font-medium dark:text-white">
                  {new Date(transactionData.timestamp).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {transactionData.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 grid grid-cols-3 gap-3">
          <button
            onClick={handleShare}
            className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col items-center justify-center rounded-xl border p-4 transition-colors"
          >
            <MdShare className="text-gray-700 dark:text-gray-300 mb-2 h-6 w-6" />
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
              Share
            </span>
          </button>

          <button
            onClick={handlePrint}
            className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col items-center justify-center rounded-xl border p-4 transition-colors"
          >
            <MdPrint className="text-gray-700 dark:text-gray-300 mb-2 h-6 w-6" />
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
              Print
            </span>
          </button>

          <button
            onClick={handleDownload}
            className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col items-center justify-center rounded-xl border p-4 transition-colors"
          >
            <MdDownload className="text-gray-700 dark:text-gray-300 mb-2 h-6 w-6" />
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
              Download
            </span>
          </button>
        </div>

        {/* Main Action Button */}
        <button
          onClick={onComplete}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-4 text-lg font-bold text-white shadow-lg shadow-orange-500/30 transition-colors hover:bg-orange-600"
        >
          <MdHome className="h-6 w-6" />
          Back to Home
        </button>

        {/* Additional Info */}
        <div className="text-gray-500 dark:text-gray-400 mt-8 text-center text-sm">
          <p className="mb-2">
            A receipt has been sent to your registered email
          </p>
          <p>
            Transaction will reflect in your wallet within 2-3 business hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessScreen;
