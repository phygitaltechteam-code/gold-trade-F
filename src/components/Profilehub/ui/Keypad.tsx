import React from 'react';
import {MdBackspace, MdCheck, MdFace, MdArrowForward} from 'react-icons/md';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onSubmit?: () => void;
  showBiometric?: boolean;
  submitIcon?: 'check' | 'arrow';
}

export const Keypad: React.FC<KeypadProps> = ({
  onKeyPress,
  onDelete,
  onSubmit,
  showBiometric = false,
  submitIcon = 'check',
}) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="w-full rounded-t-[2rem] bg-white pb-8 pt-6 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] dark:bg-[#1e1610]">
      <div className="mx-auto grid max-w-[320px] grid-cols-3 gap-x-6 gap-y-4">
        {keys.map((key) => (
          <button
            key={key}
            onClick={() => onKeyPress(key)}
            className="flex h-[72px] w-full select-none items-center justify-center rounded-2xl bg-transparent text-3xl font-medium text-slate-900 transition-colors hover:bg-slate-50 focus:outline-none active:bg-slate-100 dark:text-white dark:hover:bg-white/5"
          >
            {key}
          </button>
        ))}

        {/* Bottom Row */}
        <div className="flex items-center justify-center">
          {showBiometric ? (
            <button className="flex h-[72px] w-full items-center justify-center rounded-2xl text-primary transition-transform active:scale-95">
              <MdFace className="text-3xl" />
            </button>
          ) : (
            <button
              onClick={onDelete}
              className="flex h-[72px] w-full items-center justify-center rounded-2xl text-slate-400 transition-all hover:text-primary active:scale-95"
            >
              <MdBackspace className="text-2xl" />
            </button>
          )}
        </div>

        <button
          onClick={() => onKeyPress('0')}
          className="flex h-[72px] w-full select-none items-center justify-center rounded-2xl text-3xl font-medium text-slate-900 transition-colors hover:bg-slate-50 active:bg-slate-100 dark:text-white dark:hover:bg-white/5"
        >
          0
        </button>

        <div className="flex items-center justify-center">
          {onSubmit ? (
            <button
              onClick={onSubmit}
              className="hover:bg-primary-dark flex h-[72px] w-full items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 transition-all active:scale-95"
            >
              {submitIcon === 'check' ? (
                <MdCheck className="text-3xl" />
              ) : (
                <MdArrowForward className="text-3xl" />
              )}
            </button>
          ) : // If showBiometric is true, the delete button moves here usually,
          // but strictly following the design in "Confirm New PIN" (HTML 2), backspace is left.
          // In "Change Transaction PIN" (HTML 3), backspace is right.
          // We will adapt based on props.
          showBiometric ? (
            <button
              onClick={onDelete}
              className="flex h-[72px] w-full items-center justify-center rounded-2xl text-slate-900 transition-all hover:text-primary active:scale-95 dark:text-white/80"
            >
              <MdBackspace className="text-2xl" />
            </button>
          ) : (
            // Empty placeholder or custom logic
            <div />
          )}
        </div>
      </div>
    </div>
  );
};
