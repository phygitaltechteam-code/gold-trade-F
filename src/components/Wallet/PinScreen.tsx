import React, {useState, useEffect} from 'react';
import {MdArrowBack, MdLock, MdBackspace, MdCheck, MdError} from 'react-icons/md';
import {ImSpinner8} from 'react-icons/im'; // You'll need to install react-icons if not already

interface PinScreenProps {
  onPinSubmit: (pin: string) => void;
  onBack?: () => void;
  transactionAmount?: string;
  isSubmitting?: boolean; // Add this
  errorMessage?: string; // Add this
}

const PinScreen: React.FC<PinScreenProps> = ({
  onPinSubmit,
  onBack,
  transactionAmount,
  isSubmitting = false, // Default to false
  errorMessage = '', // Default to empty string
}) => {
  const [pin, setPin] = useState<string>('');
  const [shakeError, setShakeError] = useState<boolean>(false);

  const handleKeyPress = (key: string) => {
    if (pin.length >= 6 || isSubmitting) return; // Disable input while submitting
    setPin((prev) => prev + key);
    // Clear any error message when user starts typing again
    if (errorMessage) {
      // You might want to clear the error via parent component
    }
  };

  const handleBackspace = () => {
    if (isSubmitting) return; // Disable while submitting
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (pin.length === 6 && !isSubmitting) {
      onPinSubmit(pin);
    }
  };

  // Clear PIN when error occurs and trigger shake animation
  useEffect(() => {
    if (errorMessage) {
      setPin(''); // Clear the PIN on error
      setShakeError(true);
      const timer = setTimeout(() => setShakeError(false), 500);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Prevent scrolling on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="font-display text-gray-900 dark:bg-gray-900 flex min-h-screen w-screen flex-col overflow-hidden bg-white antialiased dark:text-white">
      <header className="dark:bg-gray-900/80 fixed left-0 right-0 top-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <button
            onClick={onBack}
            disabled={isSubmitting} // Disable back button while submitting
            className={`hover:bg-gray-100 dark:hover:bg-gray-800 -ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <MdArrowBack className="text-2xl" />
          </button>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-2 pt-16 sm:px-6 sm:pb-4">
        {/* Top Content - Reduced margins for tablet */}
        <div className="mb-4 mt-4 flex flex-col items-center text-center sm:mb-6 sm:mt-6">
          <div className="mb-3 text-orange-500 sm:mb-4">
            <MdLock className="text-4xl font-light sm:text-5xl" />
          </div>
          <h1 className="mb-2 text-xl font-semibold tracking-tight sm:text-2xl">
            Enter Security PIN
          </h1>
          {transactionAmount && (
            <p className="mb-2 text-base font-medium text-orange-500">
              Amount: ₹{transactionAmount}
            </p>
          )}
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            Please enter your 6-digit access code
          </p>
        </div>

        {/* Error Message Display */}
        {errorMessage && (
          <div className="mx-auto mb-4 w-full max-w-[300px] sm:max-w-[340px] animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm text-red-600 dark:text-red-400">
              <MdError className="text-lg" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* PIN Indicators - Reduced spacing */}
        <div className="mx-auto mb-6 w-full max-w-[300px] sm:mb-8 sm:max-w-[340px]">
          <div className={`flex justify-between gap-2 sm:gap-3 ${shakeError ? 'animate-shake' : ''}`}>
            {[0, 1, 2, 3, 4, 5].map((index) => {
              const isFilled = index < pin.length;
              return (
                <div
                  key={index}
                  className="flex h-10 w-full items-center justify-center border-b-2 transition-colors sm:h-12"
                  style={{
                    borderColor: isFilled ? '#F57F3D' : 'rgba(0,0,0,0.1)',
                  }}
                >
                  {isFilled && (
                    <div
                      className="animate-in zoom-in mt-4 h-2.5 w-2.5 rounded-full duration-200"
                      style={{backgroundColor: '#F57F3D'}}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Spacer - Much smaller for tablet */}
        <div className="min-h-[10px] flex-1 sm:min-h-[20px]"></div>

        {/* Keypad - Adjusted for tablet view */}
        <div className="mx-auto w-full max-w-[300px] sm:max-w-[320px]">
          <div className="grid grid-cols-3 gap-x-4 gap-y-3 sm:gap-x-5 sm:gap-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num.toString())}
                disabled={isSubmitting} // Disable while submitting
                className={`hover:bg-gray-100 dark:hover:bg-gray-800 mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl font-normal transition-all active:scale-95 sm:h-14 sm:w-14 sm:text-2xl ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={handleBackspace}
              disabled={isSubmitting} // Disable while submitting
              className={`text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 mx-auto flex h-14 w-14 items-center justify-center rounded-full transition-all active:scale-95 sm:h-14 sm:w-14 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <MdBackspace className="text-2xl" />
            </button>

            <button
              onClick={() => handleKeyPress('0')}
              disabled={isSubmitting} // Disable while submitting
              className={`hover:bg-gray-100 dark:hover:bg-gray-800 mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl font-normal transition-all active:scale-95 sm:h-14 sm:w-14 sm:text-2xl ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              0
            </button>

            <button
              onClick={handleSubmit}
              disabled={pin.length < 6 || isSubmitting} // Disable if PIN incomplete OR submitting
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all active:scale-95 sm:h-14 sm:w-14 ${
                pin.length >= 6 && !isSubmitting
                  ? 'bg-orange-500 text-white shadow-orange-500/20 hover:bg-orange-600'
                  : 'bg-gray-200 text-gray-400 dark:bg-gray-800 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <ImSpinner8 className="text-2xl animate-spin" />
              ) : (
                <MdCheck className="text-2xl" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot PIN Button - Adjusted spacing */}
        <div className="mb-2 mt-4 flex justify-center sm:mb-2 sm:mt-4">
          <button 
            disabled={isSubmitting}
            className={`text-gray-600 dark:text-gray-400 hover:text-gray-900 rounded-full px-4 py-1 text-sm font-medium transition-colors dark:hover:text-white ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Forgot PIN?
          </button>
        </div>
      </main>

      {/* Add shake animation to your global CSS or add it here */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default PinScreen;