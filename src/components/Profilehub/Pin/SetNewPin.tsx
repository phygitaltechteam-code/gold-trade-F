import React, {useState} from 'react';
import {Header} from '../ui/Header';
import {Keypad} from '../ui/Keypad';
import {MdLockReset} from 'react-icons/md';
import {useNavigate, useLocation} from '@tanstack/react-router';

const SetNewPin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Get currentPin from previous screen
  const currentPin = location.state?.currentPin || '';

  const handleKeyPress = (key: string) => {
    if (pin.length < 6) {
      const newPin = pin + key;
      setPin(newPin);
      setError('');

      // Check if new PIN is same as current PIN
      if (newPin.length === 6) {
        if (newPin === currentPin) {
          setError('New PIN cannot be same as current PIN');
          setTimeout(() => {
            setPin('');
          }, 1000);
        } else {
          // Navigate to confirmation screen
          navigate({
            to: '/accounthub/confirm-pin',
            state: {currentPin, newPin},
          });
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  return (
    <div className="dark:bg-background-dark flex flex-1 flex-col bg-white">
      <Header subtitle="Step 2 of 3" />

      <main className="flex flex-1 flex-col items-center px-6 pt-8">
        <div className="mb-8 rounded-full bg-primary/10 p-4">
          <MdLockReset className="text-[32px] text-primary" />
        </div>

        <h1 className="mb-3 text-center text-3xl font-bold leading-tight text-slate-900 dark:text-white">
          Set New PIN
        </h1>
        <p className="max-w-[280px] text-center text-base font-medium text-slate-400 dark:text-slate-400">
          Please enter a new 6-digit security PIN for your transactions
        </p>

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Dots */}
        <div className="mb-8 mt-12 flex items-center justify-center gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`size-4 rounded-full border-2 transition-all duration-200 ${
                i < pin.length
                  ? 'border-primary bg-primary'
                  : 'border-slate-300 bg-transparent dark:border-slate-600'
              }`}
            />
          ))}
        </div>
      </main>

      <div className="mt-auto">
        <Keypad
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          submitIcon="arrow"
        />
      </div>
    </div>
  );
};

export default SetNewPin;
