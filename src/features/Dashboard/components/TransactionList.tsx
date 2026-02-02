import React, {useState} from 'react';
import {Transaction} from '../types';
import {
  MdReceiptLong,
  MdChevronRight,
  MdExpandMore,
  MdExpandLess,
} from 'react-icons/md';

interface TransactionListProps {
  transactions: Transaction[];
  initialLimit?: number;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  initialLimit = 3,
}) => {
  const [showAll, setShowAll] = useState(false);

  const displayedTransactions = showAll
    ? transactions
    : transactions.slice(0, initialLimit);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-1 flex-col px-6 pb-28">
        <div className="mb-4 mt-2 flex items-center justify-between">
          <h3 className="text-lg font-bold leading-tight text-[#0d131c] dark:text-white">
            Recent Transactions
          </h3>
          <button className="text-sm font-semibold text-primary transition-colors hover:text-orange-600">
            See All
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 rounded-full bg-slate-100 p-6 dark:bg-slate-800">
            <MdReceiptLong className="h-12 w-12 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-slate-600 dark:text-slate-300">
            No transactions yet
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your transactions will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-6 pb-28">
      <div className="mb-4 mt-2 flex items-center justify-between">
        <h3 className="text-lg font-bold leading-tight text-[#0d131c] dark:text-white">
          Recent Transactions
          {/* ({transactions.length}) */}
        </h3>

        {transactions.length > initialLimit && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white dark:bg-primary/20 dark:hover:bg-primary"
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
        )}
      </div>

      <div className="flex flex-col gap-3">
        {displayedTransactions.map((tx) => {
          const Icon = tx.icon;

          const amountSign = tx.type === 'income' ? '+' : '-';

          const amountColor =
            tx.amountColor ||
            (tx.type === 'income'
              ? 'text-green-600 dark:text-green-400'
              : 'text-[#0d131c] dark:text-white');

          return (
            <div
              key={tx.id}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-white p-3 transition-colors hover:bg-slate-50 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tx.iconBgClass} ${tx.colorClass}`}
                >
                  <Icon size={28} />
                </div>
                <div className="flex flex-col">
                  <p className="text-base font-semibold leading-tight text-[#0d131c] dark:text-white">
                    {tx.title}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {tx.date}
                  </p>
                  {tx.status && (
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tx.badgeClass}`}
                      >
                        {tx.status === 'Pending' && (
                          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
                        )}
                        {tx.status === 'Approved' && (
                          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
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
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {tx.category}
                  </p>
                </div>

                {tx.status === 'Approved' && tx.type === 'income' && (
                  <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Credit Approved
                  </span>
                )}

                {tx.status === 'Rejected' && (
                  <span className="mt-1 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    Transaction Rejected
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
