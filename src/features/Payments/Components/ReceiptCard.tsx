import React from 'react';
import {MdContentCopy, MdAccountBalanceWallet} from 'react-icons/md';

const ReceiptCard: React.FC = () => {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="space-y-6 p-6">
        {/* To Section */}
        <div className="flex items-center justify-between">
          <p className="text-text-secondary text-sm font-medium">To</p>
          <div className="flex items-center gap-3">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuzH-8P6YKUtOCNo8ps_R4A27R4epni1ls55VQPj89XI-O_TiWN_EoVgHTD91f_a9R8CWW_blrcTLclIrnBH2atewBxjzZOiiOgAzayJH9LnKq5snkYBegxgm8W-XXc1oKG6PUhdN0xsJOSwLvm2uR3bB8ZwiSnZCXeWgkGwo5QfIqugzzn9WuQs3yZ7aR0YpUQ8ELsuqXZAArdfGKr6xtVpW_0NC2GZldK_6iIqC69cKpSPBOpDN3vneKBvK6dqnve0sXt2PVEg02"
              alt="Rahul Sharma"
              className="h-9 w-9 rounded-full border border-stone-100 object-cover shadow-sm"
            />
            <p className="text-text-dark text-base font-bold">Rahul Sharma</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-stone-100"></div>

        {/* From Section */}
        <div className="flex items-center justify-between">
          <p className="text-text-secondary text-sm font-medium">From</p>
          <div className="flex items-center gap-2">
            <div className="text-text-secondary rounded-md bg-stone-100 p-1.5">
              <MdAccountBalanceWallet className="text-sm" />
            </div>
            <p className="text-text-dark text-sm font-semibold">
              E Private Account
            </p>
          </div>
        </div>

        {/* Date Section */}
        <div className="flex items-center justify-between">
          <p className="text-text-secondary text-sm font-medium">Date</p>
          <p className="text-text-dark text-sm font-semibold">Oct 24, 2023</p>
        </div>

        {/* Time Section */}
        <div className="flex items-center justify-between">
          <p className="text-text-secondary text-sm font-medium">Time</p>
          <p className="text-text-dark text-sm font-semibold">14:30</p>
        </div>

        {/* Reference ID Section */}
        <div className="flex items-center justify-between">
          <p className="text-text-secondary text-sm font-medium">
            Reference ID
          </p>
          <div className="group flex cursor-pointer items-center gap-2 transition-opacity active:opacity-70">
            <p className="text-text-dark text-sm font-semibold">TXN98234710</p>
            <MdContentCopy className="text-sm text-primary opacity-80 group-hover:opacity-100" />
          </div>
        </div>
      </div>

      {/* Verified Footer */}
      <div className="flex h-8 items-center justify-center border-t border-stone-100 bg-stone-50">
        <p className="text-text-secondary text-[10px] font-bold uppercase tracking-widest">
          Verified Transaction
        </p>
      </div>
    </div>
  );
};

export default ReceiptCard;
