import {useNavigate, useLocation} from '@tanstack/react-router';
import React, {useState, useEffect} from 'react';
import {
  MdClose,
  MdAccountBalance,
  MdCall,
  MdLock,
  MdCheckCircle,
  MdError,
  MdArrowBack,
} from 'react-icons/md';

interface ProcessingScreenProps {
  primaryColor?: string;
  backgroundColorLight?: string;
  backgroundColorDark?: string;
  textColor?: string;
}

const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  primaryColor = '#F57F3D',
  backgroundColorLight = '#f8f6f5',
  backgroundColorDark = '#221610',
  textColor = '#0F1535',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  type WalletState = {amount?: string};
  const state = location.state as WalletState | undefined;
  const amount = state?.amount ?? '';

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>(
    'processing',
  );
  const [statusMessage, setStatusMessage] = useState(
    'We are securely processing your payment',
  );

  // Determine if we're in dark mode
  const isDarkMode = false;

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 67) {
          clearInterval(timer);
          return 67;
        }
        return prev + 1;
      });
    }, 100);

    // Simulate processing time
    setTimeout(() => {
      clearInterval(timer);
      setProgress(100);
      setStatus('success');
      setStatusMessage('Transaction Successful!');

      // Navigate to success screen after delay
      setTimeout(() => {
        navigate({to: '/wallet/success', state: {amount}});
      }, 2000);
    }, 5000);

    return () => clearInterval(timer);
  }, [navigate, amount]);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="relative flex items-center justify-center">
            <div
              className="animate-spinner h-28 w-28 rounded-full border-4"
              style={{
                borderColor: `${primaryColor}10`,
                borderTopColor: primaryColor,
              }}
            ></div>
            <div
              className="absolute flex h-20 w-20 items-center justify-center rounded-full border shadow-lg"
              style={{
                backgroundColor: isDarkMode ? '#1f2937' : '#FFFFFF',
                borderColor: isDarkMode ? '#374151' : '#f3f4f6',
              }}
            >
              <MdAccountBalance
                className="text-[40px]"
                style={{color: primaryColor}}
              />
            </div>
          </div>
        );
      case 'success':
        return (
          <div className="relative flex items-center justify-center">
            <div className="h-28 w-28 rounded-full border-4 border-green-500/10"></div>
            <div className="absolute flex h-20 w-20 items-center justify-center rounded-full border border-slate-100 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <MdCheckCircle className="text-[48px] text-green-600" />
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="relative flex items-center justify-center">
            <div className="h-28 w-28 rounded-full border-4 border-red-500/10"></div>
            <div className="absolute flex h-20 w-20 items-center justify-center rounded-full border border-slate-100 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <MdError className="text-[48px] text-red-600" />
            </div>
          </div>
        );
    }
  };

  // Processing state
  return (
    <div
      className="font-display flex h-screen flex-col overflow-hidden py-2 antialiased selection:bg-primary/20"
      style={{
        backgroundColor: isDarkMode
          ? backgroundColorDark
          : backgroundColorLight,
        color: isDarkMode ? '#FFFFFF' : textColor,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full transition-colors"
          style={{
            backgroundColor: isDarkMode
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.05)',
          }}
        >
          <MdArrowBack className="text-2xl" />
        </button>
        <h2 className="text-lg font-bold">Payment Processing</h2>
        <button
          onClick={() => navigate({to: '/'})}
          className="flex size-10 items-center justify-center rounded-full transition-colors"
          style={{
            backgroundColor: isDarkMode
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.05)',
          }}
        >
          <MdClose className="text-2xl" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-4">
        {/* Animated Status Icon */}
        <div className="mb-8">{getStatusIcon()}</div>

        <div className="w-full max-w-xs space-y-4 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight">
            Transfer in Progress
          </h2>

          {/* Amount Display */}
          {amount && (
            <div
              className="rounded-xl border px-4 py-3"
              style={{
                backgroundColor: isDarkMode ? '#1d4ed820' : '#dbeafe80',
                borderColor: isDarkMode ? '#1e40af80' : '#93c5fd80',
              }}
            >
              <p className="mb-1 text-lg font-semibold">${amount}</p>
              <p
                className="text-sm"
                style={{
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                }}
              >
                to Rahul Sharma
              </p>
            </div>
          )}

          <p
            className="text-sm leading-relaxed"
            style={{
              color: isDarkMode ? '#cbd5e1' : '#475569',
            }}
          >
            We are securely processing your payment to Rahul Sharma. This
            usually takes a few seconds. Please do not close the app.
          </p>
        </div>

        {/* Progress Bar */}
        <div
          className="mt-8 h-1 w-full max-w-[180px] overflow-hidden rounded-full"
          style={{
            backgroundColor: isDarkMode ? '#374151' : '#e2e8f0',
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              backgroundColor: primaryColor,
              width: `${progress}%`,
              opacity: 0.5,
            }}
          ></div>
        </div>

        {/* Progress Percentage */}
        <div className="mt-2 text-sm font-medium" style={{color: primaryColor}}>
          {progress}%
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4">
        <div className="mx-auto max-w-md">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl border py-3 transition-colors"
            style={{
              color: primaryColor,
              borderColor: `${primaryColor}20`,
              fontWeight: 600,
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = `${primaryColor}10`)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
            onMouseDown={(e) =>
              (e.currentTarget.style.backgroundColor = `${primaryColor}20`)
            }
            onMouseUp={(e) =>
              (e.currentTarget.style.backgroundColor = `${primaryColor}10`)
            }
          >
            <MdCall className="text-xl" />
            <span>Need help? Call Support</span>
          </button>

          <div
            className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
            style={{
              color: isDarkMode ? '#6b7280' : '#94a3b8',
            }}
          >
            <MdLock className="text-[12px]" />
            <span>Secure End-to-End Encryption</span>
          </div>
        </div>
      </div>

      {/* Remove scrollbar globally for this screen */}
      <style jsx global>{`
        body {
          overflow: hidden !important;
        }
        .animate-spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ProcessingScreen;
