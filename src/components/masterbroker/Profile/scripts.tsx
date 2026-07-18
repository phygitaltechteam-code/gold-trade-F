import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import GenericTable from '@/components/Forms/Table/GenericTable';
import { Eye, EyeOff, Search } from 'lucide-react';
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
  const [changedScripts, setChangedScripts] = useState<Set<string | number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // PIN Modal State
  const [showPinModal, setShowPinModal] = useState(false);
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

  // Filter scripts based on search term
  const filteredScripts = useMemo(() => {
    if (!searchTerm.trim()) return finalScript;

    const query = searchTerm.toLowerCase().trim();
    return finalScript.filter((script) => {
      return (
        script.name?.toLowerCase().includes(query) ||
        script.symbol?.toLowerCase().includes(query) ||
        script.type?.toLowerCase().includes(query)
      );
    });
  }, [finalScript, searchTerm]);

  // Handle toggle - just update local state, no popup
  const handleToggle = (script: Script, e: React.MouseEvent) => {
    e.stopPropagation();

    // Toggle the script status locally
    setScripts((prev) =>
      prev.map((s) =>
        s.id === script.id ? { ...s, isOn: !s.isOn } : s,
      )
    );

    // Track changed scripts
    setChangedScripts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(script.id)) {
        newSet.delete(script.id);
      } else {
        newSet.add(script.id);
      }
      return newSet;
    });
  };

  const closeModal = () => {
    setShowPinModal(false);
    setPin('');
    setShowPin(false);
  };

  // Handle Save All - Show PIN popup
  const handleSaveAll = () => {
    if (changedScripts.size === 0) {
      toast.info('No changes to save');
      return;
    }
    setShowPinModal(true);
    setPin('');
    setShowPin(false);
  };

  const handleConfirmSave = async () => {
    if (!pin.trim()) {
      toast.error('Please enter PIN');
      return;
    }

    if (pin.trim().length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }

    // Get only the changed scripts with assetId and isOn status
    const scriptsToUpdate = scripts
      .filter((s) => changedScripts.has(s.id))
      .map((s) => ({
        assetId: s.id,
        isOn: s.isOn || false,
      }));
    const updateCount = scriptsToUpdate.length;

    if (updateCount === 0) {
      toast.info('No changes to save');
      closeModal();
      return;
    }

    try {
      await updateScriptStatus({
        assets: scriptsToUpdate,
        securityPin: pin
      });
      await refetch();
      setChangedScripts(new Set());
      closeModal();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to update scripts');
      await refetch();
    }
  };

  const handleRowClick = (script: Script) => {
    console.log('Row clicked:', script);
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (row: Script) => {
        const cleanName = row.name?.replace(/\d+[A-Z]{3}FUT$/, '') || row.name;
        return <span>{cleanName}</span>;
      }
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
      header: 'Status',
      accessor: 'isOn',
      render: (row: Script) => (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${row.isOn ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
          {row.isOn ? 'Active' : 'Inactive'}
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
            />
            <div className="relative h-5 w-9 rounded-full bg-slate-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-4" />
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
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-black text-2xl font-semibold">
              Scripts Management
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage your trading scripts and their status
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, symbol or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 sm:w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <span className="text-gray-400 hover:text-gray-600 text-sm">✕</span>
                </button>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveAll}
              // disabled={changedScripts.size === 0}
              className={`px-4 py-2 rounded-lg text-white font-medium transition-colors whitespace-nowrap bg-orange-500 hover:bg-orange-600`}
            >
              Save
            </button>
          </div>
        </div>

        <GenericTable
          columns={columns}
          data={filteredScripts}
          onRowClick={handleRowClick}
          clickable={true}
          rowsPerPage={10}
        />
      </div>

      {/* PIN Modal - Only on Save button click */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Confirm Save Changes
            </h2>

            <p className="mb-4 text-sm text-slate-600">
              You are about to update {changedScripts.size} script(s).
              Enter your security PIN to confirm.
            </p>

            <p className="mb-2 text-sm font-medium text-slate-700">
              Enter Security PIN:
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
                    handleConfirmSave();
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
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmSave}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors "
              >
                Confirm Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DisplayScripts;