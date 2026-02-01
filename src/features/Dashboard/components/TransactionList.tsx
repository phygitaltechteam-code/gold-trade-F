import React from 'react';
import {Transaction} from '../types';

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
}) => {
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

      <div className="flex flex-col gap-3">
        {transactions.map((tx) => {
          const Icon = tx.icon;
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
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`text-base font-bold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-[#0d131c] dark:text-white'}`}
                >
                  {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {tx.category}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
