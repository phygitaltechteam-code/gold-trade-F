import React from 'react';
import {
  MdPhotoCamera,
  MdEdit,
  MdCalendarMonth,
  MdLock,
  MdVisibilityOff,
} from 'react-icons/md';
import {Header} from './ui/Header';

const EditPersonalInfo: React.FC = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark flex flex-1 flex-col">
      <Header title="Edit Personal Info" />

      <div className="no-scrollbar flex flex-1 flex-col items-center overflow-y-auto pb-6">
        {/* Profile Photo Section */}
        <section className="flex flex-col items-center px-6 pb-8 pt-4">
          <div className="group relative cursor-pointer">
            <div
              className="h-32 w-32 rounded-full border-4 border-white bg-cover bg-center shadow-md dark:border-[#3a2e24]"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1501973801540-537f08ccae7b?auto=format&fit=crop&w=400&q=80')`,
              }}
            />
            {/* Edit Badge */}
            <div className="border-background-light dark:border-background-dark absolute bottom-0 right-0 flex items-center justify-center rounded-full border-4 bg-primary p-2 text-white shadow-sm">
              <MdPhotoCamera className="text-[20px]" />
            </div>
          </div>
          <button className="mt-4 text-sm font-semibold text-primary transition-colors hover:text-orange-600 hover:underline">
            Change Profile Photo
          </button>
        </section>

        {/* Form Section */}
        <form
          className="flex w-full flex-1 flex-col gap-6 px-6"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Full Name Input */}
          <div className="flex flex-col gap-2">
            <label
              className="text-navy text-sm font-bold uppercase tracking-wider dark:text-slate-200"
              htmlFor="full-name"
            >
              Full Name
            </label>
            <div className="group relative">
              <input
                className="text-navy placeholder-gray-400 w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-base font-medium shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-[#443629] dark:bg-[#2c241b] dark:text-white"
                id="full-name"
                type="text"
                defaultValue="Jane Doe"
                placeholder="Enter your full name"
              />
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-primary opacity-0 transition-opacity group-focus-within:opacity-100">
                <MdEdit />
              </div>
            </div>
          </div>

          {/* Date of Birth Input */}
          <div className="flex flex-col gap-2">
            <label
              className="text-navy text-sm font-bold uppercase tracking-wider dark:text-slate-200"
              htmlFor="dob"
            >
              Date of Birth
            </label>
            <div className="relative">
              <input
                className="text-navy w-full cursor-not-allowed rounded-xl border border-slate-200 bg-white px-4 py-4 pr-12 text-base font-medium opacity-90 shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-[#443629] dark:bg-[#2c241b] dark:text-white"
                id="dob"
                type="text"
                defaultValue="12 / 05 / 1990"
                readOnly
              />
              <div className="text-gray-400 dark:text-gray-500 pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <MdCalendarMonth className="text-xl" />
              </div>
            </div>
          </div>

          {/* Tax ID Input */}
          <div className="flex flex-col gap-2">
            <label
              className="text-navy flex items-center gap-2 text-sm font-bold uppercase tracking-wider dark:text-slate-200"
              htmlFor="tax-id"
            >
              Tax ID (Masked)
              <MdLock
                className="text-gray-400 text-base"
                title="Secure field"
              />
            </label>
            <div className="relative">
              <input
                className="text-navy w-full rounded-xl border border-slate-200 bg-white px-4 py-4 pr-12 text-base font-medium tracking-widest shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50 dark:border-[#443629] dark:bg-[#2c241b] dark:text-white"
                id="tax-id"
                type="text"
                defaultValue="***-**-6789"
                readOnly
              />
              <button
                className="absolute bottom-0 right-0 top-0 flex items-center justify-center px-4 text-primary transition-colors hover:text-orange-700"
                type="button"
              >
                <MdVisibilityOff className="text-xl" />
              </button>
            </div>
            <p className="px-1 text-xs text-slate-500 dark:text-slate-400">
              Your Tax ID is encrypted for your security.
            </p>
          </div>
        </form>

        {/* Action Button */}
        <div className="mt-auto w-full px-6 pb-6 pt-8">
          <button className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 active:scale-[0.98]">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPersonalInfo;
