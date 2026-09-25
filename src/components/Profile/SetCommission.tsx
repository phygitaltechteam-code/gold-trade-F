import React, { useEffect, useState } from 'react';
import { Database, Edit2, Eye, EyeOff, X, Shield, AlertCircle } from 'lucide-react';
import { useGetComission, useSetComission } from '@/lib/react-query/commission';
import {
  useEditProfile,
  useGetProfile,
  useResetPassword,
  useResetPin,
} from '@/lib/react-query/admin';
import toast from 'react-hot-toast';
import { set } from 'lodash';

const SetCommission = () => {
  const [makerFee, setMakerFee] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { data: commission, refetch } = useGetComission();
  const { mutateAsync: setCommission } = useSetComission();
  const { mutateAsync: resetPassword } = useResetPassword();
  const { mutateAsync: resetPin } = useResetPin();
  const [fullname, setName] = useState('');
  const [photo, setphoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  // PIN Popup States
  const [showPinPopup, setShowPinPopup] = useState(false);
  const [securityPin, setSecurityPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data: profile } = useGetProfile();
  const { mutate: editProfile } = useEditProfile();

  // Calculate commission values for display
  const calculateCommission = (commissionPercent: number) => {
    const baseAmount = 10000000; // 1 Crore
    const calculatedCommission = (baseAmount * commissionPercent) / 100;
    return {
      baseAmount,
      calculatedCommission,
      commissionPercent
    };
  };

  const currentCommission = commission?.upcomingBrokeragePercent > 0
    ? commission?.upcomingBrokeragePercent
    : commission?.brokeragePercent || 0;

  // Get current input value or default to current commission
  const inputCommission = parseFloat(makerFee) || 0;
  const commissionData = calculateCommission(inputCommission);

  useEffect(() => {
    if (profile) {
      setName(profile.fullname);
      if (profile.photo) {
        setPreview(profile.photo);
      }
    }
  }, [profile]);

  useEffect(() => {
    if (commission) {
      const current = commission.upcomingBrokeragePercent > 0
        ? commission.upcomingBrokeragePercent
        : commission.brokeragePercent || 0;
      setMakerFee(current.toString());
    }
  }, [commission]);

  // preview selected image
  useEffect(() => {
    if (photo) {
      const objectUrl = URL.createObjectURL(photo);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [photo]);

  const profileEdit = () => {
    if (!photo) return;
    editProfile({
      data: {
        fullname,
        photo,
      },
    });
  };

  console.log('commisssionnn', commission);

  const [passwordError, setPasswordError] = useState('');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [PinformData, setPinFormData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: '',
  });
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  const pinRegex = /^\d{6}$/;
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [showPinState, setShowPinState] = useState({
    currentPin: false,
    newPin: false,
    confirmPin: false,
  });

  const togglePassword = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const togglePin = (field: keyof typeof showPinState) => {
    setShowPinState((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPinFormData({
      ...PinformData,
      [e.target.name]: e.target.value,
    });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (!passwordRegex.test(formData.newPassword)) {
      setPasswordError(
        'Password must be at least 8 characters long and contain at least 1 letter and 1 number.',
      );
      return;
    }

    resetPassword(formData, {
      onSuccess: () => {
        formData.currentPassword = '';
        formData.newPassword = '';
        formData.confirmPassword = '';
      },
    });
  };

  const handleResetPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (PinformData.newPin !== PinformData.confirmPin) {
      setPasswordError('Pins do not match');
      return;
    }

    if (!pinRegex.test(PinformData.newPin)) {
      setPasswordError('Pin must be a 6-digit number.');
      return;
    }

    resetPin(PinformData, {
      onSuccess: () => {
        PinformData.currentPin = '';
        PinformData.newPin = '';
        PinformData.confirmPin = '';
      },
    });
  };

  // Open PIN popup before saving
  const handleSaveClick = () => {
    const commissionValue = parseFloat(makerFee);
    if (isNaN(commissionValue) || commissionValue < 0) {
      toast.error('Please enter a valid commission percentage');
      return;
    }
    setShowPinPopup(true);
    setSecurityPin('');
    setError('');
  };

  // Submit with PIN verification - FIXED
  const submitWithPin = async () => {
    if (!securityPin || securityPin.length < 6) {
      setError('Please enter a valid 6-digit security PIN');
      return;
    }

    setIsSubmitting(true);
    try {
      const commissionValue = parseFloat(makerFee);
      if (isNaN(commissionValue) || commissionValue < 0) {
        toast.error('Please enter a valid commission percentage');
        return;
      }

      // Call the mutation with both parameters
      await setCommission({
        commission: commissionValue,
        securityPin: securityPin
      });

      // toast.success('Commission updated successfully!');
      setShowPinPopup(false);
      setSecurityPin('');
      refetch();
    } catch (error: any) {
      console.error('Error updating commission:', error);
      toast.error(error?.response?.data?.message || 'Failed to update commission. Please check your PIN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format Indian currency
  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <>
      <div className="font-sans min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
        <main className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <section className="overflow-hidden rounded-xl border border-stroke bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-stroke sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                  Set Commission
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 sm:gap-6 sm:py-6 lg:gap-8">
              <div className="space-y-2">
                <label className="text-gray-500 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
                  Commission (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={makerFee}
                    onChange={(e) => setMakerFee(e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white px-3 py-1 text-xs font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
                    placeholder="Enter commission percentage"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Commission Calculation - Single Line */}
            {inputCommission > 0 && (
              <div className="mt-4 rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3">
                <p className="text-sm flex flex-wrap items-center gap-1">
                  <span className="font-medium"> Commission Calculation:</span>
                  <span className="text-gray-600">₹1,00,00,000 ×</span>
                  <span>{inputCommission}%</span>
                  <span className="text-gray-600">=</span>
                  <span >
                    {formatIndianCurrency(commissionData.calculatedCommission)}
                  </span>
                </p>

              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-[#F27D26] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#E06D1F]"
                onClick={handleSaveClick}
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

export default SetCommission;