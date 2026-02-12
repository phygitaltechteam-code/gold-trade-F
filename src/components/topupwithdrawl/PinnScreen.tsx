import React, {useState, useEffect} from 'react';
import {MdArrowBack, MdLock, MdBackspace, MdCheck} from 'react-icons/md';

interface PinScreenProps {
  onPinSubmit: (pin: string) => void;
  onBack?: () => void;
  transactionAmount?: string;
}

const PinnScreen: React.FC<PinScreenProps> = ({
  onPinSubmit,
  onBack,
  transactionAmount,
}) => {
  const [pin, setPin] = useState<string>('');

  const handleKeyPress = (key: string) => {
    if (pin.length >= 6) return;
    setPin((prev) => prev + key);
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (pin.length === 6) {
      onPinSubmit(pin);
    }
  };

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
            className="hover:bg-gray-100 dark:hover:bg-gray-800 -ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
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

        {/* PIN Indicators - Reduced spacing */}
        <div className="mx-auto mb-6 w-full max-w-[300px] sm:mb-8 sm:max-w-[340px]">
          <div className="flex justify-between gap-2 sm:gap-3">
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
                className="hover:bg-gray-100 dark:hover:bg-gray-800 mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl font-normal transition-all active:scale-95 sm:h-14 sm:w-14 sm:text-2xl"
              >
                {num}
              </button>
            ))}

            <button
              onClick={handleBackspace}
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 mx-auto flex h-14 w-14 items-center justify-center rounded-full transition-all active:scale-95 sm:h-14 sm:w-14"
            >
              <MdBackspace className="text-2xl" />
            </button>

            <button
              onClick={() => handleKeyPress('0')}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl font-normal transition-all active:scale-95 sm:h-14 sm:w-14 sm:text-2xl"
            >
              0
            </button>

            <button
              onClick={handleSubmit}
              disabled={pin.length < 6}
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all active:scale-95 sm:h-14 sm:w-14 ${
                pin.length >= 6
                  ? 'bg-orange-500 text-white shadow-orange-500/20 hover:bg-orange-600'
                  : 'bg-gray-200 text-gray-400 dark:bg-gray-800 cursor-not-allowed'
              }`}
            >
              <MdCheck className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Forgot PIN Button - Adjusted spacing */}
        <div className="mb-2 mt-4 flex justify-center sm:mb-2 sm:mt-4">
          <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 rounded-full px-4 py-1 text-sm font-medium transition-colors dark:hover:text-white">
            Forgot PIN?
          </button>
        </div>
      </main>
    </div>
  );
};

export default PinnScreen;
