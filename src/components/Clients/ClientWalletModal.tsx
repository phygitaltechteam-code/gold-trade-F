import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface ClientWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletActionType: 'add' | 'withdraw';
  setWalletActionType: (val: 'add' | 'withdraw') => void;
  walletAmountValue: number;
  walletAmount: string;
  setWalletAmount: (val: string) => void;
  walletPin: string;
  setWalletPin: (val: string) => void;
  showWalletPin: boolean;
  setShowWalletPin: (val: boolean) => void;
  handleWalletSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export const ClientWalletModal: React.FC<ClientWalletModalProps> = ({
  isOpen,
  onClose,
  walletActionType,
  setWalletActionType,
  walletAmountValue,
  walletAmount,
  setWalletAmount,
  walletPin,
  setWalletPin,
  showWalletPin,
  setShowWalletPin,
  handleWalletSubmit,
  isPending,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-5 shadow-xl md:p-6">
        <h3 className="mb-4 text-lg font-bold text-slate-900">
          {walletActionType === 'add' ? 'Deposit Money' : 'Withdraw Money'}
        </h3>

        {/* Show current wallet balance */}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
            Current Wallet Balance
          </label>
          <div className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900">
            ₹{walletAmountValue.toLocaleString()}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setWalletActionType('add')}
            className={`rounded-lg py-2 text-sm font-semibold transition-all ${
              walletActionType === 'add'
                ? 'bg-white text-orange-500 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Deposit
          </button>
          <button
            type="button"
            onClick={() => setWalletActionType('withdraw')}
            className={`rounded-lg py-2 text-sm font-semibold transition-all ${
              walletActionType === 'withdraw'
                ? 'bg-white text-orange-500 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Withdraw
          </button>
        </div>

        <form onSubmit={handleWalletSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
              Amount (₹)
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              placeholder="Enter Amount"
              value={walletAmount}
              onChange={(e) => setWalletAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
              Security PIN
            </label>
            <div className="relative">
              <input
                type={showWalletPin ? 'text' : 'password'}
                required
                placeholder="Enter Security PIN"
                value={walletPin}
                onChange={(e) => setWalletPin(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <button
                type="button"
                onClick={() => setShowWalletPin(!showWalletPin)}
                className="text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showWalletPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-medium text-white shadow-md shadow-orange-200 transition-colors hover:bg-orange-600 disabled:opacity-50"
            >
              {isPending ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
