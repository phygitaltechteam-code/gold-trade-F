import React from 'react';

interface AmountDisplayProps {
  amount: string;
}

const AmountDisplay: React.FC<AmountDisplayProps> = ({amount}) => {
  return (
    <div className="relative mb-2 flex items-baseline justify-center">
      <span className="mr-2 mt-4 self-start text-3xl font-bold text-slate-400">
        $
      </span>
      <h1 className="text-swiss-navy flex items-center text-[64px] font-bold leading-none tracking-tight drop-shadow-sm">
        {amount || '0'}
        <span className="animate-cursor-blink ml-1 block h-[50px] w-[4px] -translate-y-1 rounded-full bg-primary text-primary"></span>
      </h1>
    </div>
  );
};

export default AmountDisplay;
