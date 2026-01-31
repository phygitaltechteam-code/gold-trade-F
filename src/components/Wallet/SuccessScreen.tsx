import React, {useState} from 'react';
import {useNavigate, useLocation} from '@tanstack/react-router';
import {
  FaCheckCircle,
  FaCopy,
  FaReceipt,
  FaEye,
  FaShareAlt,
  FaTimes,
  FaDownload,
  FaPrint,
} from 'react-icons/fa';

const SuccessScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  type WalletState = {amount?: string};
  const state = location.state as WalletState | undefined;
  const amount = state?.amount || '2,500.00';
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Format date and time
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = currentDate
    .toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    .replace(':', ':');

  // Generate transaction ID
  const transactionId = `TU${Date.now().toString().slice(-8)}`;

  const handleCopyTransactionId = () => {
    navigator.clipboard.writeText(transactionId);
    // You could add a toast notification here
  };

  const handleViewReceipt = () => {
    setShowPdfPreview(true);
  };

  const handleShareReceipt = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Transaction Receipt',
        text: `Transaction receipt for $${amount}`,
      });
    } else {
      navigator.clipboard.writeText(`Transaction receipt for $${amount}`);
    }
  };

  const handleDownloadReceipt = () => {
    // Simulate download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `TopUp_Receipt_${transactionId}.pdf`;
    link.click();
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-navy-dark font-display relative flex h-screen w-screen flex-col overflow-hidden dark:text-white">
      {/* PDF Preview Modal */}
      {showPdfPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white">
            {/* PDF Preview Header */}
            <div className="bg-gray-800 flex items-center justify-between px-4 py-3 text-white">
              <div className="flex items-center gap-3">
                <FaReceipt className="text-lg" />
                <span className="font-semibold">TopUp_Receipt.pdf</span>
                <span className="text-gray-300 text-sm">• 245 KB</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadReceipt}
                  className="hover:bg-gray-700 rounded-lg p-2 transition-colors"
                  title="Download"
                >
                  <FaDownload className="text-lg" />
                </button>
                <button
                  onClick={handlePrintReceipt}
                  className="hover:bg-gray-700 rounded-lg p-2 transition-colors"
                  title="Print"
                >
                  <FaPrint className="text-lg" />
                </button>
                <button
                  onClick={() => setShowPdfPreview(false)}
                  className="hover:bg-gray-700 rounded-lg p-2 transition-colors"
                  title="Close"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
            </div>

            {/* PDF Content Preview */}
            <div className="bg-gray-100 flex-1 overflow-auto p-4">
              <div className="mx-auto max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg">
                {/* PDF Header */}
                <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                  <h2 className="mb-2 text-2xl font-bold">Top Up Receipt</h2>
                  <p className="text-primary-light">Transaction Confirmation</p>
                </div>

                {/* PDF Body */}
                <div className="p-6">
                  <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <FaCheckCircle className="text-3xl text-green-600" />
                    </div>
                    <h3 className="text-gray-800 text-xl font-bold">
                      Transaction Successful
                    </h3>
                    <p className="text-gray-600">
                      Your top-up has been completed successfully
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500 text-sm">Amount</p>
                        <p className="text-gray-800 text-xl font-bold">
                          ${amount}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Transaction ID</p>
                        <p className="text-gray-800 text-lg font-semibold">
                          {transactionId}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500 text-sm">Date</p>
                          <p className="text-gray-800 font-medium">
                            {formattedDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Time</p>
                          <p className="text-gray-800 font-medium">
                            {formattedTime}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-gray-500 mb-2 text-sm">
                        Destination Account
                      </p>
                      <p className="text-gray-800 font-bold">
                        E Private Account
                      </p>
                      <p className="text-gray-600 mt-1 text-sm">
                        Account ending with •••• 4321
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-gray-500 mb-2 text-sm">Status</p>
                      <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-green-800">
                        <FaCheckCircle />
                        <span className="font-semibold">Completed</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Note */}
                  <div className="bg-gray-50 mt-8 rounded-lg p-4">
                    <p className="text-gray-600 text-center text-sm">
                      This is an electronic receipt. No signature required.
                    </p>
                    <p className="text-gray-500 mt-2 text-center text-xs">
                      Generated on {formattedDate} at {formattedTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Preview Footer */}
            <div className="bg-gray-800 flex items-center justify-between px-4 py-3 text-white">
              <span className="text-gray-300 text-sm">Page 1 of 1</span>
              <button
                onClick={() => setShowPdfPreview(false)}
                className="rounded-lg bg-primary px-4 py-2 font-medium transition-colors hover:bg-primary/90"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Blur Effects */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[10%] -top-[10%] h-[50%] w-[80%] rounded-full bg-blue-100/40 blur-[80px] dark:bg-blue-900/10"></div>
        <div className="absolute -left-[10%] top-[20%] h-[40%] w-[60%] rounded-full bg-orange-100/50 blur-[70px] dark:bg-orange-900/10"></div>
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-col px-4 pb-6 pt-16">
        {/* Success Icon with Glow Effect */}
        <div className="group relative mb-4 flex justify-center">
          <div className="absolute inset-0 scale-125 transform rounded-full bg-primary/20 blur-xl"></div>
          <div className="dark:bg-navy-light relative rounded-full bg-white p-2 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700">
            <FaCheckCircle className="text-6xl text-primary" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-navy-dark mb-1 text-center text-xl font-bold tracking-tight dark:text-white">
          Top Up Successful
        </h1>

        {/* Amount Display */}
        <div className="mb-6 text-center">
          <span className="text-navy-dark text-3xl font-extrabold tracking-tight dark:text-white">
            ${amount}
          </span>
        </div>

        {/* Transaction Details Card */}
        <div className="dark:bg-navy-light/80 mb-6 w-full rounded-xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-slate-700">
          <div className="space-y-3">
            {/* Destination Account */}
            <div className="group flex items-center justify-between text-sm">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                Destination Account
              </span>
              <span className="text-navy-dark text-right font-bold dark:text-white">
                E Private Account
              </span>
            </div>
            <div className="h-px w-full bg-slate-100 dark:bg-slate-700/50"></div>

            {/* Date */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                Date
              </span>
              <span className="text-navy-dark font-bold dark:text-white">
                {formattedDate}
              </span>
            </div>
            <div className="h-px w-full bg-slate-100 dark:bg-slate-700/50"></div>

            {/* Time */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                Time
              </span>
              <span className="text-navy-dark font-bold dark:text-white">
                {formattedTime}
              </span>
            </div>
            <div className="h-px w-full bg-slate-100 dark:bg-slate-700/50"></div>

            {/* Transaction ID */}
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                Transaction ID
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-navy-dark font-mono font-bold tracking-tight dark:text-white">
                  {transactionId}
                </span>
                <button
                  onClick={handleCopyTransactionId}
                  className="text-slate-400 transition-colors hover:text-primary"
                >
                  <FaCopy className="text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Card */}
        <div
          onClick={handleViewReceipt}
          className="group mb-6 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-black/20 dark:hover:bg-black/30"
        >
          <div className="dark:bg-navy-light flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
            <FaReceipt className="text-lg" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-navy-dark truncate text-sm font-bold dark:text-white">
              TopUp_Receipt.pdf
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              PDF • 245 KB
            </p>
          </div>
          <div className="p-2 text-slate-400 transition-colors group-hover:text-primary">
            <FaEye className="text-base" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 py-8">
          <button
            onClick={handleShareReceipt}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            Share Receipt
            <FaShareAlt className="text-base" />
          </button>

          <button
            onClick={() => navigate({to: '/'})}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-transparent text-base font-semibold text-slate-500 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Back to Home
          </button>
        </div>
      </main>
    </div>
  );
};

export default SuccessScreen;
