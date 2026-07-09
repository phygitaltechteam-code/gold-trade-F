import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface CommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: any;
  totalCommissionAmount: number;
  commissionAmount: string;
  setCommissionAmount: (val: string) => void;
  commissionPin: string;
  setCommissionPin: (val: string) => void;
  showCommissionPin: boolean;
  setShowCommissionPin: (val: boolean) => void;
  commissionType: 'credit' | 'debit';
  setCommissionType: (val: 'credit' | 'debit') => void;
  handleCommissionSubmit: (e: React.FormEvent) => void;
  isCommissionPending: boolean;
}

export const CommissionModal: React.FC<CommissionModalProps> = ({
  isOpen,
  onClose,
  profileData,
  totalCommissionAmount,
  commissionAmount,
  setCommissionAmount,
  commissionPin,
  setCommissionPin,
  showCommissionPin,
  setShowCommissionPin,
  commissionType,
  setCommissionType,
  handleCommissionSubmit,
  isCommissionPending,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-5 shadow-xl md:p-6">
        <h3 className="mb-4 text-lg font-bold text-slate-900">
          Commission Transaction
        </h3>

        {/* Show current financial summary */}
        <div className="mb-4 space-y-2 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <p className="text-sm font-medium text-blue-800">
            Current Financial Summary
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-blue-600">Total Commission:</span>
              <br />
              <strong className="text-blue-900">
                ₹{totalCommissionAmount.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        </div>

        {/* Show pending commission info for this transaction */}
        {profileData?.pendingCommission > 0 && (
          <div className="mb-4 rounded-lg border border-orange-100 bg-orange-50 p-3">
            <p className="text-sm text-orange-700">
              Current Pending Amount:{' '}
              <strong>
                ₹{profileData.pendingCommission.toLocaleString('en-IN')}
              </strong>
            </p>
            <p className="mt-1 text-xs text-orange-600">
              This transaction will update the pending amount
            </p>
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setCommissionType('credit')}
            className={`rounded-lg py-2 text-sm font-semibold transition-all ${
              commissionType === 'credit'
                ? 'bg-white text-orange-500 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Credit (+)
          </button>
          <button
            type="button"
            onClick={() => setCommissionType('debit')}
            className={`rounded-lg py-2 text-sm font-semibold transition-all ${
              commissionType === 'debit'
                ? 'bg-white text-orange-500 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Debit (-)
          </button>
        </div>

        <form onSubmit={handleCommissionSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
              Amount (₹)
            </label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              placeholder="Enter amount"
              value={commissionAmount}
              onChange={(e) => setCommissionAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
              Security PIN
            </label>
            <div className="relative">
              <input
                type={showCommissionPin ? 'text' : 'password'}
                required
                placeholder="Enter Security PIN"
                value={commissionPin}
                onChange={(e) => setCommissionPin(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <button
                type="button"
                onClick={() => setShowCommissionPin(!showCommissionPin)}
                className="text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showCommissionPin ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
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
              disabled={isCommissionPending}
              className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-medium text-white shadow-md shadow-orange-200 transition-colors hover:bg-orange-600 disabled:opacity-50"
            >
              {isCommissionPending ? 'Processing...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
