import {useNavigate} from '@tanstack/react-router';
import React from 'react';
import {
  MdArrowBackIosNew,
  MdEdit,
  MdPerson,
  MdChevronRight,
  MdContactMail,
  MdLock,
  MdDialpad,
  MdFace,
  MdLogout,
} from 'react-icons/md';

const AccountHub: React.FC = () => {
  const navigate = useNavigate();

  const MenuItem: React.FC<{
    icon: React.ElementType;
    title: string;
    subtitle?: string;
    onClick?: () => void;
    hasToggle?: boolean;
    toggleValue?: boolean;
  }> = ({icon: Icon, title, subtitle, onClick, hasToggle, toggleValue}) => (
    <div
      onClick={onClick}
      className={`group flex cursor-pointer items-center justify-between border-b border-slate-100 p-4 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-700/30`}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-primary dark:bg-white/5">
          <Icon className="text-[22px]" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {title}
          </span>
          {subtitle && (
            <span className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {hasToggle ? (
        <div className="pointer-events-none relative inline-flex cursor-pointer items-center">
          <div
            className={`peer h-6 w-11 rounded-full transition-colors ${toggleValue ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-600'}`}
          >
            <div
              className={`border-gray-300 absolute left-[2px] top-[2px] h-5 w-5 rounded-full border bg-white transition-transform ${toggleValue ? 'translate-x-full border-white' : ''}`}
            ></div>
          </div>
        </div>
      ) : (
        <MdChevronRight className="text-gray-300 text-[20px] transition-colors group-hover:text-primary dark:text-slate-600" />
      )}
    </div>
  );

  return (
    <div className="bg-background-light dark:bg-background-dark flex flex-1 flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-[#0F1535]/95">
        <button className="-ml-2 flex items-center justify-center rounded-full p-2 text-slate-900 transition-colors hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800">
          <MdArrowBackIosNew />
        </button>
        <h1 className="flex-1 pr-8 text-center text-base font-bold tracking-tight text-slate-900 dark:text-white">
          Account Hub
        </h1>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto pb-10">
        {/* Profile Section */}
        <section className="flex flex-col items-center justify-center px-4 py-8 text-center">
          <div
            className="group relative cursor-pointer"
            onClick={() => navigate({to: '/accounthub/personal-info'})}
          >
            <div
              className="h-24 w-24 rounded-full border-4 border-white bg-slate-100 bg-cover bg-center shadow-md dark:border-slate-700 dark:bg-slate-800"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1501973801540-537f08ccae7b?auto=format&fit=crop&w=400&q=80')`,
              }}
            />
            <button className="absolute bottom-0 right-0 flex items-center justify-center rounded-full border-2 border-white bg-primary p-2 text-white shadow-lg transition-transform active:scale-95 dark:border-slate-800">
              <MdEdit className="text-[18px]" />
            </button>
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            Jane Doe
          </h2>
          <div className="mt-1 flex flex-col gap-0.5">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Member ID: 893-441-21
            </p>
            <p className="text-xs text-slate-500/80 dark:text-slate-500">
              Member since 2021
            </p>
          </div>
        </section>

        {/* Personal Details Group */}
        <section className="space-y-4 px-4">
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-slate-700 dark:bg-slate-800/50">
            <h3 className="px-5 pb-2 pt-5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Personal Details
            </h3>
            <MenuItem
              icon={MdPerson}
              title="Personal Information"
              subtitle="Name, DOB, Address"
              onClick={() => navigate({to: '/accounthub/personal-info'})}
            />
            <MenuItem
              icon={MdContactMail}
              title="Contact Info"
              subtitle="Email, Phone Numbers"
              onClick={() => navigate({to: '/accounthub/contact-info'})}
            />
          </div>
        </section>

        {/* Divider */}
        <div className="flex items-center px-4 py-8">
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></span>
          <span className="shrink-0 px-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Security Settings
          </span>
          <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></span>
        </div>

        {/* Security Settings Group */}
        <section className="space-y-4 px-4">
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-slate-700 dark:bg-slate-800/50">
            <MenuItem
              icon={MdLock}
              title="Change Password"
              onClick={() => navigate({to: '/accounthub/chnagepassword'})}
            />
            <MenuItem
              icon={MdDialpad}
              title="Change Transaction PIN"
              onClick={() => navigate({to: '/accounthub/enter-currentpin'})}
            />
            <MenuItem
              icon={MdFace}
              title="Biometric Login"
              hasToggle={true}
              toggleValue={true}
            />
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-4 px-4">
          <button className="group flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 font-bold text-primary shadow-sm transition-all hover:bg-orange-50 active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800">
            <MdLogout className="text-[20px] transition-transform group-hover:scale-110" />
            Log Out
          </button>
          <p className="text-center text-xs font-medium text-slate-400/50">
            Version 2.4.1
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountHub;
