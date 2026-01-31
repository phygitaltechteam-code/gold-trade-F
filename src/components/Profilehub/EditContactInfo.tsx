import React from 'react';
import {MdExpandMore, MdMail} from 'react-icons/md';
import {Header} from './ui/Header';

const EditContactInfo: React.FC = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark flex flex-1 flex-col">
      <Header title="Edit Contact Info" />

      <main className="no-scrollbar flex w-full flex-1 flex-col gap-6 overflow-y-auto px-5 py-6">
        {/* Mobile Number */}
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
            htmlFor="mobile"
          >
            Mobile Number
          </label>
          <div className="relative flex w-full items-center rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary dark:border-white/10 dark:bg-white/5">
            <button
              className="group flex items-center gap-2 rounded-l-xl border-r border-slate-200 py-3.5 pl-4 pr-3 transition-colors hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
              type="button"
            >
              <span className="text-xl">🇺🇸</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                +1
              </span>
              <MdExpandMore className="text-[18px] text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300" />
            </button>
            <input
              className="w-full flex-1 border-none bg-transparent px-4 py-3.5 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-white"
              id="mobile"
              type="tel"
              defaultValue="(555) 123-4567"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
            htmlFor="email"
          >
            Personal Email
          </label>
          <div className="relative flex w-full items-center rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary dark:border-white/10 dark:bg-white/5">
            <div className="pl-4 text-slate-400 dark:text-slate-500">
              <MdMail className="text-[20px]" />
            </div>
            <input
              className="w-full flex-1 border-none bg-transparent px-3 py-3.5 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-white"
              id="email"
              type="email"
              defaultValue="alex.morgan@example.com"
            />
          </div>
        </div>

        {/* Address */}
        <div className="flex flex-col gap-2">
          <label
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
            htmlFor="address"
          >
            Residential Address
          </label>
          <div className="relative w-full rounded-xl border border-slate-200 bg-white shadow-sm transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary dark:border-white/10 dark:bg-white/5">
            <textarea
              className="flex min-h-[120px] w-full resize-none rounded-xl border-none bg-transparent p-4 text-base leading-relaxed text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-white"
              id="address"
              rows={4}
              defaultValue={`1234 Orange St, Suite 100\nSan Francisco, CA 94107\nUnited States`}
            />
          </div>
          <p className="px-1 text-xs text-slate-500 dark:text-slate-400">
            Please use your physical street address for regulatory purposes.
          </p>
        </div>
      </main>

      <div className="bg-background-light dark:bg-background-dark mt-auto p-5 pb-8">
        <div className="flex w-full flex-col gap-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]">
            <span>Update Contact Info</span>
          </button>
          <button className="text-center text-sm font-medium text-slate-500 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary">
            Having trouble updating your address?
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditContactInfo;
