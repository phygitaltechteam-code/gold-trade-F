// import React, {useEffect, useState} from 'react';
// import toast from 'react-hot-toast';
// import {useGetScriptsData} from '@/lib/api/addbroker';
// import GenericTable from '@/components/Forms/Table/GenericTable';
// import {Eye, EyeOff} from 'lucide-react';

// type Script = {
//   id: number | string;
//   symbol: string;
//   name: string;
//   type: string;
//   lastPrice: string;
//   expiry: string;
//   instrumentsToken: number;
//   isActive?: boolean;
// };

// const STORAGE_KEY = 'script_statuses';

// export const DisplayScripts: React.FC = () => {
//   const {data:scrpiData, isLoading, isPending, isSuccess} = useGetScriptsData();
//   const [scripts, setScripts] = useState<Script[]>([]);
//   const [togglingId, setTogglingId] = useState<number | string | null>(null);
//   console.log("dataaaaaaaaaaaaaaa",scrpiData)

//   console.log("scriptsssss",scripts)
//   // PIN Modal State
//   const [showPinModal, setShowPinModal] = useState(false);
//   const [selectedScript, setSelectedScript] = useState<Script | null>(null);
//   const [pin, setPin] = useState('');
//   const [showPin, setShowPin] = useState(false);

//   // Load stored statuses from localStorage
//   const loadStoredStatuses = () => {
//     const stored = localStorage.getItem(STORAGE_KEY);
//     if (stored) {
//       try {
//         return JSON.parse(stored);
//       } catch {
//         return {};
//       }
//     }
//     return {};
//   };

//   const storeStatuses = (statuses: Record<string, boolean>) => {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
//   };

//   useEffect(() => {
//     if (Array.isArray(scrpiData)) {
//       const storedStatuses = loadStoredStatuses();
//       const formattedData = scrpiData?.data?.map((item: Script) => ({
//         ...item,
//         isActive:
//           storedStatuses[item.id] !== undefined
//             ? storedStatuses[item.id]
//             : false,
//       }));
//       setScripts(formattedData);
//     }
//   }, [scrpiData, isLoading, isPending, isSuccess]);

//   const handleToggle = (script: Script, e: React.MouseEvent) => {
//     e.stopPropagation();
//     setSelectedScript(script);
//     setShowPinModal(true);
//     setPin('');
//     setShowPin(false);
//   };

//   const handleConfirmStatusChange = async () => {
//     if (!pin) {
//       toast.error('Please enter PIN');
//       return;
//     }

//     if (pin.length < 4) {
//       toast.error('PIN must be at least 4 digits');
//       return;
//     }

//     setTogglingId(selectedScript?.id || null);
//     const newStatus = !selectedScript?.isActive;

//     try {
//       // Update localStorage immediately
//       const storedStatuses = loadStoredStatuses();
//       storedStatuses[selectedScript!.id] = newStatus;
//       storeStatuses(storedStatuses);

//       // Update local state
//       setScripts((prev) =>
//         prev.map((s) =>
//           s.id === selectedScript?.id ? {...s, isActive: newStatus} : s,
//         ),
//       );

//       // Simulate API call (replace with actual API)
//       await new Promise((resolve) => setTimeout(resolve, 500));

//       toast.success(
//         `Script ${newStatus ? 'enabled' : 'disabled'} successfully!`,
//       );

//       setShowPinModal(false);
//       setPin('');
//       setSelectedScript(null);
//     } catch (err) {
//       console.error(err);
//       // Revert on error
//       const storedStatuses = loadStoredStatuses();
//       storedStatuses[selectedScript!.id] = !newStatus;
//       storeStatuses(storedStatuses);

//       setScripts((prev) =>
//         prev.map((s) =>
//           s.id === selectedScript?.id ? {...s, isActive: !newStatus} : s,
//         ),
//       );
//       toast.error('Failed to toggle script');
//     } finally {
//       setTogglingId(null);
//     }
//   };

//   const handleRowClick = (script: Script) => {
//     console.log('Row clicked:', script);
//     // Navigate to script details if needed
//   };

//   const columns = [
//     {
//       header: 'Name',
//       accessor: 'name',
//     },
//     {
//       header: 'Symbol',
//       accessor: 'symbol',
//     },
//     {
//       header: 'Type',
//       accessor: 'type',
//     },
//     {
//       header: 'Price',
//       accessor: 'lastPrice',
//       render: (row: Script) => (
//         <span>₹{Number(row.lastPrice || 0).toLocaleString('en-IN')}</span>
//       ),
//     },
//     {
//       header: 'Expiry',
//       accessor: 'expiry',
//       render: (row: Script) => (
//         <span>
//           {row.expiry ? new Date(row.expiry).toLocaleDateString('en-IN') : '-'}
//         </span>
//       ),
//     },

