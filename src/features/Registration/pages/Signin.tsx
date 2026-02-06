/*eslint-disable*/
import {useAuthContext} from '@/context/AuthContext';
import {api} from '@/utils/axios';
import {useMutation} from '@tanstack/react-query';
import {useNavigate} from '@tanstack/react-router';
import {AxiosError} from 'axios';
import React, {useState} from 'react';

const Signin: React.FC = () => {
  const {setIsAuthenticated} = useAuthContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  interface SignInPayload {
    username: string;
    password: string;
  }
  const {mutate, isPending} = useMutation({
    mutationFn: async (data: SignInPayload) => {
      const response = await api.post('/users/login', data);
      console.log(response);
      return response.data;
    },
    onSuccess: (data) => {
      const newData = JSON.stringify(data, null, 2);
      if (newData) {
        localStorage.setItem('token', newData);
        console.log('Token saved:', newData);
        setIsAuthenticated(true);
        navigate({
          to: '/dashboard',
        });
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
    },
  });
  const handleSignIn = () => {
    mutate({username, password});
  };

  return (
    <div className="dark:bg-gray-950 flex min-h-screen w-full items-center justify-center bg-white font-['Inter'] antialiased selection:bg-[#F57F3D]/30">
      {/* Responsive container */}
      <div className="border-gray-200/60 dark:border-gray-800/60 relative mx-auto min-h-[min(844px,90vh)] w-full max-w-[min(390px,95vw,480px)] overflow-hidden bg-white dark:bg-[#221610] md:min-h-[600px] md:max-w-[420px] md:rounded-2xl">
        {/* Background patterns */}
        <div className="bg-premium-pattern pointer-events-none absolute inset-0 z-0 opacity-100 dark:opacity-5" />
        <div className="from-gray-100/40 pointer-events-none absolute inset-0 z-0 bg-gradient-to-br via-transparent to-transparent dark:from-white/5" />

        {/* Safe area top spacer - responsive */}
        <div className="relative z-10 h-6 w-full md:h-8" />

        {/* Main content */}
        <div className="relative z-10 flex flex-1 flex-col justify-between px-6 pb-6 pt-8 md:px-8 md:pb-8 md:pt-10">
          {/* Header */}
          <div className="flex flex-col gap-2 md:gap-3">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F57F3D]/10 backdrop-blur-sm md:h-14 md:w-14">
              <span className="material-symbols-outlined text-2xl text-[#F57F3D] md:text-3xl">
                account_balance_wallet
              </span>
            </div>
            <h1 className="text-[32px] font-bold leading-tight tracking-tight text-[#0d131c] dark:text-white md:text-[36px]">
              Welcome back
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal md:text-lg">
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
                  className="bg-gray-50/80 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 placeholder-gray-400 h-12 flex-1 rounded-md border px-4 text-base backdrop-blur-sm transition-shadow focus:border-[#F57F3D] focus:ring-[#F57F3D] dark:text-white md:h-12 md:text-lg"
                  placeholder="98765 43210"
                  type="tel"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2 md:gap-3">
              <label className="dark:text-gray-200 text-sm font-medium leading-normal text-[#0d131c] md:text-base">
                Password
              </label>
              <div className="relative">
                <input
                  className="bg-gray-50/80 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 placeholder-gray-400 h-12 w-full rounded-md border pl-4 pr-12 text-base backdrop-blur-sm transition-shadow focus:border-[#F57F3D] focus:ring-[#F57F3D] dark:text-white md:h-12 md:text-lg"
                  placeholder="••••••••••••"
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                    visibility_off
                  </span>
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleSignIn}
              disabled={isPending}
              className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#F57F3D] text-base font-semibold text-white md:text-lg"
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
