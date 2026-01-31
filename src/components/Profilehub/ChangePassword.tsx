import React from 'react';
import {MdVisibilityOff, MdCheck} from 'react-icons/md';
import {Header} from './ui/Header';

const ChangePassword: React.FC = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark flex flex-1 flex-col">
      <Header title="Change Password" />

      <main className="no-scrollbar flex flex-1 flex-col overflow-y-auto px-4 py-2">
        <p className="pb-6 pt-2 text-base font-normal leading-normal text-slate-900/70 dark:text-white/70">
          Your new password must be different from previous used passwords.
        </p>

        <div className="flex flex-col gap-5">
          {/* Current Password */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-normal text-slate-900 dark:text-white">
              Current Password
            </label>
            <div className="group relative flex items-center">
              <input
                className="flex h-14 w-full rounded-xl border border-[#e8dbce] bg-white px-4 pr-12 text-base text-slate-900 transition-all placeholder:text-[#9c7349] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
                placeholder="Enter current password"
                type="password"
              />
              <button className="absolute bottom-0 right-0 top-0 flex items-center justify-center px-4 text-[#9c7349] transition-colors hover:text-primary focus:outline-none dark:text-white/50 dark:hover:text-primary">
                <MdVisibilityOff className="text-2xl" />
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-normal text-slate-900 dark:text-white">
              New Password
            </label>
            <div className="relative flex items-center">
              <input
                className="flex h-14 w-full rounded-xl border border-[#e8dbce] bg-white px-4 pr-12 text-base text-slate-900 transition-all placeholder:text-[#9c7349] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
                placeholder="Enter new password"
                type="password"
              />
              <button className="absolute bottom-0 right-0 top-0 flex items-center justify-center px-4 text-[#9c7349] transition-colors hover:text-primary focus:outline-none dark:text-white/50 dark:hover:text-primary">
                <MdVisibilityOff className="text-2xl" />
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium leading-normal text-slate-900 dark:text-white">
              Confirm New Password
            </label>
            <div className="relative flex items-center">
              <input
                className="flex h-14 w-full rounded-xl border border-[#e8dbce] bg-white px-4 pr-12 text-base text-slate-900 transition-all placeholder:text-[#9c7349] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
                placeholder="Re-enter new password"
                type="password"
              />
              <button className="absolute bottom-0 right-0 top-0 flex items-center justify-center px-4 text-[#9c7349] transition-colors hover:text-primary focus:outline-none dark:text-white/50 dark:hover:text-primary">
                <MdVisibilityOff className="text-2xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="mb-8 mt-8">
          <p className="mb-3 text-sm font-medium text-slate-900/80 dark:text-white/80">
            Password requirements:
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                <MdCheck className="text-[14px] font-bold text-primary" />
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Min 8 characters
              </p>
            </div>

            <div className="flex items-center gap-3 opacity-60">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#e8dbce] dark:border-white/20"></div>
              <p className="text-sm font-normal text-slate-900 dark:text-white">
                At least 1 uppercase letter
              </p>
            </div>

            <div className="flex items-center gap-3 opacity-60">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#e8dbce] dark:border-white/20"></div>
              <p className="text-sm font-normal text-slate-900 dark:text-white">
                At least 1 number
              </p>
            </div>
          </div>
        </div>
      </main>

      <div className="bg-background-light dark:bg-background-dark p-4 pb-8">
        <button className="flex h-14 w-full items-center justify-center rounded-xl bg-primary px-6 text-base font-bold text-white shadow-lg shadow-primary/20 transition-transform hover:bg-primary/90 active:scale-[0.98]">
          Update Password
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
