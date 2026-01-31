import React, {useState, useRef, useEffect} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {MdArrowBackIos, MdBackspace, MdCheck, MdError} from 'react-icons/md';
import {FaFaceId} from 'react-icons/fa';

const ConfirmNewPin: React.FC = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const pinLength = 6;

  // Simulated original PIN from previous step (you would get this from state/context)
  const originalPin = '123456';

  // Handle key press from keypad
  const handleKeyPress = (key: string) => {
    if (pin.length < pinLength) {
      const newPin = pin + key;
      setPin(newPin);
      setError(false);

      // Auto-submit when PIN is complete
      if (newPin.length === pinLength) {
        // Small delay to show the last dot filled
        setTimeout(() => {
          validatePin(newPin);
        }, 200);
      }
    }
  };

  // Handle delete/backspace
  const handleDelete = () => {
    if (pin.length > 0) {
      setPin((prev) => prev.slice(0, -1));
      setError(false);
    }
  };

  // Validate the PIN
  const validatePin = (enteredPin: string) => {
    // Compare with original PIN from previous step
    if (enteredPin === originalPin) {
      // Success - navigate to success screen
      console.log('PIN confirmed successfully');
      navigate({to: '/accounthub/acounthub'});
    } else {
      setError(true);
      // Clear PIN after showing error 
      setTimeout(() => {
        setPin('');
      }, 1000);
    }
  };

  // Handle submit
  const handleSubmit = () => {
    if (pin.length === pinLength) {
      validatePin(pin);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate({to: '/accounthub/setnew-pin'});
  };

  // Handle biometric authentication
  const handleBiometric = () => {
    console.log('Biometric authentication requested');
    // Implement biometric authentication logic here
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
  }, [pin]);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display flex h-screen w-screen flex-col overflow-hidden">
      {/* Top Navigation */}
      <div className="flex flex-shrink-0 items-center justify-between p-4 pt-6">
        <button
          onClick={handleBack}
          className="flex items-center justify-center rounded-full p-2 transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:hover:bg-white/10"
        >
          <MdArrowBackIos className="text-[24px]" />
        </button>
        <div className="w-10"></div>
      </div>

      {/* Main Content */}
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-start overflow-hidden px-6 pt-8">
        {/* Header Section */}
        <div className="mb-12 flex flex-shrink-0 flex-col items-center gap-2">
          <h1 className="text-navy text-center text-3xl font-bold tracking-tight dark:text-white">
            Confirm New PIN
          </h1>
          <p className="text-navy-light text-center text-base font-normal dark:text-slate-400">
            Re-enter your new 6-digit PIN to confirm
          </p>
        </div>

        {/* PIN Indicator Dots */}
        <div className="mb-8 flex flex-shrink-0 items-center gap-4 md:gap-5">
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

        {/* Error Message */}
        <div
          className={`mb-4 flex h-6 items-center justify-center transition-opacity duration-300 ${error ? 'opacity-100' : 'opacity-0'}`}
        >
          {error && (
            <span className="flex items-center gap-1 text-sm font-medium text-red-500 dark:text-red-400">
              <MdError className="text-sm" />
              PINs do not match
            </span>
          )}
        </div>

        {/* Spacer to push keypad to bottom */}
        <div className="flex-1"></div>
      </div>

      {/* Numeric Keypad Section */}
      <div className="safe-area-bottom mx-auto w-full max-w-[320px] flex-shrink-0 px-4 pb-8 md:pb-12">
        <div className="grid grid-cols-3 gap-x-6 gap-y-5">
          {/* Row 1 */}
          <button
            onClick={() => handleKeyPress('1')}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            1
          </button>
          <button
            onClick={() => handleKeyPress('2')}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            2
          </button>
          <button
            onClick={() => handleKeyPress('3')}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            3
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleKeyPress('4')}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            4
          </button>
          <button
            onClick={() => handleKeyPress('5')}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            5
          </button>
          <button
            onClick={() => handleKeyPress('6')}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            6
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleKeyPress('7')}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            7
          </button>
          <button
            onClick={() => handleKeyPress('8')}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            8
          </button>
          <button
            onClick={() => handleKeyPress('9')}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            9
          </button>

          {/* Row 4 (Function Keys) */}
          {/* Biometric/Backspace (Left) */}
          <button
            onClick={handleDelete}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full transition-colors duration-200 hover:bg-black/5 focus:outline-none dark:text-white dark:hover:bg-white/10"
          >
            <MdBackspace className="text-[28px] opacity-70" />
          </button>

          {/* Zero (Center) */}
          <button
            onClick={() => handleKeyPress('0')}
            className="keypad-btn text-navy flex h-[72px] w-full items-center justify-center rounded-full bg-white text-3xl font-medium shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            0
          </button>

          {/* Submit (Right) */}
          <button
            onClick={handleSubmit}
            disabled={pin.length !== pinLength}
            className={`keypad-btn group flex h-[72px] w-full items-center justify-center rounded-full transition-all duration-200 focus:outline-none ${
              pin.length === pinLength
                ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <MdCheck className="text-[32px] transition-transform group-active:scale-90" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmNewPin;