//     {
//       header: 'Action',
//       accessor: 'id',
//       render: (row: Script) => (
//         <div
//           className="flex items-center gap-2"
//           onClick={(e) => e.stopPropagation()}
//         >
//           <label className="relative inline-flex cursor-pointer items-center">
//             <input
//               type="checkbox"
//               className="peer sr-only"
//               checked={row.isActive || false}
//               onChange={(e) => handleToggle(row, e)}
//               disabled={togglingId === row.id}
//             />
//             <div className="relative h-5 w-9 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-4 peer-disabled:opacity-50" />
//           </label>
//         </div>
//       ),
//     },
//   ];

//   if (isLoading) {
//     return (
//       <div className="flex h-64 items-center justify-center">
//         <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
//       </div>
//     );
//   }

//   if (!isSuccess) {
//     return (
//       <div className="p-6 text-center text-red-600">Failed to load scripts</div>
//     );
//   }

//   const selectedScriptDetails = scripts.find(
//     (s) => s.id === selectedScript?.id,
//   );

//   return (
//     <>
//       <div className="p-4 sm:p-6 lg:p-8">
//         <div className="mb-6">
//           <h1 className="text-gray-900 text-2xl font-semibold">
//             Scripts Management
//           </h1>
//           <p className="text-gray-500 mt-1 text-sm">
//             Manage your trading scripts and their status
//           </p>
//         </div>

//         <GenericTable
//           columns={columns}
//           data={scripts}
//           onRowClick={handleRowClick}
//           clickable={true}
//           rowsPerPage={10}
//         />
//       </div>

//       {/* PIN Modal */}
//       {showPinModal && selectedScriptDetails && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
//           <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
//             <h2 className="mb-4 text-lg font-semibold text-slate-900">
//               {selectedScriptDetails?.isActive ? 'Disable' : 'Enable'} Script
//             </h2>
//             <p className="mb-4 text-sm text-slate-600">
//               {selectedScriptDetails?.isActive
//                 ? `Are you sure you want to disable ${selectedScriptDetails?.name || selectedScriptDetails?.symbol}?`
//                 : `Are you sure you want to enable ${selectedScriptDetails?.name || selectedScriptDetails?.symbol}?`}
//             </p>
//             <p className="mb-2 text-sm font-medium text-slate-700">
//               Enter Security PIN to confirm:
//             </p>

//             <div className="relative">
//               <input
//                 type={showPin ? 'text' : 'password'}
//                 placeholder="Enter Security PIN"
//                 value={pin}
//                 onChange={(e) => setPin(e.target.value)}
//                 className="border-gray-300 w-full rounded-lg border px-4 py-2 pr-10 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
//                 autoFocus
//                 onKeyPress={(e) => {
//                   if (e.key === 'Enter') {
//                     handleConfirmStatusChange();
//                   }
//                 }}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPin(!showPin)}
//                 className="text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 -translate-y-1/2"
//               >
//                 {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
//               </button>
//             </div>

//             <div className="mt-5 flex justify-end gap-3">
//               <button
//                 onClick={() => {
//                   setShowPinModal(false);
//                   setPin('');
//                   setSelectedScript(null);
//                 }}
//                 className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConfirmStatusChange}
//                 disabled={togglingId !== null}
//                 className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
//                   selectedScriptDetails?.isActive
//                     ? 'bg-red-500 hover:bg-red-600'
//                     : 'bg-emerald-500 hover:bg-emerald-600'
//                 } disabled:opacity-50`}
//               >
//                 {togglingId !== null ? 'Processing...' : 'Confirm'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default DisplayScripts;

import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import GenericTable from '@/components/Forms/Table/GenericTable';
import { Eye, EyeOff } from 'lucide-react';
import {
  useGetScript,
  useUpdateScriptStatus,
} from '@/lib/api/masterpanelapi/profile';

type Script = {
  id: number | string;
  symbol: string;
  name: string;
  type: string;
  lastPrice: string;
  expiry: string;
  instrumentsToken: number;
  isOn?: boolean;
  globalIsOn?: boolean;
};

export const DisplayScripts: React.FC = () => {
  const {
    data: scrpiData,
    isLoading,
    isSuccess,
    refetch,
  } = useGetScript();

  const { mutateAsync: updateScriptStatus } = useUpdateScriptStatus();

  const [scripts, setScripts] = useState<Script[]>([]);
  const [togglingId, setTogglingId] = useState<number | string | null>(null);

  // PIN Modal State
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  // Set scripts from backend
  useEffect(() => {
    if (Array.isArray(scrpiData?.data)) {
      setScripts(scrpiData.data);
    }
  }, [scrpiData]);

  // Filter scripts based on expiry
  const finalScript = useMemo(() => {
    return scripts.filter((script) => {
      if (!script.expiry) return false;

      const expiry = new Date(script.expiry);
      const today = new Date();

      expiry.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      return expiry >= today;
    });
  }, [scripts]);

  const handleToggle = (script: Script, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedScript(script);
    setShowPinModal(true);
    setPin('');
    setShowPin(false);
  };

  const closeModal = () => {
    setShowPinModal(false);
    setPin('');
    setShowPin(false);
    setSelectedScript(null);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedScript) return;

    if (!pin.trim()) {
      toast.error('Please enter PIN');
      return;
    }

    if (pin.trim().length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }

    const scriptId = selectedScript.id;
    const oldStatus = !!selectedScript.isOn;
    const newStatus = !oldStatus;

    setTogglingId(scriptId);

    try {
      // Optimistic update
      setScripts((prev) =>
        prev.map((s) =>
          s.id === scriptId ? { ...s, isOn: newStatus } : s,
        ),
      );

      // API call
      await updateScriptStatus(scriptId);

      // Sync with backend response
      await refetch();

      toast.success(
        `Script ${newStatus ? 'enabled' : 'disabled'} successfully!`,
      );

      closeModal();
    } catch (error) {
      console.error('Toggle error:', error);

      // Rollback if API fails
      setScripts((prev) =>
        prev.map((s) =>
          s.id === scriptId ? { ...s, isOn: oldStatus } : s,
        ),
      );

      toast.error('Failed to toggle script');
    } finally {
      setTogglingId(null);
    }
  };

  const handleRowClick = (script: Script) => {
    console.log('Row clicked:', script);
    // Navigate to script details if needed
  };

  // Always derive selected script from latest scripts state
  const selectedScriptDetails = selectedScript
    ? scripts.find((s) => s.id === selectedScript.id)
    : null;

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Symbol',
      accessor: 'symbol',
    },
    {
      header: 'Type',
      accessor: 'type',
    },
    {
      header: 'Expiry',
      accessor: 'expiry',
      render: (row: Script) => (
        <span>
          {row.expiry
            ? new Date(row.expiry).toLocaleDateString('en-IN')
            : '-'}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (row: Script) => (
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={!!row.isOn}
              onChange={(e) => handleToggle(row, e)}
              disabled={togglingId === row.id}
            />
            <div className="relative h-5 w-9 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-4 peer-disabled:opacity-50" />
          </label>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isSuccess) {
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load scripts
      </div>
    );
  }

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-gray-900 text-2xl font-semibold">
            Scripts Management
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage your trading scripts and their status
          </p>
        </div>

        <GenericTable
          columns={columns}
          data={finalScript}
          onRowClick={handleRowClick}
          clickable={true}
          rowsPerPage={10}
        />
      </div>

      {/* PIN Modal */}
      {showPinModal && selectedScriptDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              {selectedScriptDetails.isOn ? 'Disable' : 'Enable'} Script
            </h2>

            <p className="mb-4 text-sm text-slate-600">
              {selectedScriptDetails.isOn
                ? `Are you sure you want to disable ${
                    selectedScriptDetails.name ||
                    selectedScriptDetails.symbol
                  }?`
                : `Are you sure you want to enable ${
                    selectedScriptDetails.name ||
                    selectedScriptDetails.symbol
                  }?`}
            </p>

            <p className="mb-2 text-sm font-medium text-slate-700">
              Enter Security PIN to confirm:
            </p>

            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                placeholder="Enter Security PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="border-gray-300 w-full rounded-lg border px-4 py-2 pr-10 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmStatusChange();
                  }
                }}
              />

              <button
                type="button"
                onClick={() => setShowPin((prev) => !prev)}
                className="text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                disabled={togglingId !== null}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmStatusChange}
                disabled={togglingId !== null}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                  selectedScriptDetails.isOn
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                } disabled:opacity-50`}
              >
                {togglingId !== null ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DisplayScripts;