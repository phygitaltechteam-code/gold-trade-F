import React, {useState} from 'react';
import {useAuthContext} from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Profile from './Profile';
import PinSet from './PinSet';
import SetCommission from './SetCommission';
import ResetPassword from './ResetPassword';
import DisplayScripts from '../company/scripts';
import ChamkiTrading from './ChamkiTrading';

const ProfileTabs = () => {
  const {user} = useAuthContext();
  // console.log('userrrr', user);
  const [activeComponent, setActiveComponent] = useState('Profile');
  console.log('active tab', activeComponent);

  return (
    <div className="mt-2 border-b border-[#eee] px-5 dark:border-strokedark dark:bg-boxdark">
      <div className="dark:border-gray-700 flex gap-3 border-b border-neutral-300 bg-white">
        <button
          className={`border-b-2 px-2 py-4 text-center text-sm font-medium sm:text-base ${
            activeComponent === 'Profile'
              ? 'border-[#0284C7] text-[#0284C7] dark:border-[#0284C7] dark:text-[#0284C7]'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-transparent'
          }`}
          onClick={() => setActiveComponent('Profile')}
        >
          Profile
        </button>

        {user?.role == 'COMPANY' && (
          <>
            {' '}
            <button
              className={`border-b-2 px-2 py-4 text-center text-sm font-medium sm:text-base ${
                activeComponent === 'pin-set'
                  ? 'border-[#0284C7] text-[#0284C7] dark:border-[#0284C7] dark:text-[#0284C7]'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-transparent'
              }`}
              onClick={() => setActiveComponent('pin-set')}
            >
              Pin Set
            </button>
            <button
              className={`border-b-2 px-2 py-4 text-center text-sm font-medium sm:text-base ${
                activeComponent === 'commission'
                  ? 'border-[#0284C7] text-[#0284C7] dark:border-[#0284C7] dark:text-[#0284C7]'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-transparent'
              }`}
              onClick={() => setActiveComponent('commission')}
            >
              Set Commission
            </button>
            <button
              className={`border-b-2 px-2 py-4 text-center text-sm font-medium sm:text-base ${
                activeComponent === 'set-password'
                  ? 'border-[#0284C7] text-[#0284C7] dark:border-[#0284C7] dark:text-[#0284C7]'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-transparent'
              }`}
              onClick={() => setActiveComponent('set-password')}
            >
              Reset Password
            </button>
            <button
              className={`border-b-2 px-2 py-4 text-center text-sm font-medium sm:text-base ${
                activeComponent === 'Script'
                  ? 'border-[#0284C7] text-[#0284C7] dark:border-[#0284C7] dark:text-[#0284C7]'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-transparent'
              }`}
              onClick={() => setActiveComponent('Script')}
            >
              Script Management
            </button>
            <button
              className={`border-b-2 px-2 py-4 text-center text-sm font-medium sm:text-base ${
                activeComponent === 'Chamki'
                  ? 'border-[#0284C7] text-[#0284C7] dark:border-[#0284C7] dark:text-[#0284C7]'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 border-transparent'
              }`}
              onClick={() => setActiveComponent('Chamki')}
            >
              Holding
            </button>
          </>
        )}
      </div>

      <div className="bg-white">
        {activeComponent === 'Profile' && <Profile />}
        {activeComponent === 'pin-set' && <PinSet />}
        {activeComponent === 'commission' && <SetCommission />}
        {activeComponent === 'set-password' && <ResetPassword />}
        {activeComponent === 'Script' && <DisplayScripts />}
        {activeComponent === 'Chamki' && <ChamkiTrading />}
      </div>
    </div>
  );
};

export default ProfileTabs;
