// import React from 'react'

// const ResetPassword = () => {
//   return (
//     <div>

//     </div>
//   )
// }

// export default ResetPassword

import React, {useEffect, useState} from 'react';
import {Database, Edit2, Eye, EyeOff, X} from 'lucide-react';
import {useGetComission, useSetComission} from '@/lib/react-query/commission';
import {
  useEditProfile,
  useGetProfile,
  useResetPassword,
  useResetPin,
} from '@/lib/react-query/admin';
import {set} from 'lodash';

const ResetPassword = () => {
  const [makerFee, setMakerFee] = useState('0.15');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const {data: commission} = useGetComission();
  const {mutateAsync: setCommission} = useSetComission();
  const {mutateAsync: resetPassword} = useResetPassword();
  const {mutateAsync: resetPin} = useResetPin();
  const [fullname, setName] = useState('');
  const [photo, setphoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  const {data: profile} = useGetProfile();

  const {mutate: editProfile} = useEditProfile();

  useEffect(() => {
    if (profile) {
      setName(profile.fullname);

      // existing image from backend
      if (profile.photo) {
        setPreview(profile.photo);
      }
    }
  }, [profile]);

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
  const [error, setError] = useState('');
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
  const [showPin, setShowPin] = useState({
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
  const togglePin = (field: keyof typeof showPin) => {
    setShowPin((prev) => ({
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

    setError('');

    // Password match validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Password validation
    if (!passwordRegex.test(formData.newPassword)) {
      setError(
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

    setError('');

    // Pin match validation
    if (PinformData.newPin !== PinformData.confirmPin) {
      setError('Pins do not match');
      return;
    }

    // Pin validation
    if (!pinRegex.test(PinformData.newPin)) {
      setError('Pin must be a 6-digit number.');
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
  const submit = () => {
    setCommission(Number(makerFee));
  };
  return (
    <>
      <div className="font-sans min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
        <main className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <section className="overflow-hidden rounded-xl border border-stroke bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-stroke sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                  Reset Password
                </h2>
              </div>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 sm:gap-6 sm:py-6 lg:gap-8">
                {/* Old Password */}
                <div className="space-y-2">
                  <label className="text-gray-500 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
                    Old Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword.currentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required
                      placeholder="Enter old password"
                      className="w-full rounded-lg border border-stroke bg-white px-3 py-1 pr-10 text-xs font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:rounded-xl sm:px-4 sm:py-2 sm:pr-12 sm:text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => togglePassword('currentPassword')}
                      className="text-gray-500 absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword.currentPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-gray-500 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
                    New Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword.newPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      placeholder="Enter new password"
                      className="w-full rounded-lg border border-stroke bg-white px-3 py-1 pr-10 text-xs font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:rounded-xl sm:px-4 sm:py-2 sm:pr-12 sm:text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => togglePassword('newPassword')}
                      className="text-gray-500 absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword.newPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-gray-500 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword.confirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm password"
                      className="w-full rounded-lg border border-stroke bg-white px-3 py-1 pr-10 text-xs font-medium outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:rounded-xl sm:px-4 sm:py-2 sm:pr-12 sm:text-sm"
                    />

                    <button
                      type="button"
                      onClick={() => togglePassword('confirmPassword')}
                      className="text-gray-500 absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword.confirmPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {error && (
                    <p className="text-xs font-medium text-red-500">{error}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-[#F27D26] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#E06D1F]"
                >
                  <Database className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </>
  );
};

export default ResetPassword;
