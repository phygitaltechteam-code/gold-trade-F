import React from 'react';
import {Plus} from 'lucide-react';
import {QUICK_CONTACTS} from '../constants';
import {useNavigate} from '@tanstack/react-router';

const QuickSend: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="px-5 py-2">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-gray-900 text-lg font-bold">Quick Send</h2>
        <button className="hover:text-primary-800 text-sm font-medium text-primary">
          View all
        </button>
      </div>

      <div className="no-scrollbar flex space-x-6 overflow-x-auto pb-2">
        {/* Add New Button */}
        <div className="flex min-w-[64px] flex-col items-center gap-2">
          <button
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-primary/20 bg-primary/5 text-primary transition-colors hover:bg-primary/10"
            onClick={() => navigate({to: '/addbeneficiary'})}
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
          <span className="text-gray-600 text-xs font-medium">Add New</span>
        </div>

        {/* Contacts */}
        {QUICK_CONTACTS.map((contact) => (
          <div
            key={contact.id}
            className="group relative flex min-w-[64px] cursor-pointer flex-col items-center gap-2"
          >
            <div
              className="relative"
              onClick={() => navigate({to: '/sendpayment'})}
            >
              {contact.avatarUrl ? (
                <img
                  src={contact.avatarUrl}
                  alt={contact.name}
                  className="h-16 w-16 rounded-full border-2 border-transparent object-cover transition-all group-hover:border-primary/10"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-transparent bg-blue-100 text-xl font-bold text-blue-600 group-hover:border-primary/10">
                  MK
                </div>
              )}
              {contact.isOnline && (
                <span className="absolute bottom-1 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500"></span>
              )}
            </div>
            <span className="text-gray-600 text-xs font-medium">
              {contact.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickSend;
