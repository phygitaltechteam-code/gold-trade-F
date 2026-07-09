import React from 'react';
import { Building2, CreditCard, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface ClientDetailStatsProps {
  walletAmountValue: number;
  blockedAmount: number;
  isActive: boolean;
  isVerified: boolean;
}

export const ClientDetailStats: React.FC<ClientDetailStatsProps> = ({
  walletAmountValue,
  blockedAmount,
  isActive,
  isVerified,
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

      {/* Account Status */}
      <div className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-5 shadow-sm md:p-6">
        <div className="absolute right-0 top-0 p-4 opacity-5 transition-opacity group-hover:opacity-10">
          <ShieldCheck className="h-16 w-16" />
        </div>
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Account Status
        </div>
        <div className="text-xl font-semibold text-slate-900 md:text-2xl">
          {isActive ? 'Active' : 'Inactive'}
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-orange-500"
            style={{ width: isVerified ? '100%' : '50%' }}
          />
        </div>
      </div>
    </div>
  );
};
