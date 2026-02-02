import React, {useState, useEffect} from 'react';
import {MdArrowBack, MdLock, MdBackspace, MdCheck} from 'react-icons/md';

interface PinScreenProps {
  onPinSubmit: (pin: string) => void;
  onBack?: () => void;
  transactionAmount?: string;
}

const PinScreen: React.FC<PinScreenProps> = ({
  onPinSubmit,
  onBack,
  transactionAmount,
}) => {
  const [pin, setPin] = useState<string>('');

  const handleKeyPress = (key: string) => {
    if (pin.length >= 6) return;

    const newPin = pin + key;
    setPin(newPin);

    // Auto submit when 6 digits are entered
    if (newPin.length === 6) {
      setTimeout(() => {
        onPinSubmit(newPin);
      }, 100);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="font-display text-gray-900 dark:bg-gray-900 flex h-full flex-col overflow-hidden bg-white py-2 antialiased dark:text-white">
      <header className="dark:bg-gray-900/80 fixed left-0 right-0 top-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <button
            onClick={onBack}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 -ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          >
            <MdArrowBack className="text-2xl" />
          </button>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-8 pb-4 pt-16">
        <div className="mb-8 mt-12 flex flex-col items-center text-center">
          <div className="mb-6 text-orange-500">
            <MdLock className="text-5xl font-light" />
          </div>
          <h1 className="mb-2 text-[32px] font-semibold tracking-tight">
            Enter Security PIN
          </h1>
          {transactionAmount && (
            <p className="mb-2 text-lg font-medium text-orange-500">
              Amount: ₹{transactionAmount}
            </p>
          )}
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            Please enter your 6-digit access code
          </p>
        </div>

        <div className="min-h-[40px] flex-1"></div>

        {/* PIN Indicators */}
        <div className="mx-auto mb-16 flex w-full max-w-[340px] justify-between gap-3 px-2">
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className="flex h-12 w-full items-center justify-center border-b-2 transition-colors"
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

        {/* Keypad */}
        <div className="mx-auto mb-6 grid w-full max-w-[320px] grid-cols-3 gap-x-6 gap-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 mx-auto flex h-16 w-16 items-center justify-center rounded-full text-[32px] font-normal transition-all active:scale-95"
            >
              {num}
            </button>
          ))}

          <button
            onClick={handleBackspace}
            className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 mx-auto flex h-16 w-16 items-center justify-center rounded-full transition-all active:scale-95"
          >
            <MdBackspace className="text-2xl" />
          </button>

          <button
            onClick={() => handleKeyPress('0')}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 mx-auto flex h-16 w-16 items-center justify-center rounded-full text-[32px] font-normal transition-all active:scale-95"
          >
            0
          </button>

          <button
            onClick={() => pin.length >= 6 && onPinSubmit(pin)}
            disabled={pin.length < 6}
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all active:scale-95 ${
              pin.length >= 6
                ? 'bg-orange-500 text-white shadow-orange-500/20 hover:bg-orange-600'
                : 'bg-gray-200 text-gray-400 dark:bg-gray-800 cursor-not-allowed'
            }`}
          >
            <MdCheck className="text-2xl" />
          </button>
        </div>

        <div className="mb-2 flex justify-center">
          <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 rounded-full px-6 py-2 text-sm font-medium transition-colors dark:hover:text-white">
            Forgot PIN?
          </button>
        </div>
      </main>
    </div>
  );
};

export default PinScreen;
