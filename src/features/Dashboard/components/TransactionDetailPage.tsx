/* eslint-disable */
import React, {useEffect, useState} from 'react';
import {Transaction} from '../types';
import {
  MdAccountBalance,
  MdCall,
  MdLock,
  MdArrowBack,
  MdCheckCircle,
  MdError,
  MdReceiptLong,
  MdShare,
  MdContentCopy,
  MdVisibility,
  MdRefresh,
  MdHourglassEmpty,
  MdCancel,
  MdPrint,
  MdDownload,
} from 'react-icons/md';
import {useNavigate, useParams} from '@tanstack/react-router';
import {transformApiTransaction} from '@/utils/formatters';
import {api} from '@/utils/axios';
import toast from 'react-hot-toast';
import {useQuery} from '@tanstack/react-query';
import {useGetTransactionById} from '../pages/dashboardmutation';

interface ApiUser {
  fullname: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  dob: string | null;
  isVerified: boolean;
  isRejected: boolean;
}

interface ApiTransaction {
  id: string;
  walletId: string;
  particular: string;
  receiverId: string | null;
  senderId: string | null;
  beneficiaryId: string | null;
  amount: number;
  amountType: string;
  accountType: string;
  type: 'CREDIT' | 'DEBIT';
  rejectReason: string | null;
  isPending: boolean;
  isRejected: boolean;
  createdAt: string;
  updatedAt: string;
  beneficiary: any;
  user: ApiUser;
}

