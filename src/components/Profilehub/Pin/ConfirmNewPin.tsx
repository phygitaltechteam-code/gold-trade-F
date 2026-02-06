import React, {useState, useEffect} from 'react';
import {useNavigate, useLocation} from '@tanstack/react-router';
import {MdArrowBackIos, MdBackspace, MdCheck, MdError} from 'react-icons/md';
import {changePin, useChangePin} from '../profilemutation';

const ConfirmNewPin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {mutate: changePin, isLoading, error, reset} = useChangePin();

  const [pin, setPin] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const pinLength = 6;

  // Get pins from previous screens
  const {currentPin, newPin: newPinFromPrevious} = location.state || {};

  // Handle key press from keypad
  const handleKeyPress = (key: string) => {
    if (pin.length < pinLength) {
      const newPin = pin + key;
      setPin(newPin);
      setValidationError('');

      // Reset mutation error on new input
      if (error) reset();

      // Auto-submit when PIN is complete
      if (newPin.length === pinLength) {
        setTimeout(() => {
          validateAndSubmit(newPin);
        }, 200);
      }
    }
  };

  // Handle delete/backspace
  const handleDelete = () => {
    if (pin.length > 0) {
      setPin((prev) => prev.slice(0, -1));
      setValidationError('');
    }
  };

  // Validate and submit
  const validateAndSubmit = (enteredPin: string) => {
    // Compare with new PIN from previous step
    if (enteredPin !== newPinFromPrevious) {
      setValidationError('PINs do not match');
      setTimeout(() => {
        setPin('');
      }, 1000);
      return;
    }

    // Call API to change PIN
    changePin(
      {
        currentPin: currentPin,
        newPin: newPinFromPrevious,
      },
      {
        onSuccess: () => {
          // Navigate to main account page on success
          setTimeout(() => {
            navigate({to: '/accounthub/accounthub'});
          }, 1500);
        },
        onError: () => {
          // Error is handled by the mutation hook (toast)
          setPin('');
        },
      },
    );
  };

  // Handle submit
  const handleSubmit = () => {
    if (pin.length === pinLength) {
      validateAndSubmit(pin);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate({
      to: '/accounthub/setnew-pin',
      state: {currentPin},
    });
  };

  // Keyboard event listener for physical keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter' && pin.length === pinLength) {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, currentPin, newPinFromPrevious]);

  useEffect(() => {
    if (!currentPin || !newPinFromPrevious) {
      navigate({to: '/dashboard'});
    }
  }, [currentPin, newPinFromPrevious, navigate]);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display flex min-h-screen w-screen flex-col overflow-y-auto">
      {/* Top Navigation */}
      <div className="flex flex-shrink-0 items-center justify-between p-4 pt-6">
        <button
          onClick={handleBack}
          className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:hover:bg-white/10"
          disabled={isLoading}
        >
          <MdArrowBackIos className="text-[24px]" />
        </button>
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-start overflow-y-auto px-6 ">
        {/* Header Section */}
        <div className="mb-6 flex flex-shrink-0 flex-col items-center gap-2">
          <h1 className="text-navy text-center text-3xl font-bold tracking-tight dark:text-white">
            Confirm New PIN
          </h1>
          <p className="text-navy-light text-center text-base font-normal dark:text-slate-400">
            Re-enter your new 6-digit PIN to confirm
          </p>
        </div>

        {/* PIN Indicator Dots */}
        <div className="mb-4 flex flex-shrink-0 items-center gap-4 md:gap-5">
          {Array.from({length: pinLength}).map((_, index) => (
            <div
              key={index}
              className={`h-4 w-4 rounded-full transition-all duration-300 ${
                index < pin.length
                  ? 'bg-primary shadow-sm shadow-primary/40'
                  : 'border-[1.5px] border-slate-300 bg-transparent dark:border-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Error Messages */}
        <div className="mb-4 flex h-6 items-center justify-center">
          {validationError && (
            <span className="flex items-center gap-1 text-sm font-medium text-red-500 dark:text-red-400">
              <MdError className="text-sm" />
              {validationError}
            </span>
          )}
          {isLoading && (
            <span className="flex items-center gap-2 text-sm font-medium text-primary">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
              Changing PIN...
            </span>
          )}
        </div>

        {/* Spacer to push keypad to bottom */}
        <div className="flex-1"></div>
      </div>

      {/* Numeric Keypad Section */}
      <div className="safe-area-bottom mx-auto w-full max-w-[320px] flex-shrink-0 px-4 pb-10 mb-15">
        <div className="grid grid-cols-3 gap-x-6 gap-y-5">
          {/* Row 1 */}
          <button
            onClick={() => handleKeyPress('1')}
            disabled={isLoading}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            1
          </button>
          <button
            onClick={() => handleKeyPress('2')}
            disabled={isLoading}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            2
          </button>
          <button
            onClick={() => handleKeyPress('3')}
            disabled={isLoading}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            3
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleKeyPress('4')}
            disabled={isLoading}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            4
          </button>
          <button
            onClick={() => handleKeyPress('5')}
            disabled={isLoading}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            5
          </button>
          <button
            onClick={() => handleKeyPress('6')}
            disabled={isLoading}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            6
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleKeyPress('7')}
            disabled={isLoading}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            7
          </button>
          <button
            onClick={() => handleKeyPress('8')}
            disabled={isLoading}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            8
          </button>
          <button
            onClick={() => handleKeyPress('9')}
            disabled={isLoading}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            9
          </button>

          {/* Row 4 (Function Keys) */}
          {/* Backspace (Left) */}
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full transition-colors duration-200 hover:bg-black/5 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:hover:bg-white/10"
          >
            <MdBackspace className="text-[28px] opacity-70" />
          </button>

          {/* Zero (Center) */}
          <button
            onClick={() => handleKeyPress('0')}
            disabled={isLoading}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            0
          </button>

          {/* Submit (Right) */}
          <button
            onClick={handleSubmit}
            disabled={pin.length !== pinLength || isLoading}
            className={`keypad-btn group flex h-[72px] w-full items-center justify-center rounded-full transition-all duration-200 focus:outline-none ${
              pin.length === pinLength && !isLoading
                ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24">
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
            ) : (
              <MdCheck className="text-[32px] transition-transform group-active:scale-90" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmNewPin;
