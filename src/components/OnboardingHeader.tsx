import React from 'react';
import { ArrowLeft, Moon, Sun, HelpCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface Props {
  step: number;
  title: string;
}

const OnboardingHeader: React.FC<Props> = ({ step, title }) => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <header className="w-full bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate({to:'/landingpage'})} 
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white text-xs font-bold">SQ</div>
           <h1 className="text-xl font-bold tracking-tight text-secondary dark:text-white hidden sm:block">Swissquote</h1>
        </div>
      </div>

      {/* Progress Steps (Hidden on mobile) */}
      <div className="hidden md:flex items-center gap-2">
        <StepIndicator number={1} label="Personal Details" active={step === 1} completed={step > 1}  />
        <div className="w-8 h-px bg-gray-200 dark:bg-gray-700"></div>
        <StepIndicator number={2} label="Verify Identity" active={step === 2} completed={step > 2} />
        <div className="w-8 h-px bg-gray-200 dark:bg-gray-700"></div>
        <StepIndicator number={3} label="Facial Scan" active={step === 3} completed={step > 3} />
      </div>

      <div className="flex items-center gap-4">
        <button className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary transition">Help</button>
        <button 
          onClick={() => setIsDark(!isDark)}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 transition hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};

const StepIndicator = ({ number, label, active, completed }: { number: number, label: string, active: boolean, completed: boolean }) => {
  if (completed) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 text-xs font-bold">
           ✓
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${active ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
        {number}
      </span>
      <span className={`text-sm font-semibold ${active ? 'text-primary' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
};

export default OnboardingHeader;