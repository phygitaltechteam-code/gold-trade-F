import React from 'react';
import {MdBackspace, MdCheck, MdFace, MdArrowForward} from 'react-icons/md';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onSubmit?: () => void;
  showBiometric?: boolean;
  submitIcon?: 'check' | 'arrow';
  disabled?: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  onKeyPress,
  onDelete,
  onSubmit,
  showBiometric = false,
  submitIcon = 'check',
  disabled = false,
}) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="w-full rounded-t-[2rem] bg-white pb-8 pt-6 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] dark:bg-[#1e1610]">
      <div className="mx-auto grid max-w-[320px] grid-cols-3 gap-x-6 gap-y-4 px-4">
        {keys.map((key) => (
          <button
            key={key}
            onClick={() => onKeyPress(key)}
            className="flex h-16 w-full select-none items-center justify-center rounded-2xl bg-transparent text-3xl font-medium text-slate-900 transition-colors hover:bg-slate-50 focus:outline-none active:bg-slate-100 dark:text-white dark:hover:bg-white/5 sm:h-[72px]"
          >
            {key}
          </button>
        ))}

        {/* Bottom Row */}
        <div className="flex items-center justify-center">
          {showBiometric ? (
            <button className="flex h-16 w-full items-center justify-center rounded-2xl text-black font-bold transition-transform active:scale-95 sm:h-[72px]">
           .
            </button>
          ) : (
            <button
              onClick={onDelete}
              className="flex h-16 w-full items-center justify-center rounded-2xl text-slate-400 transition-all hover:text-primary active:scale-95 sm:h-[72px]"
            >
              <MdBackspace className="text-2xl" />
            </button>
          )}
        </div>

        <button
          onClick={() => onKeyPress('0')}
          className="flex h-16 w-full select-none items-center justify-center rounded-2xl text-3xl font-medium text-slate-900 transition-colors hover:bg-slate-50 active:bg-slate-100 dark:text-white dark:hover:bg-white/5 sm:h-[72px]"
        >
          0
        </button>

        <div className="flex items-center justify-center">
          {onSubmit ? (
            <button
              onClick={onSubmit}
              disabled={disabled}
              className={`flex h-16 w-full items-center justify-center rounded-2xl shadow-lg transition-all active:scale-95 sm:h-[72px] ${
                disabled
                  ? 'bg-gray-400 shadow-gray-400/30 cursor-not-allowed'
                  : 'hover:bg-primary-dark cursor-pointer bg-primary text-white shadow-primary/30'
              }`}
            >
              {submitIcon === 'check' ? (
                <MdCheck className="text-3xl" />
              ) : (
                <MdArrowForward className="text-3xl" />
              )}
            </button>
          ) : showBiometric ? (
            <button
              onClick={onDelete}
              className="flex h-16 w-full items-center justify-center rounded-2xl text-slate-900 transition-all hover:text-primary active:scale-95 dark:text-white/80 sm:h-[72px]"
            >
              <MdBackspace className="text-2xl" />
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
};
