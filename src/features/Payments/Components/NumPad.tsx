import {useNavigate} from '@tanstack/react-router';
import React from 'react';
import {MdBackspace, MdCheck} from 'react-icons/md';

interface NumpadProps {
  onNumPress: (num: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

export const Numpad: React.FC<NumpadProps> = ({
  onNumPress,
  onDelete,
  onSubmit,
  canSubmit,
}) => {
  const navigate = useNavigate();
  return (
    <div className="mx-auto grid w-full max-w-[320px] select-none grid-cols-3 gap-x-6 gap-y-4">
      {/* 1-9 */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button
          key={num}
          onClick={() => onNumPress(num.toString())}
          className="group relative mx-auto flex h-16 w-16 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <div className="bg-navy absolute inset-0 rounded-full opacity-0 transition-opacity group-active:opacity-5" />
          <span className="text-navy font-sans text-[32px] font-normal">
            {num}
          </span>
        </button>
      ))}

      {/* Backspace */}
      <button
        onClick={onDelete}
        aria-label="Backspace"
        className="group relative mx-auto flex h-16 w-16 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <div className="bg-navy absolute inset-0 rounded-full opacity-0 transition-opacity group-active:opacity-5" />
        <MdBackspace className="group-hover:text-navy text-[26px] text-slate-400 transition-colors" />
      </button>

      {/* 0 */}
      <button
        onClick={() => onNumPress('0')}
        className="group relative mx-auto flex h-16 w-16 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <div className="bg-navy absolute inset-0 rounded-full opacity-0 transition-opacity group-active:opacity-5" />
        <span className="text-navy font-sans text-[32px] font-normal">0</span>
      </button>

      {/* Check / Submit */}
      <button
        // onClick={onSubmit}
        disabled={!canSubmit}
        aria-label="Submit PIN"
        className={`shadow-glow relative mx-auto flex h-16 w-16 items-center justify-center rounded-full outline-none transition-all duration-300 ${
          canSubmit
            ? 'scale-100 bg-primary text-white hover:bg-primary/70 active:scale-95'
            : 'scale-90 cursor-not-allowed bg-primary/10 text-primary/50 shadow-none'
        } `}
        onClick={() => navigate({to: '/transactionstatus'})}
      >
        <MdCheck className="text-[28px]" />
      </button>
    </div>
  );
};
