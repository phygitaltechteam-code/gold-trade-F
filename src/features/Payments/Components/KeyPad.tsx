import React from 'react';
import {MdBackspace} from 'react-icons/md';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
}

const Keypad: React.FC<KeypadProps> = ({onKeyPress, onBackspace}) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

  return (
    <div className="mx-auto mb-6 grid w-full max-w-xs grid-cols-3 gap-x-6 gap-y-4">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => onKeyPress(key)}
          className="text-swiss-navy flex h-14 w-full select-none items-center justify-center rounded-2xl text-2xl font-semibold transition-all duration-100 hover:bg-slate-100 active:scale-95 active:bg-primary/10"
        >
          {key}
        </button>
      ))}
      <button
        onClick={onBackspace}
        className="text-swiss-navy group flex h-14 w-full select-none items-center justify-center rounded-2xl transition-all duration-100 hover:bg-slate-100 active:scale-95 active:bg-primary/10"
      >
        <MdBackspace className="text-2xl transition-transform group-active:scale-90" />
      </button>
    </div>
  );
};

export default Keypad;
