// components/TransactionList.tsx
import React, {useState, useMemo} from 'react';
import {
  MdReceiptLong,
  MdChevronRight,
  MdExpandMore,
  MdExpandLess,
  MdPerson,
  MdAccountBalanceWallet,
  MdSwapHoriz,
  MdShoppingBag,
  MdLocalTaxi,
  MdAccountBalance,
  MdAttachMoney,
} from 'react-icons/md';

interface Transaction {
  id: string;
  title: string;
  particular?: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  beneficiary?: {
    fullName: string;
    accountNumber?: string;
  };
  createdAt: string;
  isPending?: boolean;
  isRejected?: boolean;
  icon?: React.ComponentType<{size: number}>;
  iconBgClass?: string;
  colorClass?: string;
  amountColor?: string;
  badgeClass?: string;
  status?: string;
  category?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  initialLimit?: number;
  onTransactionClick?: (transactionId: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  initialLimit = 10,
  onTransactionClick,
}) => {
  const [showAll, setShowAll] = useState(false);

  // Sort transactions by date (newest first)
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [transactions]);

  const displayedTransactions = showAll
    ? sortedTransactions
    : sortedTransactions.slice(0, initialLimit);

  const handleTransactionClick = (transactionId: string) => {
    if (onTransactionClick) {
      onTransactionClick(transactionId);
    }
  };

  // Check if transactions is empty or undefined
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 rounded-full bg-slate-100 p-6">
          <MdReceiptLong className="h-12 w-12 text-slate-400" />
        </div>
        <p className="text-slate-600">No transactions yet</p>
        <p className="text-sm text-slate-500">
          Your transactions will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {transactions.length > initialLimit && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white"
          >
            {showAll ? (
              <>
                <MdExpandLess className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <MdExpandMore className="h-4 w-4" />
                See All
              </>
            )}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {displayedTransactions.map((tx) => {
          // Determine amount sign based on type
          const amountSign = tx.type === 'CREDIT' ? '+' : '-';
          const amountColor =
            tx.amountColor ||
            (tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900');

          // Get icon component or use default
          const Icon = tx.icon || MdAttachMoney;

          // Format date
          const formattedDate = new Date(tx.createdAt).toLocaleDateString(
            'en-US',
            {
              month: 'short',
              day: 'numeric',
            },
          );

          return (
            <div
              key={tx.id}
              onClick={() => handleTransactionClick(tx.id)}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-white p-3 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tx.iconBgClass || 'bg-slate-100'} ${tx.colorClass || 'text-slate-600'}`}
                >
                  <Icon size={28} />
                </div>
                <div className="flex flex-col">
                  <p className="text-base font-semibold leading-tight text-slate-900">
                    {tx.title}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {formattedDate}
                  </p>
                  {tx.status && tx.status !== 'Completed' && (
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tx.badgeClass || 'bg-slate-100 text-slate-700'}`}
                      >
                        {tx.status === 'Pending' && (
                          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
                        )}
                        {tx.status === 'Rejected' && (
                          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500"></span>
                        )}
                        {tx.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="text-right">
                  <p className={`text-base font-bold ${amountColor}`}>
                    {amountSign}${tx.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {tx.category || (tx.type === 'CREDIT' ? 'Credit' : 'Debit')}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <span>View details</span>
                  <MdChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
