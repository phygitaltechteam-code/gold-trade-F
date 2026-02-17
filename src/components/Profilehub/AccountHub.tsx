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

  const handleLogout = async () => {
    await localStorage.removeItem('token');
    await window.location.reload();
  };

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
      className={`group flex cursor-pointer items-center justify-between border-b border-slate-100 p-4 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-700/30 md:p-5 md:hover:bg-slate-100/50`}
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
    <div className="bg-gray-50 flex min-h-screen items-start justify-center pt-0">
      <div className="relative flex h-screen w-full flex-col overflow-hidden bg-white shadow-2xl md:rounded-3xl">
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

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {/* Personal Details Group - compact */}
            <section className="space-y-2 px-4 py-6 md:px-6">
              <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-slate-700 dark:bg-slate-800/50">
                <h3 className="px-5 pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 md:px-6 md:pt-5 md:text-sm">
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

            {/* Divider - compact */}
            <div className="flex items-center px-4 py-4 md:px-6 md:py-5">
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></span>
              <span className="shrink-0 px-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 md:text-sm">
                Security Settings
              </span>
              <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></span>
            </div>

            {/* Security Settings Group - compact */}
            <section className="space-y-2 px-4 md:px-6">
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
              </div>
            </section>

            {/* Logout Button & Version */}
            <div className="mt-6 flex flex-1 flex-col items-center overflow-hidden">
              <button
                onClick={handleLogout}
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 font-bold text-primary shadow-sm transition-all hover:bg-orange-50 active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-800 md:py-3.5 md:text-base"
              >
                <MdLogout className="text-[20px] transition-transform group-hover:scale-110 md:text-[22px]" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountHub;
