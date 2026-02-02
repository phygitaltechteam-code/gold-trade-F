import React, {useState, useRef} from 'react';
import {ArrowLeft, ArrowRight, Lock, Camera} from 'lucide-react';
import {MdBackspace} from 'react-icons/md';
import {useNavigate} from '@tanstack/react-router';

interface TopUpScreenProps {
  onBack?: () => void;
  onContinue?: (
    amount: string,
    accountType: 'private' | 'virtual',
    receipt?: File,
  ) => void;
}

const TopUpScreen: React.FC<TopUpScreenProps> = ({onBack, onContinue}) => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState<string>('2500');
  const [accountType, setAccountType] = useState<'private' | 'virtual'>(
    'private',
  );
  const [isInputActive, setIsInputActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle keypad button press
  const handleKeyPress = (key: string) => {
    setIsInputActive(true);
    setTimeout(() => setIsInputActive(false), 300);

    if (key === '.' && inputValue.includes('.')) {
      return;
    }

    const currentValue = inputValue.replace(/,/g, '');

    if (key === '.' && currentValue === '') {
      setInputValue('0.');
      return;
    }

    const parts = currentValue.split('.');
    if (parts[0].length >= 9 && key !== '.' && key !== '0') {
      return;
    }

    if (currentValue === '0' && key !== '.') {
      setInputValue(key);
    } else {
      setInputValue(currentValue + key);
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    setIsInputActive(true);
    setTimeout(() => setIsInputActive(false), 300);

    const currentValue = inputValue.replace(/,/g, '');
    if (currentValue.length <= 1) {
      setInputValue('0');
    } else {
      setInputValue(currentValue.slice(0, -1));
    }
  };

  // Add quick amount
  const handleAddAmount = (amount: number) => {
    setIsInputActive(true);
    setTimeout(() => setIsInputActive(false), 300);

    const currentValue = parseFloat(inputValue.replace(/,/g, '')) || 0;
    const newValue = currentValue + amount;
    setInputValue(newValue.toString());
  };

  // Format the display value with commas
  const formattedValue = () => {
    const value = inputValue.replace(/,/g, '');
    if (value === '' || value === '0') return '0';

    if (value.endsWith('.')) {
      const integerPart = parseInt(value.slice(0, -1) || '0', 10);
      return integerPart.toLocaleString() + '.';
    }

    const parts = value.split('.');
    const integerPart = parseInt(parts[0] || '0', 10).toLocaleString();

    if (parts.length > 1) {
      const decimalPart = parts[1].slice(0, 2);
      return `${integerPart}.${decimalPart}`;
    }

    return integerPart;
  };

  // Handle continue button
  const handleContinue = () => {
    const amount = formattedValue();
    if (onContinue) {
      onContinue(amount, accountType, selectedFile || undefined);
    }
  };

  // Handle attach receipt button click
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
    <div className="font-inter min-h-screen bg-[#f8f6f5] text-[#0d131c] dark:bg-[#221610] dark:text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#f8f6f5] px-4 pb-2 pt-6 dark:bg-[#221610]">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate({to: '/dashboard'})}
            className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-6 w-6 text-[#0d131c] dark:text-white" />
          </button>
          <h2 className="flex-1 pr-10 text-center text-lg font-bold leading-tight">
            Top Up Wallet
          </h2>
        </div>
      </div>

      <main className="flex flex-1 flex-col px-4 pb-6 pt-2">
        {/* Account Type Toggle */}
        <div className="mb-2 flex w-full items-stretch rounded-xl bg-slate-200/50 p-1 dark:bg-[#1a2533]/50">
          <button
            onClick={() => setAccountType('private')}
            className={`flex-1 rounded-lg border py-2.5 text-xs font-bold leading-tight transition-all sm:text-sm ${
              accountType === 'private'
                ? 'border-slate-100 bg-white text-[#F57F3d] shadow-sm dark:border-slate-700 dark:bg-[#1a2533]'
                : 'border-transparent text-slate-500 hover:text-[#0d131c] dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            E Private Account
          </button>
          <button
            onClick={() => setAccountType('virtual')}
            className={`flex-1 rounded-lg border py-2.5 text-xs font-bold leading-tight transition-all sm:text-sm ${
              accountType === 'virtual'
                ? 'border-slate-100 bg-white text-[#F57F3d] shadow-sm dark:border-slate-700 dark:bg-[#1a2533]'
                : 'border-transparent text-slate-500 hover:text-[#0d131c] dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Temporarily Virtual Account
          </button>
        </div>

        {/* Amount Display Section */}
        <div className="flex flex-col items-center justify-center pb-4 pt-6">
          <p className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Enter Amount
          </p>
          <div className="relative mb-6 flex items-center justify-center">
            <span className="mr-1 text-4xl font-bold text-[#0d131c] dark:text-white">
              ₹
            </span>
            <div className="relative">
              <input
                readOnly
                className="w-48 border-none bg-transparent p-0 text-center text-5xl font-bold text-[#0d131c] caret-[#F57F3d] focus:ring-0 dark:text-white"
                type="text"
                value={formattedValue()}
              />
              <div
                className={`absolute bottom-[-4px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F57F3d] to-transparent transition-all duration-300 ${
                  isInputActive
                    ? 'scale-x-100 opacity-100'
                    : 'scale-x-0 opacity-0'
                }`}
              />
              <div className="absolute bottom-[-6px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600" />
            </div>
          </div>

          {/* Attach Receipt Button */}
          <div className="flex flex-col items-center gap-2">
            {selectedFile ? (
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-[#1a2533] dark:text-slate-300">
                <Camera className="h-4 w-4 text-[#F57F3d]" />
                <span className="max-w-[150px] truncate">
                  {selectedFile.name}
                </span>
                <button
                  onClick={handleRemoveFile}
                  className="ml-2 text-red-500 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={handleAttachReceipt}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-[#1a2533] dark:text-slate-300 dark:hover:bg-slate-700"
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
        </div>

        {/* Quick Add Chips */}
        <div className="no-scrollbar mb-8 flex justify-center gap-3 overflow-x-auto py-1">
          <button
            onClick={() => handleAddAmount(50)}
            className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full border border-slate-200 bg-white px-5 shadow-sm transition-all hover:bg-slate-50 active:border-[#F57F3d] active:bg-[#F57F3d]/10 active:text-[#F57F3d] dark:border-slate-700 dark:bg-[#1a2533] dark:hover:bg-slate-700"
          >
            <span className="text-sm font-medium leading-normal">+ ₹50</span>
          </button>
          <button
            onClick={() => handleAddAmount(100)}
            className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full border border-[#F57F3d]/30 bg-[#F57F3d]/5 px-5 text-[#F57F3d] shadow-sm ring-1 ring-[#F57F3d]/20 transition-all hover:bg-[#F57F3d]/10"
          >
            <span className="text-sm font-bold leading-normal">+ ₹100</span>
          </button>
          <button
            onClick={() => handleAddAmount(500)}
            className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full border border-slate-200 bg-white px-5 shadow-sm transition-all hover:bg-slate-50 active:border-[#F57F3d] active:bg-[#F57F3d]/10 active:text-[#F57F3d] dark:border-slate-700 dark:bg-[#1a2533] dark:hover:bg-slate-700"
          >
            <span className="text-sm font-medium leading-normal">+ ₹500</span>
          </button>
        </div>

        {/* Security Notice */}
        <div className="mb-4 mt-auto flex items-center justify-center gap-1.5 py-4 opacity-70">
          <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Secure 256-bit SSL Encryption
          </p>
        </div>

        {/* Keypad */}
        <div>
          <div className="mb-6 grid grid-cols-3 gap-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num.toString())}
                className="h-12 w-full rounded-lg text-2xl font-medium text-[#0d131c] transition-all hover:bg-slate-100 active:scale-95 dark:text-white dark:hover:bg-slate-700"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleKeyPress('.')}
              className="h-12 w-full rounded-lg text-2xl font-medium text-[#0d131c] transition-all hover:bg-slate-100 active:scale-95 dark:text-white dark:hover:bg-slate-700"
            >
              .
            </button>
            <button
              onClick={() => handleKeyPress('0')}
              className="h-12 w-full rounded-lg text-2xl font-medium text-[#0d131c] transition-all hover:bg-slate-100 active:scale-95 dark:text-white dark:hover:bg-slate-700"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="flex h-12 w-full items-center justify-center rounded-lg text-[#0d131c] transition-all hover:bg-slate-100 active:scale-95 dark:text-white dark:hover:bg-slate-700"
            >
              <MdBackspace className="h-6 w-6" />
            </button>
          </div>

          <button
            onClick={handleContinue}
            disabled={
              !formattedValue() ||
              parseFloat(formattedValue().replace(/,/g, '')) <= 0
            }
            className={`flex h-14 w-full items-center justify-center gap-2 rounded-xl text-lg font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
              !formattedValue() ||
              parseFloat(formattedValue().replace(/,/g, '')) <= 0
                ? 'bg-gray-400 shadow-gray-400/30 cursor-not-allowed'
                : 'bg-[#F57F3d] shadow-[#F57F3d]/30 hover:bg-[#d96626]'
            }`}
          >
            Add ₹{formattedValue()}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default TopUpScreen;
