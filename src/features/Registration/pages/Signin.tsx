/*eslint-disable*/
import {useAuthContext} from '@/context/AuthContext';
import {api} from '@/utils/axios';
import {useMutation} from '@tanstack/react-query';
import {useNavigate} from '@tanstack/react-router';
import {AxiosError} from 'axios';
import React, {useState, useEffect} from 'react';
import toast from 'react-hot-toast';

const Signin: React.FC = () => {
  const {setIsAuthenticated} = useAuthContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const navigate = useNavigate();

  interface SignInPayload {
    username: string;
    password: string;
  }

  // Validate password on change or after form submission
  useEffect(() => {
    if (formSubmitted || password) {
      validatePassword(password);
    }
  }, [password, formSubmitted]);

  const {mutate, isPending} = useMutation({
    mutationFn: async (data: SignInPayload) => {
      const response = await api.post('/users/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Login successful:', data);
      const newData = JSON.stringify(data, null, 2);
      if (newData) {
        localStorage.setItem('token', newData);
        setIsAuthenticated(true);
        window.location.href = '/dashboard';
      }
    },
    onError: (error: AxiosError<any>) => {
      const message = error.response?.data?.message || 'Login failed';
      if (message === 'Pending') {
        navigate({
          to: '/verification',
        });
      }
      if (message === 'Rejected') {
        navigate({
          to: '/rejected',
        });
      }
      if (message === 'User does not exist') {
        toast.error('User does not exist. Please sign up first.');
      }
      if (message === 'Validation failed') {
        toast.error('Invalid Credentials. Please check your credentials.');
      }
    },
  });

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove any non-digit characters
    const cleanedPhone = phone.replace(/\D/g, '');

    // Check if it's exactly 10 digits
    const isValid = /^\d{10}$/.test(cleanedPhone);

    if (phone && !isValid) {
      setPhoneError('Please enter exactly 10 digits');
      return false;
    } else {
      setPhoneError('');
      return true;
    }
  };

  const validatePassword = (pass: string): boolean => {
    if (!pass.trim()) {
      setPasswordError('Password is required');
      return false;
    } else if (pass.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only allow digits and spaces
    const cleanedValue = value.replace(/[^\d\s]/g, '');

    // Limit to 10 digits (plus spaces)
    const digitsOnly = cleanedValue.replace(/\s/g, '');
    if (digitsOnly.length <= 10) {
      setUsername(cleanedValue);

      // Validate as user types
      if (cleanedValue) {
        validatePhoneNumber(cleanedValue);
      } else {
        setPhoneError('');
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
  };

  const handleSignIn = () => {
    setFormSubmitted(true);

    // Clean the phone number before sending
    const cleanedPhone = username.replace(/\D/g, '');

    // Validate phone number
    const isPhoneValid = validatePhoneNumber(cleanedPhone);
    if (!cleanedPhone) {
      setPhoneError('Mobile number is required');
    }

    // Validate password
    const isPasswordValid = validatePassword(password);

    // If either validation fails, stop submission
    if (!isPhoneValid || !cleanedPhone || !isPasswordValid) {
      return;
    }

    mutate({username: cleanedPhone, password});
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignIn();
    }
  };

  // Check if form can be submitted
  const canSubmit = () => {
    const cleanedPhone = username.replace(/\D/g, '');
    return (
      !isPending &&
      cleanedPhone.length === 10 &&
      password.length >= 8 &&
      !phoneError &&
      !passwordError
    );
  };

  return (
    <div className="dark:bg-gray-950 flex min-h-screen w-full justify-center bg-white font-['Inter'] antialiased selection:bg-[#F57F3D]/30">
      {/* Responsive container */}
      <div className="border-gray-200/60 dark:border-gray-800/60 relative mx-auto min-h-[min(844px,90vh)] w-full max-w-[min(390px,95vw,480px)] overflow-hidden bg-white dark:bg-[#221610] md:min-h-[600px] md:max-w-[420px] md:rounded-2xl">
        {/* Background patterns */}
        <div className="bg-premium-pattern pointer-events-none absolute inset-0 z-0 opacity-100 dark:opacity-5" />
        <div className="from-gray-100/40 pointer-events-none absolute inset-0 z-0 bg-gradient-to-br via-transparent to-transparent dark:from-white/5" />

        {/* Safe area top spacer - responsive */}
        <div className="relative z-10 h-6 w-full md:h-8" />

        {/* Main content */}
        <div className="relative z-10 flex flex-1 flex-col justify-between px-6 pb-6 pt-8 md:px-8 md:pb-8 md:pt-10">
          <div className="mb-8 flex flex-col items-center">
            {/* Logo row: icon + brand name */}
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F57F3D]/10 md:h-12 md:w-12">
                <span className="material-symbols-outlined text-2xl text-[#F57F3D] md:text-3xl">
                  account_balance_wallet
                </span>
              </div>
              <span className="text-lg font-semibold text-[#0d131c] dark:text-white md:text-xl">
                Swiss-Quote
              </span>
            </div>

            {/* Welcome text */}
            <h1 className="mb-2 text-3xl font-bold leading-tight tracking-tight text-[#0d131c] dark:text-white md:text-4xl">
              Welcome back
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm text-center text-base md:text-lg">
              Enter your details to access your account.
            </p>
          </div>

          {/* Form */}
          <div className="mt-2 flex flex-col gap-2">
            {/* Mobile Number */}
            <div className="flex flex-col gap-2 md:gap-3">
              <label className="dark:text-gray-200 text-sm font-medium leading-normal text-[#0d131c] md:text-base">
                Mobile Number
              </label>
              <div className="flex gap-3">
                <input
                  className={`bg-gray-50/80 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 placeholder-gray-400 h-12 flex-1 rounded-md border px-4 text-base backdrop-blur-sm transition-shadow focus:border-[#F57F3D] focus:ring-[#F57F3D] dark:text-white md:h-12 md:text-lg ${
                    phoneError ? 'border-red-500 dark:border-red-500' : ''
                  }`}
                  placeholder="98765 43210"
                  type="tel"
                  value={username}
                  onChange={handlePhoneChange}
                  onKeyPress={handleKeyPress}
                  maxLength={12} // Allow for spaces: 10 digits + 2 spaces max
                  inputMode="numeric"
                />
              </div>
              {phoneError && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-500 dark:text-red-400">
                  <span className="material-symbols-outlined text-sm">
                    error
                  </span>
                  {phoneError}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2 md:gap-3">
              <label className="dark:text-gray-200 text-sm font-medium leading-normal text-[#0d131c] md:text-base">
                Password
              </label>
              <div className="relative">
                <input
                  className={`bg-gray-50/80 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 placeholder-gray-400 h-12 w-full rounded-md border pl-4 pr-12 text-base backdrop-blur-sm transition-shadow focus:border-[#F57F3D] focus:ring-[#F57F3D] dark:text-white md:h-12 md:text-lg ${
                    passwordError ? 'border-red-500 dark:border-red-500' : ''
                  }`}
                  placeholder="••••••••••••"
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyPress={handleKeyPress}
                />
                <button
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 absolute inset-y-0 right-0 flex items-center px-4 transition-colors md:px-5"
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  aria-label="Toggle password visibility"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{fontSize: '20px'}}
                  >
                    {passwordVisible ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-500 dark:text-red-400">
                  <span className="material-symbols-outlined text-sm">
                    error
                  </span>
                  {passwordError}
                </p>
              )}
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs">
                Password must be at least 8 characters
              </p>
            </div>

            {/* Login Button */}
            <button
              onClick={handleSignIn}
              disabled={!canSubmit()}
              className={`mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-xl text-base font-semibold text-white md:text-lg ${
                !canSubmit()
                  ? 'cursor-not-allowed bg-orange-300'
                  : 'bg-[#F57F3D] hover:bg-[#E06E2C]'
              }`}
            >
              {isPending ? 'Logging in…' : 'Login'}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-auto flex flex-col items-center gap-6 pt-4 md:gap-7">
            <p className="text-gray-500 dark:text-gray-400 text-center text-sm md:text-base">
              Don't have an account?{' '}
              <a
                href="signup"
                className="ml-1 font-semibold text-[#F57F3D] transition-colors hover:text-blue-600"
              >
                Create an account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
