import React from 'react';
import {GrNotification} from 'react-icons/gr';
import {useNavigate} from '@tanstack/react-router';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate({to: '/accounthub/acounthub'});
  };

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between bg-white px-6 py-4 dark:bg-[#101722]">
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-sm font-medium leading-normal text-slate-500 dark:text-[#94a3b8]">
          Good Morning,
        </p>
        <h2 className="text-xl font-bold leading-tight tracking-tight text-[#0d131c] dark:text-white">
          Asha Joshi
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative flex items-center justify-center rounded-full p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
          <GrNotification size={20} />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 dark:border-[#101722]"></span>
        </button>

        <button
          onClick={handleProfileClick}
          className="h-10 w-10 overflow-hidden rounded-full bg-slate-200 shadow-sm ring-2 ring-white transition-transform active:scale-95 dark:ring-[#101722]"
        >
          <img
            alt="Profile"
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          />
        </button>
      </div>
    </div>
  );
};
