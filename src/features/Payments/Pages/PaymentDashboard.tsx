import React, {useState} from 'react';
import {ArrowLeft, ScanLine, Search} from 'lucide-react';
import QuickSend from '../Components/QuickSend';
import RecipientList from '../Components/RecipientList';

const PaymentDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-gray-50 flex min-h-screen items-start justify-center pt-0 md:pt-10">
      {/* Mobile Container Simulation */}
      <div className="relative flex min-h-screen w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl md:min-h-[850px] md:rounded-3xl">
        {/* Header */}
        <header className="z-10 flex items-center justify-between bg-white px-5 py-4">
          <button className="text-gray-800 hover:bg-gray-100 -ml-2 rounded-full p-2 transition-colors">
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-gray-900 text-xl font-extrabold">
            Select Recipient
          </h1>
          <button className="-mr-2 rounded-full p-2 text-primary transition-colors hover:bg-primary/10">
            <ScanLine size={24} strokeWidth={2.5} />
          </button>
        </header>

        {/* Search Bar */}
        <div className="bg-white px-5 py-2">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search name, phone, or account..."
              className="bg-gray-50 text-gray-900 placeholder-gray-400 block w-full rounded-2xl border-none py-3.5 pl-11 pr-4 text-sm font-medium shadow-inner transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Scrollable Content Area */}
        <main className="no-scrollbar flex-1 overflow-y-auto bg-white">
          <div className="pt-2">
            <QuickSend />
          </div>
          <div className="bg-gray-50 pt-2">
            <RecipientList searchQuery={searchQuery} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentDashboard;
