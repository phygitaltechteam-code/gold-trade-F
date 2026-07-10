import React from 'react';
import { Building2, CreditCard, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface ClientDetailStatsProps {
  walletAmountValue: number;
  blockedAmount: number;
  totalPnL: number;  // ← Changed from isActive/isVerified
}

export const ClientDetailStats: React.FC<ClientDetailStatsProps> = ({
  walletAmountValue,
  blockedAmount,
  totalPnL,  // ← Changed from isActive/isVerified
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-3">
      {/* Wallet Balance */}
      <div className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-5 shadow-sm md:p-6">
        <div className="absolute right-0 top-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
          <Building2 className="h-16 w-16" />
        </div>
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Wallet Balance
        </div>
        <div className="text-xl font-semibold text-slate-900 md:text-2xl">
          ₹{walletAmountValue.toLocaleString()}
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
          <ArrowUpRight className="h-3 w-3" /> Available Balance
        </div>
      </div>

      {/* Blocked Amount */}
      <div className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-5 shadow-sm md:p-6">
        <div className="absolute right-0 top-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
          <CreditCard className="h-16 w-16" />
        </div>
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Blocked Amount
        </div>
        <div className="text-xl font-semibold text-slate-900 md:text-2xl">
          ₹{blockedAmount.toLocaleString()}
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs font-medium text-orange-600">
          <div className="h-2 w-2 rounded-full bg-orange-500" /> Blocked
        </div>
      </div>

      {/* Total P&L - UPDATED */}
      <div className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-5 shadow-sm md:p-6">
        <div className="absolute right-0 top-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
          <TrendingUp className="h-16 w-16" />
        </div>
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Total P&L
        </div>
        <div className={`text-xl font-semibold md:text-2xl ${
          totalPnL > 0 ? 'text-green-600' : 
          totalPnL < 0 ? 'text-red-600' : 
          'text-slate-900'
        }`}>
          {totalPnL > 0 ? '+' : ''}₹{totalPnL.toFixed(2)}
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs font-medium">
          {totalPnL > 0 ? (
            <span className="flex items-center gap-1 text-green-600">
              <ArrowUpRight className="h-3 w-3" /> Profit
            </span>
          ) : totalPnL < 0 ? (
            <span className="flex items-center gap-1 text-red-600">
              <ArrowDownLeft className="h-3 w-3" /> Loss
            </span>
          ) : (
            <span className="text-slate-400">No P&L</span>
          )}
        </div>
      </div>
    </div>
  );
};