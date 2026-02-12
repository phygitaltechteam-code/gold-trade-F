import React, {useState} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {Keypad} from '../ui/Keypad';
import {MdLockReset} from 'react-icons/md';

interface EnterCurrentPinProps {
  onCurrentPinVerified?: (pin: string) => void;
}

const EnterCurrentPin: React.FC<EnterCurrentPinProps> = ({
  onCurrentPinVerified,
}) => {
  const navigate = useNavigate();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleKeyPress = (key: string) => {
    if (pin.length < 6) {
      const newPin = pin + key;
      setPin(newPin);
      setError('');

      if (newPin.length === 6) {
        setTimeout(() => {
          if (onCurrentPinVerified) {
            onCurrentPinVerified(newPin);
          }
          navigate({
            to: '/accounthub/setnew-pin',
            state: {currentPin: newPin},
          });
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  return (
    <div className="dark:bg-gray-950 flex min-h-screen w-full items-center justify-center bg-white">
      {/* Main container */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-[min(390px,95vw,500px)] flex-col overflow-y-auto bg-white dark:bg-[#221610] md:max-w-[600px]">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-white/95 px-4 py-3 backdrop-blur-md dark:bg-[#221610]/95 md:px-6 md:py-4">
          <button
            onClick={() => window.history.back()}
            className="-ml-2 flex items-center justify-center rounded-full p-2 text-slate-900 transition-colors hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 md:p-2.5"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="flex-1 pr-8 text-center text-base font-bold tracking-tight text-slate-900 dark:text-white md:text-lg">
            Change PIN
          </h1>
        </div>

        <main className="flex w-full flex-1 flex-col items-center px-6 pb-4 pt-6 md:px-8 md:pt-8">
          {/* Icon */}
          <div className="mb-6 flex items-center justify-center rounded-full bg-primary/10 p-4 dark:bg-primary/20 md:mb-8 md:p-5">
            <MdLockReset className="text-[32px] text-primary md:text-[36px]" />
          </div>

          <h1 className="mb-3 text-center text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white md:text-3xl">
            Change Transaction PIN
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mb-3 max-w-[280px] text-center text-base leading-relaxed md:mb-3 md:max-w-[320px] md:text-lg">
            Enter your current 6-digit PIN to continue.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20 md:mb-6 md:p-4">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 md:text-base">
                {error}
              </p>
            </div>
          )}

          {/* Dots */}
          <div className="flex gap-4 md:gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`h-4 w-4 rounded-full transition-all duration-200 md:h-5 md:w-5 ${
                  i < pin.length
                    ? 'bg-primary shadow-[0_0_10px_rgba(242,127,13,0.4)]'
                    : 'bg-gray-300 dark:bg-gray-600 border-2 border-transparent'
                }`}
              />
            ))}
          </div>

          <button className="rounded-lg px-2 py-1 text-sm font-semibold text-primary underline decoration-2 underline-offset-4 transition-colors hover:text-primary/80 focus:outline-none md:text-base">
            Forgot PIN?
          </button>
        </main>

        <div className="mt-auto md:px-6 md:pb-6">
          <Keypad
            onKeyPress={handleKeyPress}
            onDelete={handleDelete}
            showBiometric={true}
            className="md:rounded-2xl"
          />
        </div>
      </div>
    </div>
  );
};

export default EnterCurrentPin;
