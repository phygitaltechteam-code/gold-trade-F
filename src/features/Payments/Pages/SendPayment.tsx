import React, {useState, useCallback, useRef} from 'react';
import {MdArrowBack, MdArrowForward, MdEditNote} from 'react-icons/md';
import AccountSelector from '../Components/AccountSelector';
import CurrencySelector from '../Components/CurrencySelector';
import AmountDisplay from '../Components/AccountDisplay';
import Keypad from '../Components/KeyPad';
import {useNavigate} from '@tanstack/react-router';
import {
  PaymentData,
  SetPaymentData,
  SetSelectedWalletType,
  StepProps,
  walletAmmount,
} from './PaymentWrapper';
import toast from 'react-hot-toast';
import {Camera} from 'lucide-react';

export type WalletType = 'E_PRIVATEACCOUNT' | 'E_TEMPORYACCOUNT';
type props = StepProps & {
  paymentData: PaymentData;
  setPaymentData: SetPaymentData;
  walletAmmount: walletAmmount;
  setSelectedWalletType: SetSelectedWalletType;
  selectedWalletType: WalletType;
};

const PaymentSend: React.FC<props> = ({
  paymentData,
  setPaymentData,
  nextStep,
  prevStep,
  walletAmmount,
  selectedWalletType,
  setSelectedWalletType,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  console.log('wallet ammountt', walletAmmount);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log(selectedWalletType);
  const navigate = useNavigate();

  const selectedWalletBalance = walletAmmount?.[selectedWalletType] ?? 0;

  const enteredAmount = Number(paymentData.amount || 0);

  const isInsufficientBalance = enteredAmount > selectedWalletBalance;

  const handleKeyPress = useCallback(
    (key: string) => {
      setPaymentData((prev) => {
        const value = prev.amount || '';

        if (key === '.' && value.includes('.')) return prev;

        if (value === '0' && key !== '.') {
          const nextAmount = key;
          if (Number(nextAmount) > selectedWalletBalance) {
            toast.error('Insufficient wallet balance');
            return prev;
          }
          return {...prev, amount: nextAmount};
        }

        if (value === '' && key === '.') {
          return {...prev, amount: '0.'};
        }
        if (value.includes('.')) {
          const [, decimals] = value.split('.');
          if (decimals?.length >= 2) return prev;
        }
        if (value.replace('.', '').length >= 7) return prev;

        const nextAmount = value + key;

        if (Number(nextAmount) > selectedWalletBalance) {
          toast.error('Insufficient wallet balance');
          return prev;
        }

        return {
          ...prev,
          ...(selectedFile && {proof: selectedFile}), // Include proof if selected
          amount: nextAmount,
        };
      });
    },
    [selectedWalletBalance, selectedFile],
  );

  const handleBackspace = useCallback(() => {
    setPaymentData((prev) => {
      const value = prev?.amount;

      if (!value || value.length <= 1) {
        return {
          ...prev,
          amount: '',
        };
      }

      return {
        ...prev,
        amount: value.slice(0, -1),
      };
    });
  }, []);
  const handleAttachReceipt = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('Selected file:', file.name, file.size);
    }
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#f8f6f5] p-0">
      <div className="bg-premium-pattern relative mx-auto flex h-[100dvh] w-full flex-col overflow-hidden bg-[#f8f6f5] shadow-2xl ring-1 ring-black/5 sm:rounded-[40px] sm:bg-white">
        <header className="relative z-10 mt-2 flex shrink-0 items-center justify-between px-4 py-4">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/50 active:scale-95"
            onClick={() => navigate({to: '/wallet/paymentdashbord'})}
          >
            <MdArrowBack className="text-swiss-navy text-2xl" />
          </button>
          <h2 className="text-swiss-navy flex-1 pr-10 text-center text-lg font-bold leading-tight">
            Send Money
          </h2>
        </header>
        <main className="no-scrollbar relative z-0 flex flex-1 flex-col items-center overflow-y-auto px-4 pb-4 pt-4 md:px-8">
          <AccountSelector
            selectedWalletType={selectedWalletType}
            setSelectedWalletType={setSelectedWalletType}
            walletAmmount={walletAmmount}
          />

          <AmountDisplay amount={paymentData?.amount} />

          <div className="mb-8"></div>
          <div className="mb-4 flex w-full flex-col items-center md:mb-6">
            {selectedFile ? (
              <div className="flex w-full items-center justify-between gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-[#1a2533] dark:text-slate-300 md:py-2.5">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Camera className="h-4 w-4 shrink-0 text-[#F57F3d]" />
                  <span className="truncate">{selectedFile.name}</span>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="ml-2 shrink-0 text-sm text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                onClick={handleAttachReceipt}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1a2533] dark:text-slate-300 dark:hover:bg-slate-700 md:py-2.5"
              >
                <Camera className="h-4 w-4 text-[#F57F3d]" />
                Attach Receipt (Optional)
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleFileSelect}
            />
          </div>
        </main>

        <section className="z-20 rounded-t-[2.5rem] border-t border-white/50 bg-white/90 px-6 pb-8 pt-6 shadow-[0_-10px_40px_-10px_rgba(13,30,58,0.05)] backdrop-blur-md md:px-10">
          <Keypad onKeyPress={handleKeyPress} onBackspace={handleBackspace} />

          <button
            // disabled={isInsufficientBalance || enteredAmount <= 0}
            className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-bold tracking-wide text-white shadow-lg shadow-primary/30 transition-all hover:bg-[#e06b2c] active:scale-[0.99]"
            onClick={() => {
              if (isInsufficientBalance || enteredAmount <= 0) {
                toast.error('Insufficient wallet balance');
                return;
              }

              nextStep();
            }}
          >
            Continue
            <MdArrowForward className="text-xl transition-transform group-hover:translate-x-1" />
          </button>
        </section>
      </div>
    </div>
  );
};

export default PaymentSend;
