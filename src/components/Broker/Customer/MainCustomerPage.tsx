import React, {useState} from 'react';
import { CustomerDetail } from './CustomerDetailes';
import { CustomerDashboard } from './CustomerDashboard';
import { Client } from './Customertypes';
import { useGetCustomer } from '@/lib/api/customer';

export default function MainCustomerPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { data: getallcustomer } = useGetCustomer();

  return (
    <div className="font-sans min-h-screen bg-[#FFFFFF] text-slate-900">
      <main className="w-full space-y-6 sm:space-y-8">
        {selectedClient ? (
          <CustomerDetail
            client={selectedClient}
            onBack={() => setSelectedClient(null)}
          />
        ) : (
          <CustomerDashboard
            onSelectClient={(client) => setSelectedClient(client)}
          />
        )}
      </main>
    </div>
  );
}
