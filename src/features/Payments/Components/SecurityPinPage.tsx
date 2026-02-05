import React, {useState, useEffect} from 'react';
import {MdArrowBack, MdLock} from 'react-icons/md';
import {PinDisplay} from './PinDisplay';
import {Numpad} from './NumPad';
import {useNavigate} from '@tanstack/react-router';
import {
  PaymentData,
  SetPaymentData,
  StepProps,
  walletAmmount,
} from '../Pages/PaymentWrapper';

const PIN_LENGTH = 6;

type props = StepProps & {
  paymentData: PaymentData;
  setPaymentData: SetPaymentData;
  walletAmmount: walletAmmount;
  onPinSubmit: (pin: string) => void;
};

const SecurityPinPage: React.FC<props> = ({
  nextStep,
  paymentData,
  setPaymentData,
  walletAmmount,
  prevStep,
  onPinSubmit,
}) => {
  const navigate = useNavigate();
  const [pin, setPin] = useState<string>('');

  const handleNumPress = (num: string) => {
    if (pin.length < PIN_LENGTH) {
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  // const handleSubmit = () => {
  //   if (pin.length === PIN_LENGTH) {
  //     console.log('PIN Submitted:', pin);
  //     // Here you would typically trigger an API call or navigation
  //     alert(`PIN ${pin} submitted!`);
  //     setPin('');
  //   }
  // };

  // Optional: Add keyboard support for desktop testing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleNumPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Enter') {
        onPinSubmit(pin);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  return (
    <div className="app-height text-navy font-sans flex flex-col overflow-hidden bg-white">
      <header className="sticky left-0 right-0 top-0 z-50 bg-white/90 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <button
            aria-label="Go back"
            className="text-navy -ml-2 flex h-10 w-10 items-center justify-center rounded-full outline-none transition-colors hover:bg-slate-50 focus:ring-2 focus:ring-primary/20 active:bg-slate-100"
            onClick={prevStep}
          >
            <MdArrowBack size={24} />
          </button>
          <div className="w-10"></div>{' '}
          {/* Spacer to balance layout if title is added later */}
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-8 pb-4 pt-8">
        {/* Hero Section */}
        <div className="mb-8 mt-8 flex flex-col items-center text-center">
          <div className="mb-6 text-primary">
            <MdLock size={48} />
          </div>
          <h1 className="text-navy mb-2 text-[32px] font-semibold tracking-tight">
            Enter Security PIN
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Please enter your {PIN_LENGTH}-digit access code
          </p>
        </div>

        <div className="min-h-[20px] flex-1" />

        {/* PIN Dots Display */}
        <div className="mb-16 w-full">
          <PinDisplay pin={pin} maxLength={PIN_LENGTH} />
        </div>

        {/* Keypad */}
        <div className="mb-6 w-full">
          <Numpad
            onNumPress={handleNumPress}
            onDelete={handleDelete}
            onSubmit={() => onPinSubmit(pin)}
            canSubmit={pin.length === PIN_LENGTH}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        </div>

        {/* Footer Action */}
        <div className="safe-area-bottom mb-6 flex justify-center">
          <button
            type="button"
            className="hover:text-navy active:text-navy rounded-full px-6 py-2 text-sm font-medium text-slate-400 outline-none transition-colors focus:ring-2 focus:ring-primary/20"
          >
            Forgot PIN?
          </button>
        </div>
      </main>
    </div>
  );
};
export default SecurityPinPage;