// Helper functions
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDateForPDF = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const TransactionDetailPage: React.FC = () => {
  const {id} = useParams({from: '/_app/wallet/transaction/$id'});
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [originalTransaction, setOriginalTransaction] =
    useState<ApiTransaction | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPDFLoading, setIsPDFLoading] = useState(false);

  const {
    data: apiTransactionData,
    isLoading,
    error,
    isError,
  } = useGetTransactionById(id || '');

  useEffect(() => {
    if (apiTransactionData) {
      setOriginalTransaction(apiTransactionData);
      const transformed = transformApiTransaction(apiTransactionData);
      setTransaction(transformed);
    }
  }, [apiTransactionData]);

  const handleCopyId = () => {
    if (originalTransaction?.id) {
      navigator.clipboard.writeText(originalTransaction.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Transaction ID copied!');
    }
  };

  const handleShareReceipt = () => {
    toast.success('Share feature coming soon!');
  };

  const handleBackToHome = () => {
    navigate({to: '/dashboard'});
  };
  // NEW: PDF Generation Function with auto-print
  const handleGeneratePDF = () => {
    if (!originalTransaction) return;

    setIsPDFLoading(true);

    const isCredit = originalTransaction.type === 'CREDIT';
    const transactionType = isCredit ? 'Credit' : 'Debit';
    const amountSign = isCredit ? '' : '';
    const userName = originalTransaction?.user?.fullname || 'Unknown User';
    const userEmail = originalTransaction?.user?.email || 'No email';
    const userPhone = originalTransaction?.user?.phoneNumber || 'No phone';

    const transactionDate = new Date(originalTransaction.createdAt);
    const formattedDate = transactionDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const formattedTime = transactionDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Get current user/caterer info from localStorage or context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const catererName = user?.fullname || 'Your Company Name';
    const catererEmail = user?.email || 'support@example.com';
    const catererPhone = user?.phoneNumber || '+1 234 567 8900';

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Transaction Receipt</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif;
        }
        
        body {
            padding: 20px;
            background: white;
            color: #333;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .receipt {
            max-width: 80mm;
            margin: 0 auto;
            padding: 10px;
            border: 1px solid #ccc;
        }
        
        .header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px dashed #ccc;
        }
        
        .company-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #F97316;
        }
        
        .receipt-title {
            font-size: 14px;
            font-weight: bold;
            margin: 10px 0;
            text-transform: uppercase;
        }
        
        .amount-section {
            text-align: center;
            margin: 15px 0;
            padding: 10px;
            background: #f8f8f8;
            border-radius: 4px;
        }
        
        .amount {
            font-size: 24px;
            font-weight: bold;
            margin: 5px 0;
            color: ${isCredit ? '#10B981' : '#EF4444'};
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 10px;
            background: #10B981;
            color: white;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            margin-top: 5px;
        }
        
        .details-section {
            margin: 15px 0;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding-bottom: 8px;
            border-bottom: 1px dotted #eee;
        }
        
        .detail-label {
            font-weight: 600;
            color: #666;
            min-width: 120px;
        }
        
        .detail-value {
            text-align: right;
            font-weight: 500;
        }
        
        .transaction-id {
            margin: 15px 0;
            padding: 10px;
            background: #f0f0f0;
            border-radius: 4px;
            text-align: center;
            font-family: monospace;
            font-weight: bold;
            letter-spacing: 1px;
        }
        
        .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px dashed #ccc;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        
        .contact-info {
            margin-top: 10px;
            font-size: 10px;
            color: #888;
        }
        
        @media print {
            body {
                padding: 0;
                margin: 0;
            }
            
            .receipt {
                border: none;
                max-width: 100%;
            }
            
            .no-print {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <!-- Header -->
        <div class="header">
            <div class="company-name">${catererName}</div>
            <div style="font-size: 11px; margin-bottom: 5px;">Transaction Receipt</div>
            <div style="font-size: 10px; color: #666;">Secure Digital Receipt</div>
        </div>
        
        <!-- Amount -->
        <div class="amount-section">
            <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Transaction Amount</div>
            <div class="amount">${amountSign}$${originalTransaction.amount.toFixed(2)}</div>
            <div style="font-size: 12px; margin: 5px 0; color: ${isCredit ? '#10B981' : '#EF4444'}; font-weight: bold;">
                ${transactionType} • ${originalTransaction.amountType}
            </div>
            <div class="status-badge">COMPLETED</div>
        </div>
        
        <!-- Transaction Details -->
        <div class="details-section">
            <div class="receipt-title">Transaction Details</div>
            
            <div class="detail-row">
                <div class="detail-label">Type:</div>
                <div class="detail-value">${transactionType}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">${isCredit ? 'From' : 'To'}:</div>
                <div class="detail-value">${userName}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value">${userEmail}</div>
            </div>
            
            ${
              userPhone !== 'No phone'
                ? `
            <div class="detail-row">
                <div class="detail-label">Phone:</div>
                <div class="detail-value">${userPhone}</div>
            </div>
            `
                : ''
            }
            
            <div class="detail-row">
                <div class="detail-label">Account Type:</div>
                <div class="detail-value">
                    ${
                      originalTransaction.accountType === 'E_PRIVATEACCOUNT'
                        ? 'E Private Account'
                        : originalTransaction.accountType ===
                            'E_TEMPORARYACCOUNT'
                          ? 'E Temporary Account'
                          : originalTransaction.accountType
                    }
                </div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Description:</div>
                <div class="detail-value">${originalTransaction.particular}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Date:</div>
                <div class="detail-value">${formattedDate}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Time:</div>
                <div class="detail-value">${formattedTime}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Reference:</div>
                <div class="detail-value">${originalTransaction.id.slice(0, 8).toUpperCase()}</div>
            </div>
        </div>
        
        <!-- Transaction ID -->
        <div class="transaction-id">
            <div style="font-size: 10px; margin-bottom: 5px; color: #666;">Transaction ID</div>
            <div style="font-size: 14px;">${originalTransaction.id.toUpperCase()}</div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div>Thank you for your transaction</div>
            <div>This is an official digital receipt</div>
            <div class="contact-info">
                ${catererEmail} • ${catererPhone}<br>
                Generated on ${new Date().toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })} at ${new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
            </div>
        </div>
    </div>
    
    <!-- Auto-print script -->
    <script>
        // Wait for content to load, then auto-print
        window.onload = function() {
            setTimeout(function() {
                window.print();
                // Close window after printing (optional)
                setTimeout(function() {
                    window.close();
                }, 1000);
            }, 500);
        }
        
        // Fallback for browsers that block auto-print
        document.onkeydown = function(e) {
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                window.print();
            }
        }
    </script>
