import React, { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Profile from './Profile';
import PinSet from './PinSet';
import SetCommission from './SetCommission';
import ResetPassword from './ResetPassword';
import DisplayScripts from '../company/scripts';
import ChamkiTrading from './ChamkiTrading';
import CustomerHolding from './CustomerHolding';
import UpdateMargin from './UpdateMargin';

const ProfileTabs = () => {
  const { user } = useAuthContext();
  const [activeComponent, setActiveComponent] = useState('Profile');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Get tabs based on user role
  const getTabs = () => {
    const baseTabs = [{ id: 'Profile', label: 'Profile' }];

    if (user?.role === 'COMPANY') {
      return [
        ...baseTabs,
        { id: 'pin-set', label: 'Pin Set' },
        { id: 'commission', label: 'Set Commission' },
        { id: 'set-password', label: 'Reset Password' },
        { id: 'Script', label: 'Script Management' },
        { id: 'Chamki', label: 'Holding' },
        { id: 'customerholding', label: 'Minimum Stock Holding Time (In Minutes)' },
        { id: 'updatemargin', label: 'Update Margin' },
      ];
    }

    return baseTabs;
  };

  const tabs = getTabs();

  const handleTabClick = (tabId: string) => {
    setActiveComponent(tabId);
    // Scroll to center the selected tab on mobile
    const container = scrollContainerRef.current;
    if (container) {
      const tabElement = container.querySelector(`[data-tab-id="${tabId}"]`);
      if (tabElement) {
        const containerRect = container.getBoundingClientRect();
        const tabRect = tabElement.getBoundingClientRect();
        const scrollLeft = tabRect.left - containerRect.left + container.scrollLeft - containerRect.width / 2 + tabRect.width / 2;
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <div className="mt-2 border-b border-[#eee] px-5 dark:border-strokedark dark:bg-boxdark">
      <div className="dark:border-gray-700 relative border-b border-neutral-300 bg-white">
        {/* Scrollable Tabs Container */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide gap-1 sm:gap-2 md:gap-3 px-2 py-1"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              className={`flex-shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-center text-xs font-medium transition-all sm:px-4 sm:text-sm md:px-5 md:text-base ${activeComponent === tab.id
                  ? 'border-[#0284C7] text-[#0284C7] dark:border-[#0284C7] dark:text-[#0284C7]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white">
        {activeComponent === 'Profile' && <Profile />}
        {activeComponent === 'pin-set' && <PinSet />}
        {activeComponent === 'commission' && <SetCommission />}
        {activeComponent === 'set-password' && <ResetPassword />}
        {activeComponent === 'Script' && <DisplayScripts />}
        {activeComponent === 'Chamki' && <ChamkiTrading />}
         {activeComponent === 'customerholding' && <CustomerHolding />}
         
         {activeComponent === 'updatemargin' && <UpdateMargin/>}
      </div>
    </div>
  );
};

export default ProfileTabs;