import React, { useEffect, useState } from 'react';
import { Database, Search, Eye, EyeOff } from 'lucide-react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import toast from 'react-hot-toast';
import { useGetMasterClients } from '@/lib/api/masterpanelapi/masterapi';
import { useCustomerHolding } from '@/lib/api/masterpanelapi/customerholding';

const CustomerHolding = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockLimits, setStockLimits] = useState<Record<string, string>>({});
  const [originalStockLimits, setOriginalStockLimits] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [applyToAllLimit, setApplyToAllLimit] = useState<string>('');

  // PIN Modal State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const { data: responseData, refetch, isLoading } = useGetMasterClients();
  const { mutate: saveCustomerHolding, isPending } = useCustomerHolding();

  // Extract clients array from response - handle different response structures
  const clients = React.useMemo(() => {
    if (!responseData) return [];
    // If responseData is already an array
    if (Array.isArray(responseData)) return responseData;
    // If responseData has a data property that is an array
    if (responseData.data && Array.isArray(responseData.data)) return responseData.data;
    // If responseData has a data property with a data property (nested)
    if (responseData.data?.data && Array.isArray(responseData.data.data)) return responseData.data.data;
    // If responseData has a customers property
    if (responseData.customers && Array.isArray(responseData.customers)) return responseData.customers;
    // If responseData has a users property
    if (responseData.users && Array.isArray(responseData.users)) return responseData.users;
    // If responseData has a clients property
    if (responseData.clients && Array.isArray(responseData.clients)) return responseData.clients;
    return [];
  }, [responseData]);

  // Initialize stock limits from client data
  useEffect(() => {
    if (clients && clients.length > 0) {
      const limits: Record<string, string> = {};
      clients.forEach((client: any) => {
        limits[client.id] = client.stockHoldingLimit?.toString() || '';
      });
      setStockLimits(limits);
      setOriginalStockLimits(limits);
    }
  }, [clients]);

  // Handle stock limit change for a customer
  const handleStockLimitChange = (customerId: string, value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) {
      toast.error('Please enter only numbers');
      return;
    }
    setStockLimits((prev) => ({
      ...prev,
      [customerId]: value,
    }));
  };

  // Apply limit to all customers
  const handleApplyToAll = () => {
    if (!applyToAllLimit) {
      toast.error('Please enter a limit value');
      return;
    }

    if (!/^\d+$/.test(applyToAllLimit)) {
      toast.error('Please enter only numbers');
      return;
    }

    const limitValue = applyToAllLimit;
    const updatedLimits: Record<string, string> = {};
    clients.forEach((client: any) => {
      updatedLimits[client.id] = limitValue;
    });
    setStockLimits(updatedLimits);
    toast.success(`Applied limit ${limitValue} to all customers`);
    setApplyToAllLimit('');
  };

  const closeModal = () => {
    setShowPinModal(false);
    setPin('');
    setShowPin(false);
  };

  // Save all stock limits at once - Show PIN popup first
  const handleSaveAllStockLimits = () => {
    if (!Array.isArray(clients) || clients.length === 0) {
      toast.error('No customers found');
      return;
    }

    const customers: { customerId: string; stockHoldingLimit: string }[] = [];
    clients.forEach((client: any) => {
      const currentLimit = stockLimits[client.id] || '';
      const originalLimit = originalStockLimits[client.id] || '';
      if (currentLimit !== originalLimit) {
        customers.push({
          customerId: client.id,
          stockHoldingLimit: currentLimit,
        });
      }
    });

    if (customers.length === 0) {
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

    setIsSaving(true);

    const customers: { customerId: string; stockHoldingLimit: string }[] = [];
    clients.forEach((client: any) => {
      const currentLimit = stockLimits[client.id] || '';
      const originalLimit = originalStockLimits[client.id] || '';
      if (currentLimit !== originalLimit) {
        customers.push({
          customerId: client.id,
          stockHoldingLimit: currentLimit,
        });
      }
    });

    if (customers.length === 0) {
      toast.info('No changes to save');
      setIsSaving(false);
      closeModal();
      return;
    }

    for (const customer of customers) {
      if (!/^\d+$/.test(customer.stockHoldingLimit)) {
        toast.error('Please ensure all limits are valid numbers');
        setIsSaving(false);
        return;
      }
    }

    saveCustomerHolding(
      {
        customers: customers,
        securityPin: pin,
      },
      {
        onSuccess: () => {
          toast.success(`${customers.length} customer(s) stock holding time updated successfully!`);
          setOriginalStockLimits({ ...stockLimits });
          refetch();
          closeModal();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Failed to update stock holding time');
        },
        onSettled: () => {
          setIsSaving(false);
        },
      }
    );
  };

  // Filter clients based on search
  const filteredClients = React.useMemo(() => {
    if (!Array.isArray(clients)) return [];
    const searchLower = searchTerm.toLowerCase();
    return clients.filter((client: any) => {
      return (
        client.user?.fullname?.toLowerCase().includes(searchLower) ||
        client.user?.phoneNumber?.includes(searchTerm) ||
        client.CRN?.toLowerCase().includes(searchLower)
      );
    });
  }, [clients, searchTerm]);

  // Check if any changes were made
  const hasChanges = React.useMemo(() => {
    if (!Array.isArray(clients)) return false;
    for (const client of clients) {
      const currentLimit = stockLimits[client.id] || '';
      const originalLimit = originalStockLimits[client.id] || '';
      if (currentLimit !== originalLimit) {
        return true;
      }
    }
    return false;
  }, [stockLimits, originalStockLimits, clients]);

  // Get total number of customers with changes
  const getChangedCount = React.useMemo(() => {
    if (!Array.isArray(clients)) return 0;
    let count = 0;
    for (const client of clients) {
      const currentLimit = stockLimits[client.id] || '';
      const originalLimit = originalStockLimits[client.id] || '';
      if (currentLimit !== originalLimit) {
        count++;
      }
    }
    return count;
  }, [stockLimits, originalStockLimits, clients]);

  // Customer Table Columns
  const customerColumns = [
    {
      header: 'Customer Name',
      accessor: 'user.fullname',
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm font-medium text-slate-900">
              {row.user?.fullname || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessor: 'user.phoneNumber',
      render: (row: any) => (
        <span className="text-sm text-gray-700">{row.user?.phoneNumber || 'N/A'}</span>
      ),
    },
    {
      header: 'Stock Holding Time (In Minutes)',
      accessor: 'stockHoldingLimit',
      render: (row: any) => {
        const currentLimit = stockLimits[row.id] || '';

        return (
          <div className="relative w-40">
            <input
              type="text"
              value={currentLimit}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                handleStockLimitChange(row.id, value);
              }}
              className="w-full rounded-lg border border-stroke px-3 py-1.5 pr-12 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="Enter Time"
              inputMode="numeric"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400 pointer-events-none">
              min
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="font-sans min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
      <main className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section className="overflow-hidden rounded-xl border border-stroke bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col justify-between gap-4 border-b border-stroke pb-4 sm:flex-row sm:items-center">
            <h2 className="text-lg font-semibold">Minimum Stock Holding Time (In Minutes)</h2>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Conditional: Show Apply to All OR Save Button */}
              {!hasChanges ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={applyToAllLimit}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        setApplyToAllLimit(value);
                      }
                    }}
                    className="w-40 rounded-lg border border-stroke px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Enter Time (In Minutes)"
                    pattern="[0-9]*"
                    inputMode="numeric"
                  />
                  <button
                    onClick={handleApplyToAll}
                    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                  >
                    Apply to All
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSaveAllStockLimits}
                  disabled={isSaving || isPending}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                    isSaving || isPending
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  <Database className="h-4 w-4" />
                  <span>{isSaving || isPending ? 'Saving...' : 'Save Changes'}</span>
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="text-center">
                <div className="mb-2 h-6 w-6 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                <p className="text-sm text-gray-500">Loading customers...</p>
              </div>
            </div>
          ) : (
            <>
              <GenericTable
                columns={customerColumns}
                data={filteredClients}
                rowsPerPage={10}
                clickable={false}
              />

              {hasChanges && (
                <div className="mt-4 flex items-center justify-end">
                  <span className="text-sm text-orange-500">
                    {getChangedCount} customer(s) have unsaved changes
                  </span>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Confirm Save Changes
            </h2>

            <p className="mb-4 text-sm text-slate-600">
              You are about to update {getChangedCount} customer(s) stock holding time.
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
                disabled={isSaving || isPending}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
              >
                {isSaving || isPending ? 'Saving...' : 'Confirm Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerHolding;