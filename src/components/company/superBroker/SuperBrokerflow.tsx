import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import DisplaySuperBroker from './DisplaySuperBoker';

const SuperBrokerflow = () => {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const handleBrokerAdded = () => {
    setRefreshTrigger((prev) => !prev);
  };

  return (
    <div className="h-screen w-full">
      <div className="mb-4 flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold text-gray-800">Super Broker Management</h1>
        <button
          onClick={() => navigate({ to: '/companybroker/addSuperBrocker' })}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-white transition-all hover:from-orange-600 hover:to-red-600"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Super Broker
        </button>
      </div>

      <DisplaySuperBroker refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default SuperBrokerflow;