</body>
</html>`;

    // Open in new window
    const printWindow = window.open(
      '',
      '_blank',
      'width=400,height=600,scrollbars=no,resizable=no',
    );

    if (!printWindow) {
      toast.error('Please allow popups to print receipt');
      setIsPDFLoading(false);
      return;
    }

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.title = `Receipt_${originalTransaction.id.slice(0, 8)}`;
    printWindow.document.close();

    // Focus the window
    setTimeout(() => {
      try {
        printWindow.focus();
      } catch (e) {}
      setIsPDFLoading(false);
    }, 300);
  };

  // Also add a direct print button without PDF view
  const handleDirectPrint = () => {
    if (!originalTransaction) return;

    setIsPDFLoading(true);

    const isCredit = originalTransaction.type === 'CREDIT';
    const amountSign = isCredit ? '' : '';
    const userName = originalTransaction?.user?.fullname || 'Unknown User';

    const transactionDate = new Date(originalTransaction.createdAt);
    const formattedDate = transactionDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = transactionDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Get user/caterer info
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const catererName = user?.fullname || 'Your Company';

    // Create a simple print template
    const printContent = `
    <html>
      <head>
        <title>Transaction Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .receipt { max-width: 300px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #F97316; padding-bottom: 10px; }
          .company-name { font-size: 18px; font-weight: bold; color: #F97316; }
          .amount { font-size: 28px; font-weight: bold; text-align: center; margin: 20px 0; color: ${isCredit ? '#10B981' : '#EF4444'}; }
          .details { margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 8px 0; padding-bottom: 8px; border-bottom: 1px dotted #ddd; }
          .label { font-weight: bold; color: #666; }
          .value { text-align: right; }
          .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
          @media print {
            body { padding: 0; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="company-name">${catererName}</div>
            <div style="font-size: 14px; margin-top: 5px;">TRANSACTION RECEIPT</div>
          </div>
          
          <div class="amount">${amountSign}$${originalTransaction.amount.toFixed(2)}</div>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Type:</span>
              <span class="value">${originalTransaction.type}</span>
            </div>
            <div class="detail-row">
              <span class="label">${isCredit ? 'From' : 'To'}:</span>
              <span class="value">${userName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Description:</span>
              <span class="value">${originalTransaction.particular}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">${formattedTime}</span>
            </div>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => {
              window.close();
            }, 500);
          };
        <\/script>
      </body>
    </html>
  `;

    const printWindow = window.open('', '_blank', 'width=1000,height=900');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
    setIsPDFLoading(false);
  };

  if (isLoading) {
    return (
      <div className="bg-background-light dark:bg-background-dark flex min-h-screen flex-col items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          Loading transaction details...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-background-light dark:bg-background-dark flex min-h-screen flex-col items-center justify-center px-6">
        <div className="rounded-lg bg-red-50 p-6 dark:bg-red-900/20">
          <MdError className="mx-auto mb-3 h-12 w-12 text-red-600 dark:text-red-400" />
          <p className="mb-2 text-red-600 dark:text-red-400">
            Failed to load transaction
          </p>
          <p className="mb-4 text-sm text-red-500 dark:text-red-300">
            {error?.message ||
              'An error occurred while loading transaction details'}
          </p>
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-orange-600"
          >
            <MdArrowBack />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!apiTransactionData || !transaction) {
    return (
      <div className="bg-background-light dark:bg-background-dark flex min-h-screen flex-col items-center justify-center px-6">
        <div className="text-center">
          <div className="mb-4 inline-block rounded-full bg-slate-100 p-6 dark:bg-slate-800">
            <MdHourglassEmpty className="h-12 w-12 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="mb-2 text-xl font-bold">Transaction Not Found</h2>
          <p className="mb-4 text-slate-600 dark:text-slate-300">
            The requested transaction could not be found.
          </p>
          <button
            onClick={handleBackToHome}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-orange-600"
          >
            <MdArrowBack />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const rejectReason = apiTransactionData?.rejectReason || null;
  const userName = apiTransactionData?.user?.fullname || 'Unknown User';
  const userEmail = apiTransactionData?.user?.email || 'No email';
  const userPhone = apiTransactionData?.user?.phoneNumber || 'No phone';

  // ========== PENDING STATUS DESIGN ==========
  if (transaction?.status === 'Pending') {
    return (
      <div className="font-display bg-background-light dark:bg-background-dark flex min-h-screen flex-col overflow-hidden text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={handleBackToHome}
            className="flex size-10 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <MdArrowBack className="text-2xl" />
          </button>
          <h2 className="text-lg font-bold">Transfer Under Process</h2>
          <div className="w-10"></div>
        </div>

        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          {/* Animated Spinner */}
          <div className="relative mb-10 flex items-center justify-center">
            <div className="h-32 w-32 animate-spin rounded-full border-4 border-primary/10 border-t-primary"></div>
            <div className="absolute flex h-20 w-20 items-center justify-center rounded-full border border-slate-100 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <MdAccountBalance className="text-[40px] text-primary" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold tracking-tight">
              Transfer in Progress
            </h2>

            <div className="rounded-2xl border border-blue-100/50 bg-blue-50/50 px-6 py-4 dark:border-blue-800/50 dark:bg-blue-900/10">
              <p className="mb-1 text-lg font-semibold">
                ${transaction.amount.toFixed(2)}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {apiTransactionData.type === 'CREDIT' ? 'From' : 'To'}:{' '}
                {userName}
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                {transaction.title || apiTransactionData.particular}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500"></div>
              Awaiting Admin Approval
            </div>

            <p className="mx-auto max-w-xs text-base leading-relaxed text-slate-600 dark:text-slate-400">
              We are securely processing your{' '}
              {apiTransactionData.type === 'CREDIT' ? 'top-up' : 'transfer'}
              {apiTransactionData.type === 'CREDIT'
                ? ' to your account'
                : ` to ${userName}`}
              . This usually takes 2-5 minutes. Please do not close the app.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 h-1 w-full max-w-[200px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-primary"></div>
          </div>
        </main>

        <footer className="bg-transparent p-6">
          <div className="mx-auto max-w-md">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary/10 py-4 font-semibold text-primary transition-colors hover:bg-primary/5 active:bg-primary/10">
              <MdCall className="text-xl" />
              <span>Need help? Call Support</span>
            </button>
            <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              <MdLock className="text-[14px]" />
              <span>Secure End-to-End Encryption</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ========== APPROVED/SUCCESSFUL STATUS DESIGN ==========
  if (transaction?.status === 'Approved') {
    const isCredit = apiTransactionData.type === 'CREDIT';
    const transactionTitle = isCredit
      ? 'Top Up Successful'
      : 'Transfer Successful';

    return (
      <div className="bg-background-light dark:bg-background-dark font-display relative flex min-h-screen flex-col overflow-hidden text-slate-900 dark:text-white">
        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -right-[10%] -top-[10%] h-[50%] w-[80%] rounded-full bg-blue-100/40 blur-[80px] dark:bg-blue-900/10"></div>
          <div className="absolute -left-[10%] top-[20%] h-[40%] w-[60%] rounded-full bg-orange-100/50 blur-[70px] dark:bg-orange-900/10"></div>
          <div className="dark:from-background-dark absolute bottom-0 left-0 h-[20%] w-full bg-gradient-to-t from-white/90 to-transparent dark:to-transparent"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4">
          <button
            onClick={handleBackToHome}
            className="flex size-10 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <MdArrowBack className="text-2xl" />
          </button>
          <h2 className="text-lg font-bold">Transaction Details</h2>
          <div className="w-10"></div>
        </div>

        <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center px-6 pb-8 pt-8">
          {/* Success Icon */}
          <div className="group relative mb-6">
            <div className="absolute inset-0 scale-125 transform rounded-full bg-primary/20 blur-xl transition-transform duration-700 group-hover:scale-150"></div>
            <div className="relative rounded-full bg-white p-2 shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
              <MdCheckCircle className="block text-[72px] text-primary" />
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold tracking-tight">
            {transactionTitle}
          </h1>

          <div className="mb-10 mt-2 text-center">
            <span className="text-4xl font-extrabold tracking-tight">
              {isCredit}${transaction.amount.toFixed(2)}
            </span>
          </div>

          {/* Transaction Details Card */}
          <div className="mb-auto w-full rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/80">
            <div className="space-y-4">
              {/* Destination Account */}
              <div className="group flex items-center justify-between text-sm">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  Account Type
                </span>
                <span className="text-right font-bold">
                  {apiTransactionData.accountType === 'E_PRIVATEACCOUNT'
                    ? 'E Private Account'
                    : apiTransactionData.accountType === 'E_TEMPORARYACCOUNT'
                      ? 'E Temporary Account'
                      : apiTransactionData.accountType}
                </span>
              </div>
              <div className="h-px w-full bg-slate-100 dark:bg-slate-700/50"></div>

              {/* Date */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  Date
                </span>
                <span className="font-bold">
                  {formatDate(apiTransactionData.createdAt)}
                </span>
              </div>
              <div className="h-px w-full bg-slate-100 dark:bg-slate-700/50"></div>

              {/* Time */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  Time
                </span>
                <span className="font-bold">
                  {formatTime(apiTransactionData.createdAt)}
                </span>
              </div>
              <div className="h-px w-full bg-slate-100 dark:bg-slate-700/50"></div>

              {/* Transaction ID */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  Transaction ID
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold tracking-tight">
                    {apiTransactionData.id.slice(0, 8).toUpperCase()}
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="relative text-slate-400 transition-colors hover:text-primary"
                  >
                    <MdContentCopy className="text-[16px]" />
                    {copied && (
                      <span className="absolute -top-8 right-0 rounded bg-green-500 px-2 py-1 text-xs text-white">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Receipt Section with Eye Icon for PDF View */}
            <div
              onClick={handleGeneratePDF}
              className="group mt-6 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-black/20 dark:hover:bg-slate-800/30"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm transition-transform group-hover:scale-105 dark:bg-slate-800">
                <MdReceiptLong />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-bold">
                  Transaction_Receipt_{apiTransactionData.id.slice(0, 8)}.pdf
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  PDF • Click to view receipt
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGeneratePDF();
                  }}
                  className="p-2 text-slate-400 transition-colors hover:text-primary"
                  disabled={isPDFLoading}
                >
                  {isPDFLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  ) : (
                    <MdVisibility className="text-[16px]" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 w-full space-y-3">
            <button
              onClick={handleShareReceipt}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-orange-600 active:scale-[0.98]"
            >
              Share Receipt
              <MdShare className="text-[20px]" />
            </button>
            <button
              onClick={handleBackToHome}
              className="flex h-14 w-full items-center justify-center rounded-xl bg-transparent text-lg font-semibold text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ========== REJECTED STATUS DESIGN ==========
  if (transaction?.status === 'Rejected') {
    const isCredit = apiTransactionData.type === 'CREDIT';

    return (
      <div className="font-display bg-background-light dark:bg-background-dark flex min-h-screen flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={handleBackToHome}
            className="flex size-10 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <MdArrowBack className="text-2xl" />
          </button>
          <h2 className="text-lg font-bold">Transaction Failed</h2>
          <div className="w-10"></div>
        </div>

        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          {/* Error Icon */}
          <div className="relative mb-8">
            <div className="h-28 w-28 rounded-full border-4 border-red-500/10"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-white p-4 shadow-lg dark:bg-slate-800">
                <MdCancel className="text-[48px] text-red-600" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold tracking-tight">
              Transaction Rejected
            </h2>

            <div className="rounded-2xl border border-red-100/50 bg-red-50/50 px-6 py-4 dark:border-red-800/50 dark:bg-red-900/10">
              <p className="mb-1 text-lg font-semibold text-red-600 dark:text-red-400">
                {isCredit}${transaction.amount.toFixed(2)}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {transaction.title || apiTransactionData.particular}
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                {isCredit ? 'From' : 'To'}: {userName}
              </p>
            </div>

            {/* Rejection Reason */}
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 dark:border-red-800/30 dark:bg-red-900/20">
              <div className="flex items-start gap-3">
                <MdError className="mt-0.5 flex-shrink-0 text-xl text-red-600 dark:text-red-400" />
                <div className="text-left">
                  <p className="mb-1 font-medium text-red-800 dark:text-red-300">
                    Transaction Declined
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {rejectReason ||
                      'Your transaction was rejected. This could be due to insufficient funds, security concerns, or account restrictions.'}
                  </p>
                </div>
              </div>
            </div>

            <p className="mx-auto max-w-xs text-base leading-relaxed text-slate-600 dark:text-slate-400">
              Please check your account details and try again, or contact
              support for assistance.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 w-full max-w-xs space-y-3">
            <button
              onClick={handleBackToHome}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white transition-colors hover:bg-orange-600"
            >
              <MdRefresh />
              Try Another Transaction
            </button>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-transparent py-3 font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
              <MdCall />
              Contact Support
            </button>
          </div>
        </main>

        <footer className="bg-transparent p-6">
          <div className="mx-auto max-w-md">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              <MdLock className="text-[14px]" />
              <span>Secure End-to-End Encryption</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ========== DEFAULT/OTHER STATUS ==========
  return (
    <div className="bg-background-light dark:bg-background-dark flex min-h-screen flex-col items-center justify-center px-6">
      <div className="text-center">
        <div className="mb-4 inline-block rounded-full bg-slate-100 p-6 dark:bg-slate-800">
          <MdHourglassEmpty className="h-12 w-12 text-slate-400 dark:text-slate-500" />
        </div>
        <h2 className="mb-2 text-xl font-bold">Transaction Details</h2>
        <p className="mb-4 text-slate-600 dark:text-slate-300">
          Status: {transaction?.status || 'Unknown'}
        </p>
        <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          <p>
            Type: {apiTransactionData?.type === 'CREDIT' ? 'Credit' : 'Debit'}
          </p>
          <p>Amount: ${apiTransactionData?.amount?.toFixed(2) || '0.00'}</p>
          <p>User: {userName}</p>
          <p>Email: {userEmail}</p>
          {userPhone !== 'No phone' && <p>Phone: {userPhone}</p>}
          <p className="mt-2">Particular: {apiTransactionData?.particular}</p>
        </div>
        <button
          onClick={handleBackToHome}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:bg-orange-600"
        >
          <MdArrowBack />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default TransactionDetailPage;
