import React, {useState, useRef} from 'react';
import {ArrowLeft, Lock, Camera} from 'lucide-react';
import {MdBackspace} from 'react-icons/md';
import {useNavigate} from '@tanstack/react-router';
import {Keypad} from '../Profilehub/ui/Keypad';

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
  const [inputValue, setInputValue] = useState<string>('0');
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

  // Get numeric value for validation
  const getNumericValue = () => {
    return parseFloat(inputValue.replace(/,/g, '') || '0');
  };

  // Handle continue button
  const handleContinue = () => {
    const amount = formattedValue();
    const numericValue = getNumericValue();

    if (numericValue > 0 && onContinue) {
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
    <div className="font-inter flex h-screen flex-col bg-[#f8f6f5] text-[#0d131c] dark:bg-[#221610] dark:text-white">
      {/* Header - Fixed with reduced padding for tablet */}
      <div className="shrink-0 border-b border-slate-200/50 bg-[#f8f6f5] px-4 pb-2 pt-4 dark:border-slate-800/50 dark:bg-[#221610] md:pt-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate({to: '/dashboard'})}
            className="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5 text-[#0d131c] dark:text-white" />
          </button>
          <h2 className="text-center text-lg font-bold leading-tight md:text-xl">
            Top Up Wallet
          </h2>
          <div className="w-10" /> {/* Spacer for balance */}
        </div>
      </div>

      {/* Main Content - No scrolling, fixed layout */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full flex-col">
          {/* Account Type Toggle - Reduced spacing for tablet */}
          <div className="shrink-0 px-4 pt-3 md:pt-4">
            <div className="flex w-full items-stretch rounded-xl bg-slate-200/50 p-1 dark:bg-[#1a2533]/50">
              <button
                onClick={() => setAccountType('private')}
                className={`flex-1 rounded-lg border py-2.5 text-xs font-bold leading-tight transition-all md:py-3 md:text-sm ${
                  accountType === 'private'
                    ? 'border-slate-100 bg-white text-[#F57F3d] shadow-sm dark:border-slate-700 dark:bg-[#1a2533]'
                    : 'border-transparent text-slate-500 hover:text-[#0d131c] dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                E Private Account
              </button>
              <button
                onClick={() => setAccountType('virtual')}
                className={`flex-1 rounded-lg border py-2.5 text-xs font-bold leading-tight transition-all md:py-3 md:text-sm ${
                  accountType === 'virtual'
                    ? 'border-slate-100 bg-white text-[#F57F3d] shadow-sm dark:border-slate-700 dark:bg-[#1a2533]'
                    : 'border-transparent text-slate-500 hover:text-[#0d131c] dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Temporarily Virtual Account
              </button>
            </div>
          </div>

          {/* Amount Display Section - Reduced spacing for tablet */}
          <div className="flex flex-1 flex-col items-center justify-center px-4 md:px-8">
            <div className="w-full max-w-xs md:max-w-sm">
              <p className="mb-2 text-center text-sm font-medium text-slate-500 dark:text-slate-400 md:mb-3 md:text-base">
                Enter Amount
              </p>
              <div className="relative mb-4 flex items-center justify-center md:mb-6">
                <span className="mr-1 text-2xl font-bold text-[#0d131c] dark:text-white md:text-3xl">
                  ₹
                </span>
                <div className="relative">
                  <input
                    readOnly
                    className="w-36 border-none bg-transparent p-0 text-center text-3xl font-bold text-[#0d131c] caret-[#F57F3d] focus:ring-0 dark:text-white md:w-40 md:text-4xl"
                    type="text"
                    value={formattedValue()}
                    onFocus={() => setIsInputActive(true)}
                    onBlur={() => setIsInputActive(false)}
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

              {/* Attach Receipt Button - Reduced spacing */}
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

              {/* Security Notice - Reduced spacing */}
              <div className="flex items-center justify-center gap-1.5 py-1 opacity-70 md:py-2">
                <Lock className="h-3 w-3 text-slate-400 dark:text-slate-500 md:h-3.5 md:w-3.5" />
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  Secure 256-bit SSL Encryption
                </p>
              </div>
            </div>
          </div>

          {/* Keypad - Fixed at bottom with reduced height for tablet */}
          <div className="shrink-0">
            <Keypad
              onKeyPress={handleKeyPress}
              onDelete={handleBackspace}
              onSubmit={handleContinue}
              showBiometric={false}
              submitIcon="arrow"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUpScreen;
