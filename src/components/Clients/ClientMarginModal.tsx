import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface ClientMarginModalProps {
  isOpen: boolean;
  onClose: () => void;
  intradayMargin: string;
  setIntradayMargin: (val: string) => void;
  holdingMargin: string;
  setHoldingMargin: (val: string) => void;
  marginPin: string;
  setMarginPin: (val: string) => void;
  showMarginPin: boolean;
  setShowMarginPin: (val: boolean) => void;
  handleMarginSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  walletBalance?: number;
}

export const ClientMarginModal: React.FC<ClientMarginModalProps> = ({
  isOpen,
  onClose,
  intradayMargin,
  setIntradayMargin,
  holdingMargin,
  setHoldingMargin,
  marginPin,
  setMarginPin,
  showMarginPin,
  setShowMarginPin,
  handleMarginSubmit,
  isPending,
  walletBalance = 100000,
}) => {
  if (!isOpen) return null;

  // Calculate values
  const intradayValue = parseFloat(intradayMargin) || 0;
  const holdingValue = parseFloat(holdingMargin) || 0;
  const maxIntradayTrade = walletBalance * intradayValue;
  const maxHoldingTrade = walletBalance * holdingValue;

  // Handle input change with X suffix
  const handleIntradayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace('X', '').trim();
    setIntradayMargin(value);
  };

  const handleHoldingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace('X', '').trim();
    setHoldingMargin(value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-5 shadow-xl md:p-6">
        <h3 className="mb-6 text-lg font-bold text-slate-900">
          Add Margin
        </h3>

        <form onSubmit={handleMarginSubmit} className="space-y-4">
          {/* Intraday Margin */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
              Intraday Margin
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Enter Intraday Margin"
                value={intradayMargin ? `${intradayMargin}X` : ''}
                onChange={handleIntradayChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-12 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                
              </span>
            </div>
          </div>

          {/* Intraday Dynamic Message */}
          {intradayValue > 0 && (
            <div className="mt-2 rounded-xl bg-orange-50 px-4 py-3 border border-orange-200">
              <p className="text-sm text-orange-700">
                 You can buy trades upto <strong>₹{maxIntradayTrade.toLocaleString('en-IN')}</strong>
              </p>
              <p className="text-xs text-orange-500 mt-1">
                Wallet: ₹{walletBalance.toLocaleString('en-IN')} × {intradayValue}X = ₹{maxIntradayTrade.toLocaleString('en-IN')}
              </p>
            </div>
          )}

          {/* Holding Margin */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
              Holding Margin
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Enter Holding Margin"
                value={holdingMargin ? `${holdingMargin}X` : ''}
                onChange={handleHoldingChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-12 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                
              </span>
            </div>
          </div>

          {/* Holding Dynamic Message */}
          {holdingValue > 0 && (
            <div className="mt-2 rounded-xl bg-blue-50 px-4 py-3 border border-blue-200">
              <p className="text-sm text-blue-700">
                You can hold trades upto <strong>₹{maxHoldingTrade.toLocaleString('en-IN')}</strong>
              </p>
              <p className="text-xs text-blue-500 mt-1">
                Wallet: ₹{walletBalance.toLocaleString('en-IN')} × {holdingValue}X = ₹{maxHoldingTrade.toLocaleString('en-IN')}
              </p>
            </div>
          )}

          {/* Security PIN */}
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
              Security PIN
            </label>
            <div className="relative">
              <input
                type={showMarginPin ? 'text' : 'password'}
                required
                placeholder="Enter Security PIN"
                value={marginPin}
                onChange={(e) => setMarginPin(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <button
                type="button"
                onClick={() => setShowMarginPin(!showMarginPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showMarginPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Buttons */}
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
              {isPending ? 'Processing...' : 'Add Margin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};