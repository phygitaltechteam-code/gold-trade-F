import React, {useState} from 'react';
import {Bell, User as UserIcon, Search, Menu} from 'lucide-react';
import {ClientDashboard} from './ClientDashboard';
import {ClientDetail} from './ClientDetail';
import {Client} from './types';

export default function MainPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  return (
    <div className="font-sans min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Main Content Area - Full width with section padding */}
      <main className="w-full space-y-6 sm:space-y-8">
        {selectedClient ? (
          <ClientDetail
            client={selectedClient}
            onBack={() => setSelectedClient(null)}
          />
        ) : (
          <ClientDashboard
            onSelectClient={(client) => setSelectedClient(client)}
          />
        )}
      </main>

      {/* Footer / Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center justify-between gap-2 border-t border-slate-100 bg-white px-3 py-2 text-[10px] font-medium text-slate-400 sm:flex-row sm:gap-0 sm:px-6 sm:py-3 sm:text-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="xs:inline hidden">System</span> Online
          </div>
          <div className="xs:block hidden">Last Sync: Just now</div>
          <div className="xs:hidden block">Sync: Now</div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <a href="#" className="transition-colors hover:text-slate-600">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-slate-600">
            Terms
          </a>
          <span className="hidden sm:inline">© 2024 ClientPro v2.4.0</span>
          <span className="sm:hidden">v2.4.0</span>
        </div>
      </footer>
    </div>
  );
}
