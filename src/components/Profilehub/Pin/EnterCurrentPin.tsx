import React, {useState} from 'react';
import {useNavigate} from '@tanstack/react-router';
import {Header} from '../ui/Header';
import {Keypad} from '../ui/Keypad';
import {MdLockReset} from 'react-icons/md';

const EnterCurrentPin: React.FC = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState<string>('12'); // Simulating some input already

  const handleKeyPress = (key: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + key);
      // Simulate auto-advance or validation
      if (pin.length + 1 === 6) {
        setTimeout(() => navigate({to: '/accounthub/setnew-pin'}), 500);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="bg-background-light dark:bg-background-dark flex flex-1 flex-col">
      <Header />

      <main className="flex w-full flex-1 flex-col items-center px-6 pb-4 pt-6">
        {/* Icon */}
        <div className="mb-6 flex items-center justify-center rounded-full bg-primary/10 p-4 dark:bg-primary/20">
          <MdLockReset className="text-[32px] text-primary" />
        </div>

        <h1 className="mb-3 text-center text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white md:text-3xl">
          Change Transaction PIN
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-[280px] text-center text-base leading-relaxed">
          Enter your current 6-digit PIN to continue.
        </p>

        {/* Dots */}
        <div className="mb-10 flex gap-4 md:gap-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`h-4 w-4 rounded-full transition-all duration-200 ${
                i < pin.length
                  ? 'bg-primary shadow-[0_0_10px_rgba(242,127,13,0.4)]'
                  : 'bg-gray-300 dark:bg-gray-600 border-2 border-transparent'
              }`}
            />
          ))}
        </div>

        <button className="rounded-lg px-2 py-1 text-sm font-semibold text-primary underline decoration-2 underline-offset-4 transition-colors hover:text-primary/80 focus:outline-none">
          Forgot PIN?
        </button>
      </main>

      <div className="mt-auto">
        <Keypad
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          showBiometric={true}
        />
        {/* Safe area padding */}
        <div className="h-6 w-full bg-white dark:bg-[#1e1610]" />
      </div>
    </div>
  );
};

export default EnterCurrentPin;
