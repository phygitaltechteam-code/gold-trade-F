import React, {useState} from 'react';
import {MdVisibilityOff, MdVisibility, MdCheck, MdError} from 'react-icons/md';
import {Header} from './ui/Header';
import {useChangePassword} from './profilemutation'; // Make sure this is the correct path

const ChangePassword: React.FC = () => {
  const {
    mutate: changePassword,
    isLoading,
    isSuccess,
    error,
    reset,
  } = useChangePassword();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasNumber: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));

    if (errors[name]) {
      setErrors((prev) => ({...prev, [name]: ''}));
    }

    if (error || isSuccess) {
      reset();
    }

    if (name === 'newPassword') {
      validatePasswordRequirements(value);
    }
  };

  // Validate password requirements
  const validatePasswordRequirements = (password: string) => {
    setPasswordRequirements({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
    });
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.newPassword)) {
      newErrors.newPassword =
        'Password must contain at least one uppercase letter';
    } else if (!/\d/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one number';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset messages
    setSuccessMessage('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Prepare data for API - only send currentPassword and newPassword
    const passwordData = {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    };

    // Call the mutation
    changePassword(passwordData, {
      onSuccess: () => {
        // Show success message
        setSuccessMessage('Password changed successfully!');

        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordRequirements({
          minLength: false,
          hasUpperCase: false,
          hasNumber: false,
        });

        // Redirect to the account hub page
        window.location.href = '/accounthub/acounthub';
      },
    });
  };

  // Check if all requirements are met
  const allRequirementsMet =
    passwordRequirements.minLength &&
    passwordRequirements.hasUpperCase &&
    passwordRequirements.hasNumber;

  return (
    <div className="bg-background-light dark:bg-background-dark flex flex-1 flex-col">
      <Header title="Change Password" />

      <main className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-4 py-2">
        <p className="pb-6 pt-2 text-base font-normal leading-normal text-slate-900/70 dark:text-white/70">
          Your new password must be different from previous used passwords.
        </p>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <div className="flex items-center gap-2">
              <MdCheck className="text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* Mutation Error Message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <div className="flex items-center gap-2">
              <MdError className="text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {error instanceof Error
                  ? error.message
                  : 'Failed to change password. Please try again.'}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-5">
            {/* Current Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-normal text-slate-900 dark:text-white">
                Current Password
              </label>
              <div className="group relative flex items-center">
                <input
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className={`flex h-14 w-full rounded-xl border bg-white px-4 pr-12 text-base text-slate-900 transition-all placeholder:text-[#9c7349] focus:outline-none focus:ring-1 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 ${
                    errors.currentPassword
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-[#e8dbce] focus:border-primary focus:ring-primary dark:border-white/10'
                  }`}
                  placeholder="Enter current password"
                  type={showPasswords.current ? 'text' : 'password'}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute bottom-0 right-0 top-0 flex items-center justify-center px-4 text-[#9c7349] transition-colors hover:text-primary focus:outline-none dark:text-white/50 dark:hover:text-primary"
                  disabled={isLoading}
                >
                  {showPasswords.current ? (
                    <MdVisibilityOff className="text-2xl" />
                  ) : (
                    <MdVisibility className="text-2xl" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-normal text-slate-900 dark:text-white">
                New Password
              </label>
              <div className="relative flex items-center">
                <input
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`flex h-14 w-full rounded-xl border bg-white px-4 pr-12 text-base text-slate-900 transition-all placeholder:text-[#9c7349] focus:outline-none focus:ring-1 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 ${
                    errors.newPassword
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-[#e8dbce] focus:border-primary focus:ring-primary dark:border-white/10'
                  }`}
                  placeholder="Enter new password"
                  type={showPasswords.new ? 'text' : 'password'}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute bottom-0 right-0 top-0 flex items-center justify-center px-4 text-[#9c7349] transition-colors hover:text-primary focus:outline-none dark:text-white/50 dark:hover:text-primary"
                  disabled={isLoading}
                >
                  {showPasswords.new ? (
                    <MdVisibilityOff className="text-2xl" />
                  ) : (
                    <MdVisibility className="text-2xl" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium leading-normal text-slate-900 dark:text-white">
                Confirm New Password
              </label>
              <div className="relative flex items-center">
                <input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`flex h-14 w-full rounded-xl border bg-white px-4 pr-12 text-base text-slate-900 transition-all placeholder:text-[#9c7349] focus:outline-none focus:ring-1 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-[#e8dbce] focus:border-primary focus:ring-primary dark:border-white/10'
                  }`}
                  placeholder="Re-enter new password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute bottom-0 right-0 top-0 flex items-center justify-center px-4 text-[#9c7349] transition-colors hover:text-primary focus:outline-none dark:text-white/50 dark:hover:text-primary"
                  disabled={isLoading}
                >
                  {showPasswords.confirm ? (
                    <MdVisibilityOff className="text-2xl" />
                  ) : (
                    <MdVisibility className="text-2xl" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Requirements */}
          <div className="mb-8 mt-8">
            <p className="mb-3 text-sm font-medium text-slate-900/80 dark:text-white/80">
              Password requirements:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full ${
                    passwordRequirements.minLength
                      ? 'bg-primary/10 dark:bg-primary/20'
                      : 'border border-[#e8dbce] dark:border-white/20'
                  }`}
                >
                  {passwordRequirements.minLength && (
                    <MdCheck className="text-[14px] font-bold text-primary" />
                  )}
                </div>
                <p
                  className={`text-sm ${
                    passwordRequirements.minLength
                      ? 'font-medium text-slate-900 dark:text-white'
                      : 'font-normal text-slate-900 opacity-60 dark:text-white'
                  }`}
                >
                  Min 8 characters
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full ${
                    passwordRequirements.hasUpperCase
                      ? 'bg-primary/10 dark:bg-primary/20'
                      : 'border border-[#e8dbce] dark:border-white/20'
                  }`}
                >
                  {passwordRequirements.hasUpperCase && (
                    <MdCheck className="text-[14px] font-bold text-primary" />
                  )}
                </div>
                <p
                  className={`text-sm ${
                    passwordRequirements.hasUpperCase
                      ? 'font-medium text-slate-900 dark:text-white'
                      : 'font-normal text-slate-900 opacity-60 dark:text-white'
                  }`}
                >
                  At least 1 uppercase letter
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full ${
                    passwordRequirements.hasNumber
                      ? 'bg-primary/10 dark:bg-primary/20'
                      : 'border border-[#e8dbce] dark:border-white/20'
                  }`}
                >
                  {passwordRequirements.hasNumber && (
                    <MdCheck className="text-[14px] font-bold text-primary" />
                  )}
                </div>
                <p
                  className={`text-sm ${
                    passwordRequirements.hasNumber
                      ? 'font-medium text-slate-900 dark:text-white'
                      : 'font-normal text-slate-900 opacity-60 dark:text-white'
                  }`}
                >
                  At least 1 number
                </p>
              </div>
            </div>

            {/* Requirement Status */}
            {formData.newPassword && (
              <div className="mt-4">
                <p
                  className={`text-sm font-medium ${
                    allRequirementsMet
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {allRequirementsMet
                    ? '✓ All requirements met'
                    : 'Complete all requirements above'}
                </p>
              </div>
            )}
          </div>

          <div className="bg-background-light dark:bg-background-dark p-4 pb-8">
            <button
              type="submit"
              disabled={isLoading || !allRequirementsMet}
              className={`bg-gray-400 dark:bg-gray-600 cursor-not-allowed ${
                isLoading || !allRequirementsMet
                  ? 'bg-gray-400 dark:bg-gray-600'
                  : 'bg-primary active:scale-[0.98]'
              } flex h-14 w-full items-center justify-center rounded-xl px-6 text-base font-bold text-white shadow-lg shadow-primary/20 transition-transform hover:bg-primary/90`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating...
                </span>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ChangePassword;
