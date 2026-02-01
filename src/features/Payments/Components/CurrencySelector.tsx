import React from 'react';
import {MdExpandMore} from 'react-icons/md';

const CurrencySelector: React.FC = () => {
  return (
    <div className="mb-6">
      <button className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 shadow-sm transition-colors hover:bg-slate-50 active:scale-95">
        <div className="relative flex h-4 w-6 items-center justify-center overflow-hidden rounded-sm bg-blue-800 text-[8px] text-white shadow-sm">
          {/* Simple CSS US Flag Approximation */}
          <div className="absolute inset-0 flex flex-col">
            <div className="mt-1 h-[2px] w-full bg-white opacity-20"></div>
            <div className="mt-1 h-[2px] w-full bg-white opacity-20"></div>
          </div>
          <span className="relative z-10 font-bold">US</span>
        </div>
        <span className="text-swiss-navy text-sm font-bold">USD</span>
        <MdExpandMore className="text-lg text-slate-500" />
      </button>
    </div>
  );
};

export default CurrencySelector;
