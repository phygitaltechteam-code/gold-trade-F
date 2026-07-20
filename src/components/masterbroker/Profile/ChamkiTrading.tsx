import React, { useEffect, useState } from 'react';
import { Database, Clock3, ChevronUp, ChevronDown, Shield, Eye, EyeOff, X, AlertCircle } from 'lucide-react';
import { useGetTradeTime, useSetTradingTime } from '@/lib/api/masterpanelapi/profile';
import toast from 'react-hot-toast';

const ChamkiTrading = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isGttEnabled, setIsGttEnabled] = useState(false);
  const [isStopLossEnabled, setIsStopLossEnabled] = useState(false);
  const [isLimitEnabled, setIsLimitEnabled] = useState(false);
  const [isTargetEnabled, setIsTargetEnabled] = useState(false);
  const [isStopLossTargetEnabled, setIsStopLossTargetEnabled] = useState(false);
  
  // PIN Popup States
  const [showPinPopup, setShowPinPopup] = useState(false);
  const [securityPin, setSecurityPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { data: tradeData } = useGetTradeTime();
  console.log('tradeee', tradeData);
  const { mutateAsync: setTradeTime } = useSetTradingTime();

  useEffect(() => {
    if (tradeData) {
      setIsEnabled(tradeData?.holdingStatus);
      setIsGttEnabled(tradeData?.gttStatus);
      setIsStopLossEnabled(tradeData?.stoplossStatus);
      setIsLimitEnabled(tradeData?.limitStatus);
      setIsTargetEnabled(tradeData?.targetStatus);
      setIsStopLossTargetEnabled(tradeData?.stoplossAndTargetStatus);
    }
  }, [tradeData]);

  const handleStopLossToggle = () => {
    const newStopLoss = !isStopLossEnabled;
    setIsStopLossEnabled(newStopLoss);
    if (!newStopLoss) {
      setIsStopLossTargetEnabled(false);
    }
  };

  const handleTargetToggle = () => {
    const newTarget = !isTargetEnabled;
    setIsTargetEnabled(newTarget);
    if (!newTarget) {
      setIsStopLossTargetEnabled(false);
    }
  };

  const handleStopLossTargetToggle = () => {
    const newValue = !isStopLossTargetEnabled;
    setIsStopLossTargetEnabled(newValue);
    if (newValue) {
      setIsStopLossEnabled(true);
      setIsTargetEnabled(true);
    }
  };

  // Open PIN popup before saving
  const handleSaveClick = () => {
    setShowPinPopup(true);
    setSecurityPin('');
    setError('');
  };

  // Submit with PIN verification
  const submitWithPin = async () => {
    if (!securityPin || securityPin.length < 4) {
      setError('Please enter a valid security PIN (minimum 4 digits)');
      return;
    }

    setIsSubmitting(true);
    try {
      await setTradeTime({
        holdingStatus: isEnabled,
        gttStatus: isGttEnabled,
        stoplossStatus: isStopLossEnabled,
        limitStatus: isLimitEnabled,
        targetStatus: isTargetEnabled,
        stoplossAndTargetStatus: isStopLossTargetEnabled,
        securityPin: securityPin
      });
      
      // toast.success('Trading settings updated successfully!');
      setShowPinPopup(false);
      setSecurityPin('');
      setError('');
    } catch (error: any) {
      console.error('Error updating trading settings:', error);
      toast.error(error?.response?.data?.message || 'Failed to update settings. Please check your PIN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current settings summary for display
  const getSettingsSummary = () => {
    const settings = [];
    if (isEnabled) settings.push('Holding');
    if (isLimitEnabled) settings.push('Limit');
    if (isGttEnabled) settings.push('GTT');
    if (isStopLossEnabled) settings.push('Stop Loss');
    if (isTargetEnabled) settings.push('Target');
    if (isStopLossTargetEnabled) settings.push('Stop Loss + Target');
    return settings.length > 0 ? settings.join(', ') : 'All Disabled';
  };

  return (
    <>
      <div className="font-sans min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
        <main className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <section className="overflow-hidden rounded-xl border border-stroke bg-white p-6 shadow-sm">
            <div className="border-b border-stroke pb-4">
              <h2 className="text-lg font-semibold">Order Setting</h2>
            </div>

            <div className="py-3">
              <table className="w-full border-collapse">
                <tbody>
                  {/* Holding Status Row */}
                  <tr className="border-b border-stroke">
                    <td className="py-4 pr-6">
                      <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                        Holding Status
                      </label>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsEnabled(!isEnabled)}
                          className={`relative h-7 w-14 rounded-full transition-all duration-300 ${isEnabled ? 'bg-green-500' : 'bg-neutral-600'
                            }`}
                        >
                          <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${isEnabled ? 'left-8' : 'left-1'
                              }`}
                          />
                        </button>
                        <span className="text-sm font-medium">
                          {isEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Limit Row */}
                  <tr className="border-b border-stroke">
                    <td className="py-4 pr-6">
                      <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                        Limit
                      </label>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsLimitEnabled(!isLimitEnabled)}
                          className={`relative h-7 w-14 rounded-full transition-all duration-300 ${isLimitEnabled ? 'bg-green-500' : 'bg-neutral-600'
                            }`}
                        >
                          <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${isLimitEnabled ? 'left-8' : 'left-1'
                              }`}
                          />
                        </button>
                        <span className="text-sm font-medium">
                          {isLimitEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* GTT Row */}
                  <tr className="border-b border-stroke">
                    <td className="py-4 pr-6">
                      <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                        GTT
                      </label>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsGttEnabled(!isGttEnabled)}
                          className={`relative h-7 w-14 rounded-full transition-all duration-300 ${isGttEnabled ? 'bg-green-500' : 'bg-neutral-600'
                            }`}
                        >
                          <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${isGttEnabled ? 'left-8' : 'left-1'
                              }`}
                          />
                        </button>
                        <span className="text-sm font-medium">
                          {isGttEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Stop Loss Row */}
                  <tr className="border-b border-stroke">
                    <td className="py-4 pr-6">
                      <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                        Stop Loss
                      </label>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleStopLossToggle}
                          className={`relative h-7 w-14 rounded-full transition-all duration-300 ${isStopLossEnabled ? 'bg-green-500' : 'bg-neutral-600'
                            }`}
                        >
                          <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${isStopLossEnabled ? 'left-8' : 'left-1'
                              }`}
                          />
                        </button>
                        <span className="text-sm font-medium">
                          {isStopLossEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Target Row */}
                  <tr className="border-b border-stroke">
                    <td className="py-4 pr-6">
                      <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                        Target
                      </label>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleTargetToggle}
                          className={`relative h-7 w-14 rounded-full transition-all duration-300 ${isTargetEnabled ? 'bg-green-500' : 'bg-neutral-600'
                            }`}
                        >
                          <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${isTargetEnabled ? 'left-8' : 'left-1'
                              }`}
                          />
                        </button>
                        <span className="text-sm font-medium">
                          {isTargetEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Stop Loss + Target Row */}
                  <tr className="border-b border-stroke">
                    <td className="py-4 pr-6">
                      <label className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                        Stop Loss + Target
                      </label>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleStopLossTargetToggle}
                          className={`relative h-7 w-14 rounded-full transition-all duration-300 ${isStopLossTargetEnabled
                              ? 'bg-green-500'
                              : 'bg-neutral-600'
                            }`}
                        >
                          <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${isStopLossTargetEnabled ? 'left-8' : 'left-1'
                              }`}
                          />
                        </button>
                        <span className="text-sm font-medium">
                          {isStopLossTargetEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t border-stroke pt-1">
              <button
                onClick={handleSaveClick}
                type="button"
                className="flex items-center gap-2 rounded-lg bg-[#F27D26] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#E06D1F]"
              >
                <Database className="h-4 w-4" />
                <span>Save</span>
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* PIN Popup Modal */}
      {showPinPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                Verify Security PIN
              </h3>
              <button
                onClick={() => {
                  setShowPinPopup(false);
                  setSecurityPin('');
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 rounded-lg border border-orange-100 bg-orange-50 p-3">
              <p className="text-sm text-orange-700">
                <strong>Settings Update:</strong> You are about to update trading settings
              </p>
              <p className="text-xs text-orange-600 mt-1">
                <span className="font-medium">Current Settings:</span> {getSettingsSummary()}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                Enter your security PIN to confirm this change.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">
                  Security PIN
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    required
                    placeholder="Enter 6-digit security PIN"
                    value={securityPin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 6) {
                        setSecurityPin(value);
                        setError('');
                      }
                    }}
                    maxLength={6}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {error && (
                  <p className="mt-1 text-xs font-medium text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Enter the 6-digit security PIN set for your account
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinPopup(false);
                    setSecurityPin('');
                    setError('');
                  }}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitWithPin}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-medium text-white shadow-md shadow-orange-200 transition-colors hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </span>
                  ) : (
                    'Confirm Update'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChamkiTrading;