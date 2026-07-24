import React, {useState} from 'react';
import DisplayBroker from '@/components/company/DisplayBoker';
import {createFileRoute, useNavigate} from '@tanstack/react-router';
import {Plus} from 'lucide-react';

export const Route = createFileRoute('/_app/superbroker/brokerlist')({
  component: RouteComponent,
});

function RouteComponent() {
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-[#f8fafc] p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between p-4">
        <div>
          <h1 className="text-2xl font-bold text-black">Broker List</h1>
          <p className="text-sm text-slate-500">
            Supervise and manage brokers under your direct network
          </p>
        </div>
        <button
          onClick={() => navigate({to: '/superbroker/addbroker'})}
          className="flex items-center gap-2 rounded bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] hover:from-orange-600 hover:to-red-600"
        >
          <Plus className="h-4 w-4" /> Add Broker
        </button>
      </div>
      <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <DisplayBroker refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
