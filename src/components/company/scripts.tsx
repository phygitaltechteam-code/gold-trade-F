import React, {useEffect, useState} from 'react';
import toast from 'react-hot-toast';
import {useGetScriptsData, useUpdateScriptStatus} from '@/lib/api/addbroker';
import GenericTable from '@/components/Forms/Table/GenericTable';
import {Database, Eye, EyeOff} from 'lucide-react';

type Script = {
  id: number | string;
  symbol: string;
  name: string;
  type: string;
  lastPrice: string;
  expiry: string;
  instrumentsToken: number;
  isActive?: boolean;
  IsOn?: boolean;
};

const STORAGE_KEY = 'script_statuses';

export const DisplayScripts: React.FC = () => {
  const {
    data: scrpiData,
    isLoading,
    isPending,
    isSuccess,
    refetch,
  } = useGetScriptsData();
  const {mutateAsync: updateScriptStatus} = useUpdateScriptStatus();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [originalScripts, setOriginalScripts] = useState<Script[]>([]);
  const [togglingId, setTogglingId] = useState<number | string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Save PIN Modal State
  const [showSavePinModal, setShowSavePinModal] = useState(false);
  const [savePin, setSavePin] = useState('');
  const [showSavePin, setShowSavePin] = useState(false);

  // Load stored statuses from localStorage
  const loadStoredStatuses = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }
    return {};
  };

  const storeStatuses = (statuses: Record<string, boolean>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
  };

  useEffect(() => {
    if (Array.isArray(scrpiData?.data)) {
      const storedStatuses = loadStoredStatuses();
      const formattedData = scrpiData?.data?.map((item: Script) => ({
        ...item,
        isActive: item.IsOn !== undefined ? item.IsOn : false,
      }));
      setScripts(formattedData);
      setOriginalScripts(JSON.parse(JSON.stringify(formattedData)));
    }
  }, [scrpiData, isLoading, isPending, isSuccess]);

  // Filter based on expiry
  const finalScript = scripts.filter((script) => {
    if (!script.expiry) return true;
    const expiry = new Date(script.expiry);
    const today = new Date();
    expiry.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return expiry >= today;
  });

  // Get changed scripts
  const getChangedScripts = () => {
    const changed: Script[] = [];
    scripts.forEach((script) => {
      const original = originalScripts.find((s) => s.id === script.id);
      if (original && script.isActive !== original.isActive) {
        changed.push({
          ...script,
          IsOn: script.isActive,
        });
      }
    });
    return changed;
  };

  // Direct toggle without PIN modal
  const handleToggle = (script: Script, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Toggle the status directly
    setScripts((prev) =>
      prev.map((s) =>
        s.id === script.id ? {...s, isActive: !s.isActive} : s,
      ),
    );
  };

  // Handle Save button click - show PIN modal
  const handleSaveClick = () => {
    const changedScripts = getChangedScripts();
    if (changedScripts.length === 0) {
      toast.info('No changes to save');
      return;
    }
    setShowSavePinModal(true);
    setSavePin('');
    setShowSavePin(false);
  };

  // Confirm save with PIN
  const handleConfirmSave = async () => {
    if (!savePin) {
      toast.error('Please enter PIN');
      return;
    }

    if (savePin.length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }

    const changedScripts = getChangedScripts();
    
    if (changedScripts.length === 0) {
      toast.info('No changes to save');
      setShowSavePinModal(false);
      return;
    }

    setIsSaving(true);
    
    try {
      const loadingToast = toast.loading(`Saving ${changedScripts.length} script(s)...`);
      
      // Prepare data for API - send all assets in one call
      const assetsData = changedScripts.map((script) => ({
        assetId: script.id,
        IsOn: script.isActive
      }));

      // Single API call with all assets
      await updateScriptStatus({ assets: assetsData });

      // Update localStorage
      const storedStatuses = loadStoredStatuses();
      changedScripts.forEach((script) => {
        storedStatuses[script.id] = script.isActive || false;
      });
      storeStatuses(storedStatuses);

      // Update original scripts reference
      setOriginalScripts(JSON.parse(JSON.stringify(scripts)));

      toast.dismiss(loadingToast);
      toast.success(`Successfully updated ${changedScripts.length} script(s)`);
      
      // Refetch data to get latest from server
      await refetch();
      
      setShowSavePinModal(false);
      setSavePin('');
      
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Failed to save changes. Please try again.');
      
      // Revert to original state on error
      setScripts(JSON.parse(JSON.stringify(originalScripts)));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRowClick = (script: Script) => {
    console.log('Row clicked:', script);
  };

  // Check if there are any changes
  const hasChanges = () => {
    return getChangedScripts().length > 0;
  };

  const columns = [
    {
      header: 'Sr. No',
      accessor: 'id',
      render: (row: Script, index: number) => (
        <span>{index + 1}</span>
      ),
    },
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
          {row.expiry ? new Date(row.expiry).toLocaleDateString('en-IN') : '-'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row: Script) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
          row.isActive 
            ? 'bg-emerald-50 text-emerald-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${
            row.isActive ? 'bg-emerald-500' : 'bg-red-500'
          }`}></span>
          {row.isActive ? 'Active' : 'Inactive'}
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
              checked={row.isActive || false}
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
      <div className="p-6 text-center text-red-600">Failed to load scripts</div>
    );
  }

  const changedScripts = getChangedScripts();

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-gray-900 text-2xl font-semibold">
              Scripts Management
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Manage your trading scripts and their status.
            </p>
            {hasChanges() && (
              <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                {changedScripts.length} script(s) have unsaved changes
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              type="button"
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
            >
              <span>Refresh</span>
            </button>
            
            <button
              onClick={handleSaveClick}
              type="button"
              disabled={isSaving || !hasChanges()}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors ${
                hasChanges() && !isSaving
                  ? 'bg-[#F27D26] hover:bg-[#E06D1F]'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  <span>Save {hasChanges() ? `(${changedScripts.length})` : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <GenericTable
          columns={columns}
          data={finalScript}
          onRowClick={handleRowClick}
          clickable={true}
          rowsPerPage={10}
        />
      </div>

      {/* Save PIN Modal */}
      {showSavePinModal && changedScripts.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Confirm Save Changes
            </h2>
            <p className="mb-4 text-sm text-slate-600">
              You are about to save {changedScripts.length} script change(s).
            </p>
            
            <div className="mb-4 max-h-32 overflow-y-auto rounded-md bg-gray-50 p-3">
              <p className="mb-2 text-xs font-medium text-gray-700">Changes to be saved:</p>
              <ul className="space-y-1 text-xs text-gray-600">
                {changedScripts.map((script) => (
                  <li key={script.id} className="flex items-center justify-between">
                    <span className="truncate">{script.name} ({script.symbol})</span>
                    <span className={`ml-2 font-medium ${script.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                      {script.isActive ? 'Enable' : 'Disable'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <p className="mb-2 text-sm font-medium text-slate-700">
              Enter Security PIN to confirm:
            </p>

            <div className="relative">
              <input
                type={showSavePin ? 'text' : 'password'}
                placeholder="Enter Security PIN"
                value={savePin}
                onChange={(e) => setSavePin(e.target.value)}
                className="border-gray-300 w-full rounded-lg border px-4 py-2 pr-10 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmSave();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowSavePin(!showSavePin)}
                className="text-gray-500 hover:text-gray-700 absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showSavePin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSavePinModal(false);
                  setSavePin('');
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={isSaving}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                  isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#F27D26] hover:bg-[#E06D1F]'
                }`}
              >
                {isSaving ? 'Saving...' : 'Confirm Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DisplayScripts;