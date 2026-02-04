import {useNavigate} from '@tanstack/react-router';
import React, {useState} from 'react';
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
import {useGetProfile} from './profilemutation';

const AccountHub: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    accountNumber: '',
  });

  const {data: profiledata, isLoading} = useGetProfile();

  React.useEffect(() => {
    if (profiledata) {
      setFormData({
        accountNumber: profiledata?.user?.accountNumber || '',
      });
    }
  }, [profiledata]);

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
      className={`group flex cursor-pointer items-center justify-between border-b p-4 border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-700/30 md:p-5 md:hover:bg-slate-100/50`}
    >
      <div className="flex items-center gap-4 md:gap-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-primary dark:bg-white/5 md:h-12 md:w-12">
          <Icon className="text-[22px] md:text-[24px]" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-sm font-semibold text-slate-900 dark:text-white md:text-base">
            {title}
          </span>
          {subtitle && (
            <span className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 md:text-sm">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {hasToggle ? (
        <div className="pointer-events-none relative inline-flex cursor-pointer items-center">
          <div
            className={`peer h-6 w-11 rounded-full transition-colors md:h-7 md:w-12 ${toggleValue ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-600'}`}
          >
            <div
              className={`border-gray-300 absolute left-[2px] top-[2px] h-5 w-5 rounded-full border bg-white transition-transform md:h-[22px] md:w-[22px] ${toggleValue ? 'translate-x-full border-white' : ''}`}
            ></div>
          </div>
        </div>
      ) : (
        <MdChevronRight className="text-gray-300 text-[20px] transition-colors group-hover:text-primary dark:text-slate-600 md:text-[22px]" />
      )}
    </div>
  );

  return (
    <div className="bg-background-light dark:bg-background-dark flex min-h-screen w-full items-center justify-center bg-white">
      {/* Main container with responsive width */}
      <div className="relative mx-auto w-full max-w-[min(390px,95vw,500px)] overflow-hidden bg-white dark:bg-[#0F1535] md:max-w-[600px]">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-[#0F1535]/95 md:px-6 md:py-4">
          <button
            onClick={() => navigate({to: '/dashboard'})}
            className="-ml-2 flex items-center justify-center rounded-full p-2 text-slate-900 transition-colors hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 md:p-2.5"
          >
            <MdArrowBackIosNew className="md:text-[20px]" />
          </button>
          <h1 className="flex-1 pr-8 text-center text-base font-bold tracking-tight text-slate-900 dark:text-white md:text-lg">
            Account Hub
          </h1>
        </header>

        <div className="no-scrollbar flex-1 overflow-y-auto pb-10">
          {/* Profile Section */}
          <section className="flex flex-col items-center justify-center px-4 py-8 text-center md:py-10">
            <div
              className="group relative cursor-pointer"
              onClick={() => navigate({to: '/accounthub/personal-info'})}
            >
              <div
                className="h-24 w-24 rounded-full border-4 border-white bg-slate-100 bg-cover bg-center shadow-md dark:border-slate-700 dark:bg-slate-800 md:h-28 md:w-28"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1501973801540-537f08ccae7b?auto=format&fit=crop&w=400&q=80')`,
                }}
              />
              <button className="absolute bottom-0 right-0 flex items-center justify-center rounded-full border-2 border-white bg-primary p-2 text-white shadow-lg transition-transform active:scale-95 dark:border-slate-800 md:p-2.5">
                <MdEdit className="text-[18px] md:text-[20px]" />
              </button>
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white md:text-2xl">
              {profiledata?.user?.fullname}
            </h2>
            <div className="mt-1 flex flex-col gap-0.5">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 md:text-base">
                {profiledata?.accountNumber || ''}
              </p>
            </div>
          </section>

          {/* Personal Details Group */}
          <section className="space-y-4 px-4 md:px-6">
            <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-slate-700 dark:bg-slate-800/50">
              <h3 className="px-5 pb-2 pt-5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 md:px-6 md:pt-6 md:text-sm">
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
          <div className="flex items-center px-4 py-8 md:px-6 md:py-10">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></span>
            <span className="shrink-0 px-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 md:text-sm">
              Security Settings
            </span>
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></span>
          </div>

          {/* Security Settings Group */}
          <section className="space-y-4 px-4 md:px-6">
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

          {/* Logout Button & Version */}
          <div className="mt-8 flex flex-col gap-4 px-4 pb-6 md:px-6 md:pb-8">
            <button className="group flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 font-bold text-primary shadow-sm transition-all hover:bg-orange-50 active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 md:py-4 md:text-base">
              <MdLogout className="text-[20px] transition-transform group-hover:scale-110 md:text-[22px]" />
              Log Out
            </button>
            <p className="text-center text-xs font-medium text-slate-400/50 md:text-sm">
              Version 2.4.1
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountHub;
