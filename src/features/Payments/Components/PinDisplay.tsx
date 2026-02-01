import React from 'react';

interface PinDisplayProps {
  pin: string;
  maxLength: number;
}

export const PinDisplay: React.FC<PinDisplayProps> = ({pin, maxLength}) => {
  // Create an array of length `maxLength` to map over
  const slots = Array.from({length: maxLength});

  return (
    <div className="mx-auto flex w-full max-w-[340px] justify-between gap-3 px-2">
      {slots.map((_, index) => {
        const isFilled = index < pin.length;
        const isActive = index === pin.length;

        return (
          <div
            key={index}
            className={`relative flex h-12 w-full items-center justify-center border-b-2 transition-all duration-200 ${isFilled || isActive ? 'border-primary' : 'border-slate-200'} `}
          >
            <div
              className={`mt-4 h-2.5 w-2.5 transform rounded-full bg-black/70 transition-all duration-200 ${isFilled ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} `}
            />
          </div>
        );
      })}
    </div>
  );
};
