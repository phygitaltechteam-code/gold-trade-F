import React, {useState} from 'react';
import {Header} from '../ui/Header';
import {Keypad} from '../ui/Keypad';
import {MdLockReset} from 'react-icons/md';
import {useNavigate} from '@tanstack/react-router';

const SetNewPin: React.FC = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState<string>('12');

  const handleKeyPress = (key: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + key);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="bg-background-light dark:bg-background-dark flex flex-1 flex-col">
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
          onSubmit={() => navigate({to: '/accounthub/confirm-pin'})}
          submitIcon="arrow"
        />
        <div className="flex h-6 w-full justify-center bg-white pt-2 dark:bg-[#1e1610]">
          <div className="h-1 w-32 rounded-full bg-slate-200 dark:bg-slate-700"></div>
        </div>
      </div>
    </div>
  );
};

export default SetNewPin;
