import React, {useState} from 'react';
import {ClientDashboard} from './ClientDashboard';
import {ClientDetail} from './ClientDetail';
import {Client} from './types';

export default function MainPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  return (
    <div className="font-sans min-h-screen bg-[#FFFFFF] text-slate-900">
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
    </div>
  );
}
