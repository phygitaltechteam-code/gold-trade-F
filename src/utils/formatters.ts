/*eslint-disable*/
import {Transaction, BankCard} from '../types';
import {
  MdPayment,
  MdShoppingBag,
  MdCoffee,
  MdMovie,
  MdAccountBalance,
  MdAttachMoney,
  MdAccountBalanceWallet,
  MdCheckCircle,
  MdHourglassEmpty,
  MdCancel,
} from 'react-icons/md';

// Helper function to format date
export const formatTransactionDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    const timeString = date
      .toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .toLowerCase();

    if (diffInDays === 0) {
      return `Today, ${timeString}`;
    } else if (diffInDays === 1) {
      return `Yesterday, ${timeString}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  } catch (error) {
    return 'Invalid date';
  }
};

// Determine transaction status based on isPending and isRejected
export const getTransactionStatus = (
  apiTx: any,
): 'Pending' | 'Approved' | 'Rejected' => {
  if (apiTx.isRejected === true) {
    return 'Rejected';
  }

  if (apiTx.isPending === true) {
    return 'Pending';
  }

  // If isPending is false and isRejected is false/null, then it's approved
  return 'Approved';
};

// Filter out rejected transactions from wallet balance calculation
export const filterRejectedTransactions = (transactions: any[]): any[] => {
  if (!transactions || transactions.length === 0) return [];

  return transactions.filter((tx) => tx.isRejected !== true);
};

// Helper function to get fallback transaction
const getFallbackTransaction = (): Transaction => {
  return {
    id: 'fallback',
    title: 'Unknown Transaction',
    date: 'Unknown date',
    amount: 0,
    type: 'income',
    category: 'General',
    icon: MdAccountBalance,
    colorClass: 'text-slate-600 dark:text-slate-400',
    iconBgClass: 'bg-slate-100 dark:bg-slate-700',
    status: 'Pending',
    amountColor: 'text-slate-600 dark:text-slate-400',
    badgeClass:
      'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  };
};

// Get transaction icon based on particular, status, and account type
const getTransactionIcon = (
  particular: string,
  status: string,
  accountType?: string,
) => {
  // Show different icons for different account types
  if (accountType === 'E_TEMPORYACCOUNT') {
    switch (status) {
      case 'Pending':
        return MdHourglassEmpty;
      case 'Approved':
        return MdCheckCircle;
      case 'Rejected':
        return MdCancel;
      default:
        return MdAccountBalanceWallet;
    }
  }

  if (!particular) {
    switch (status) {
      case 'Pending':
        return MdHourglassEmpty;
      case 'Approved':
        return MdCheckCircle;
      case 'Rejected':
        return MdCancel;
      default:
        return MdAccountBalance;
    }
  }

  const lowerParticular = particular.toLowerCase();

  if (
    lowerParticular.includes('topup') ||
    lowerParticular.includes('deposit')
  ) {
    return MdAttachMoney;
  } else if (lowerParticular.includes('payment')) {
    return MdPayment;
  } else if (
    lowerParticular.includes('shopping') ||
    lowerParticular.includes('marketplace')
  ) {
    return MdShoppingBag;
  } else if (
    lowerParticular.includes('food') ||
    lowerParticular.includes('cafe')
  ) {
    return MdCoffee;
  } else if (
    lowerParticular.includes('entertainment') ||
    lowerParticular.includes('subscription')
  ) {
    return MdMovie;
  } else if (lowerParticular.includes('wallet')) {
    return MdAccountBalanceWallet;
  }

  switch (status) {
    case 'Pending':
      return MdHourglassEmpty;
    case 'Approved':
      return MdCheckCircle;
    case 'Rejected':
      return MdCancel;
    default:
      return MdAccountBalance;
  }
};

// Helper function to format account type for display
const getAccountTypeDisplay = (accountType: string): string => {
  switch (accountType) {
    case 'E_PRIVATEACCOUNT':
      return 'E Private Account';
    case 'E_TEMPORYACCOUNT':
      return 'Temporary Account';
    case 'TEMPORARY_ACCOUNT':
      return 'Temporary Account';
    default:
      return accountType?.replace('_', ' ') || '';
  }
};

// Get transaction category with status and account type
const getTransactionCategory = (
  particular: string,
  accountType: string,
  status: string,
): string => {
  if (!particular) {
    return (
      getAccountTypeDisplay(accountType) ||
      (status === 'Pending' ? 'Pending Transaction' : 'Transaction')
    );
  }

  if (particular.toLowerCase().includes('topup')) {
    const accountDisplay = getAccountTypeDisplay(accountType);
    return status === 'Pending'
      ? `Pending Topup - ${accountDisplay}`
      : `Topup - ${accountDisplay}`;
  }

  const accountDisplay = getAccountTypeDisplay(accountType);
  return accountDisplay || (status === 'Pending' ? 'Pending' : 'Completed');
};

// Get color classes based on type, status, and account type
const getColorClasses = (
  type: string,
  status: string,
  accountType?: string,
  isRejected?: boolean,
) => {
  // Special styling for rejected transactions
  if (status === 'Rejected') {
    return {
      colorClass: 'text-red-600 dark:text-red-400',
      iconBgClass: 'bg-red-100 dark:bg-red-900/30',
      amountColor: 'text-red-600 dark:text-red-400', // Red for rejected amount
      badgeClass:
        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      showAmount: false, // Flag to hide amount for rejected transactions
    };
  }

  // Special styling for temporary account transactions
  if (accountType === 'E_TEMPORYACCOUNT') {
    switch (status) {
      case 'Pending':
        return {
          colorClass: 'text-purple-600 dark:text-purple-400',
          iconBgClass: 'bg-purple-100 dark:bg-purple-900/30',
          amountColor:
            type === 'CREDIT'
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-slate-600 dark:text-slate-300',
          badgeClass:
            'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
          showAmount: true,
        };
      case 'Approved':
        const amountColor =
          type === 'CREDIT'
            ? 'text-green-600 dark:text-green-400'
            : 'text-slate-600 dark:text-slate-300';
        return {
          colorClass: 'text-green-600 dark:text-green-400',
          iconBgClass: 'bg-green-100 dark:bg-green-900/30',
          amountColor: amountColor,
          badgeClass:
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
          showAmount: true,
        };
    }
  }

  // Original logic for other account types
  switch (status) {
    case 'Pending':
      return {
        colorClass: 'text-yellow-600 dark:text-yellow-400',
        iconBgClass: 'bg-yellow-100 dark:bg-yellow-900/30',
        amountColor: 'text-yellow-600 dark:text-yellow-400',
        badgeClass:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        showAmount: true,
      };
    case 'Approved':
      const amountColor =
        type === 'CREDIT'
          ? 'text-green-600 dark:text-green-400'
          : 'text-[#0d131c] dark:text-white';
      return {
        colorClass: 'text-green-600 dark:text-green-400',
        iconBgClass: 'bg-green-100 dark:bg-green-900/30',
        amountColor: amountColor,
        badgeClass:
          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        showAmount: true,
      };
    default:
      const defaultAmountColor =
        type === 'CREDIT'
          ? 'text-green-600 dark:text-green-400'
          : 'text-[#0d131c] dark:text-white';
      return {
        colorClass: 'text-slate-600 dark:text-slate-400',
        iconBgClass: 'bg-slate-100 dark:bg-slate-700',
        amountColor: defaultAmountColor,
        badgeClass:
          'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
        showAmount: true,
      };
  }
};

// Transform API transaction to UI transaction
export const transformApiTransaction = (apiTx: any): Transaction => {
  if (!apiTx) {
    return getFallbackTransaction();
  }

  // Determine status
  const status = getTransactionStatus(apiTx);

  // Get icon based on particular and status
  const Icon = getTransactionIcon(apiTx.particular, status, apiTx.accountType);

  // Get color classes based on type and status
  const colorClasses = getColorClasses(
    apiTx.type || 'CREDIT',
    status,
    apiTx.accountType,
    apiTx.isRejected,
  );

  // Determine if it's income or expense
  const transactionType =
    (apiTx.type || 'CREDIT') === 'CREDIT' ? 'income' : 'expense';

  // Get category with status and account type
  const category = getTransactionCategory(
    apiTx.particular,
    apiTx.accountType,
    status,
  );

  return {
    id: apiTx.id || `tx-${Date.now()}`,
    title: apiTx.particular || 'Transaction',
    date: formatTransactionDate(apiTx.createdAt || new Date().toISOString()),
    amount: apiTx.amount || 0,
    type: transactionType,
    category: category,
    icon: Icon,
    colorClass: colorClasses.colorClass,
    iconBgClass: colorClasses.iconBgClass,
    status: status,
    amountColor: colorClasses.amountColor,
    badgeClass: colorClasses.badgeClass,
    accountType: apiTx.accountType,
    showAmount: colorClasses.showAmount, // Add flag to control amount display
  };
};

// Get default cards
const getDefaultCards = (): BankCard[] => {
  return [
    {
      id: '1',
      type: 'E Private Account',
      balance: 0,
      currency: 'USD',
      isPrimary: true,
      theme: 'orange',
    },
    {
      id: '2',
      type: 'Temporary Virtual Account',
      balance: 0,
      currency: 'USD',
      isPrimary: false,
      theme: 'dark',
    },
  ];
};

// Helper function to calculate card balances from transactions (EXCLUDING rejected transactions)
const calculateCardBalances = (wallet: any, transactions: any[]) => {
  const balances = {
    eprivateAccount: wallet.eprivateAccount || 0,
    temporyAccount: wallet.temporyAccount || 0,
  };

  if (!transactions || transactions.length === 0) {
    return balances;
  }

  // Filter out rejected transactions
  const validTransactions = filterRejectedTransactions(transactions);

  if (validTransactions.length === 0) {
    return balances;
  }

  // Reset balances to calculate from valid transactions only
  balances.eprivateAccount = 0;
  balances.temporyAccount = 0;

  // Sort valid transactions by date (newest first)
  const sortedTransactions = [...validTransactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Calculate balances from valid transactions
  sortedTransactions.forEach((tx) => {
    if (tx.accountType === 'E_PRIVATEACCOUNT') {
      if (tx.type === 'CREDIT') {
        balances.eprivateAccount += tx.amount;
      } else if (tx.type === 'DEBIT') {
        balances.eprivateAccount -= tx.amount;
      }
    } else if (tx.accountType === 'E_TEMPORYACCOUNT') {
      if (tx.type === 'CREDIT') {
        balances.temporyAccount += tx.amount;
      } else if (tx.type === 'DEBIT') {
        balances.temporyAccount -= tx.amount;
      }
    }
  });

  return balances;
};

// Transform wallet data (EXCLUDING rejected transactions from balance calculation)
export const transformWalletData = (
  wallet: any,
  transactions: any[] = [],
): BankCard[] => {
  if (!wallet) {
    return getDefaultCards();
  }

  // Calculate balances based on valid transactions only (excluding rejected)
  const cardBalances = calculateCardBalances(wallet, transactions);

  return [
    {
      id: wallet.id || 'private-1',
      type: 'E Private Account',
      balance: cardBalances.eprivateAccount || wallet.eprivateAccount || 0,
      currency: 'USD',
      isPrimary: true,
      theme: 'orange',
    },
    {
      id: (wallet.id || 'temp') + '-temp',
      type: 'Temporary Virtual Account',
      balance: cardBalances.temporyAccount || wallet.temporyAccount || 0,
      currency: 'USD',
      isPrimary: false,
      theme: 'dark',
    },
  ];
};
