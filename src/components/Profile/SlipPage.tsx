import React, { useEffect, useState } from 'react';
import {
  Database,
  Search,
  Eye,
  EyeOff,
} from 'lucide-react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import toast from 'react-hot-toast';
import { useGetClients } from '@/lib/react-query/client';
import { useUpdateSlippage } from '@/lib/api/customerholding';

const Slippage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sellSlippages, setSellSlippages] = useState<Record<string, string>>({});
  const [buySlippages, setBuySlippages] = useState<Record<string, string>>({});
  const [originalSellSlippages, setOriginalSellSlippages] = useState<Record<string, string>>({});
  const [originalBuySlippages, setOriginalBuySlippages] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Apply to All states
  const [applyToAllSell, setApplyToAllSell] = useState<string>('');
  const [applyToAllBuy, setApplyToAllBuy] = useState<string>('');

  // PIN Modal State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const { data: responseData, refetch, isLoading } = useGetClients();
  const { mutate: updateSlippage, isPending } = useUpdateSlippage();

  // Extract clients array from response
  const clients = React.useMemo(() => {
    if (!responseData) return [];
    if (Array.isArray(responseData)) return responseData;
    if (responseData.data && Array.isArray(responseData.data)) return responseData.data;
    if (responseData.data?.data && Array.isArray(responseData.data.data)) return responseData.data.data;
    if (responseData.customers && Array.isArray(responseData.customers)) return responseData.customers;
    if (responseData.users && Array.isArray(responseData.users)) return responseData.users;
    return [];
  }, [responseData]);

  useEffect(() => {
    if (clients && clients.length > 0) {
      const sell: Record<string, string> = {};
      const buy: Record<string, string> = {};

      clients.forEach((client: any) => {
        // Use the correct field names from API: sellSlipagePercent and buySlipagePercent
        sell[client.id] = client.sellSlipagePercent?.toString() || '';
        buy[client.id] = client.buySlipagePercent?.toString() || '';
      });

      setSellSlippages(sell);
      setBuySlippages(buy);
      setOriginalSellSlippages(sell);
      setOriginalBuySlippages(buy);
    }
  }, [clients]);

  // Handle sell slippage change
  const handleSellSlippageChange = (customerId: string, value: string) => {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
      toast.error('Please enter a valid number');
      return;
    }
    setSellSlippages((prev) => ({
      ...prev,
      [customerId]: value,
    }));
  };

  // Handle buy slippage change
  const handleBuySlippageChange = (customerId: string, value: string) => {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
      toast.error('Please enter a valid number');
      return;
    }
    setBuySlippages((prev) => ({
      ...prev,
      [customerId]: value,
    }));
  };

  // Apply both Sell and Buy slippages to all customers
  const handleApplyToAll = () => {
    if (!applyToAllSell && !applyToAllBuy) {
      toast.error('Please enter at least one slippage value');
      return;
    }

    if (applyToAllSell && !/^\d*\.?\d*$/.test(applyToAllSell)) {
      toast.error('Please enter a valid sell slippage number');
      return;
    }

    if (applyToAllBuy && !/^\d*\.?\d*$/.test(applyToAllBuy)) {
      toast.error('Please enter a valid buy slippage number');
      return;
    }

    const updatedSell: Record<string, string> = {};
    const updatedBuy: Record<string, string> = {};

    clients.forEach((client: any) => {
      if (applyToAllSell) {
        updatedSell[client.id] = applyToAllSell;
      }
      if (applyToAllBuy) {
        updatedBuy[client.id] = applyToAllBuy;
      }
    });

    if (applyToAllSell) {
      setSellSlippages((prev) => ({ ...prev, ...updatedSell }));
    }

    if (applyToAllBuy) {
      setBuySlippages((prev) => ({ ...prev, ...updatedBuy }));
    }

    let message = 'Applied ';
    if (applyToAllSell && applyToAllBuy) {
      message += `sell slippage ${applyToAllSell}% and buy slippage ${applyToAllBuy}% to all customers`;
    } else if (applyToAllSell) {
      message += `sell slippage ${applyToAllSell}% to all customers`;
    } else if (applyToAllBuy) {
      message += `buy slippage ${applyToAllBuy}% to all customers`;
    }
    toast.success(message);

    setApplyToAllSell('');
    setApplyToAllBuy('');
  };

  const closeModal = () => {
    setShowPinModal(false);
    setPin('');
    setShowPin(false);
  };

  // Save all slippages at once - Show PIN popup first
  const handleSaveAllSlippages = () => {
    if (!Array.isArray(clients) || clients.length === 0) {
      toast.error('No customers found');
      return;
    }

    const customers: {
      customerId: string;
      sellSlipagePercent: string;
      buySlipagePercent: string;
    }[] = [];

    clients.forEach((client: any) => {
      const currentSell = sellSlippages[client.id] || '';
      const originalSell = originalSellSlippages[client.id] || '';
      const currentBuy = buySlippages[client.id] || '';
      const originalBuy = originalBuySlippages[client.id] || '';

      if (
        currentSell !== originalSell ||
        currentBuy !== originalBuy
      ) {
        customers.push({
          customerId: client.id,
          sellSlipagePercent: currentSell || '0',
          buySlipagePercent: currentBuy || '0',
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
    if (!pin) {
      toast.error('Please enter your security PIN');
      return;
    }

    if (pin.length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }

    const customers: {
      customerId: string;
      sellSlipagePercent: string;
      buySlipagePercent: string;
    }[] = [];

    clients.forEach((client: any) => {
      const currentSell = sellSlippages[client.id] || '0';
      const originalSell = originalSellSlippages[client.id] || '0';
      const currentBuy = buySlippages[client.id] || '0';
      const originalBuy = originalBuySlippages[client.id] || '0';

      if (
        currentSell !== originalSell ||
        currentBuy !== originalBuy
      ) {
        customers.push({
          customerId: client.id,
          sellSlipagePercent: currentSell,
          buySlipagePercent: currentBuy,
        });
      }
    });

    if (customers.length === 0) {
      toast.info('No changes to save');
      closeModal();
      return;
    }

    updateSlippage(
      {
        customers: customers,
        securityPin: pin,
      },
      {
        onSuccess: () => {
          toast.success(
            `Successfully updated slippage for ${customers.length} customer(s)`,
          );
          setOriginalSellSlippages({ ...sellSlippages });
          setOriginalBuySlippages({ ...buySlippages });
          closeModal();
          refetch();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || 'Failed to update slippage',
          );
          closeModal();
        },
      },
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
      const currentSell = sellSlippages[client.id] || '';
      const originalSell = originalSellSlippages[client.id] || '';
      const currentBuy = buySlippages[client.id] || '';
      const originalBuy = originalBuySlippages[client.id] || '';

      if (
        currentSell !== originalSell ||
        currentBuy !== originalBuy
      ) {
        return true;
      }
    }
    return false;
  }, [
    sellSlippages,
    buySlippages,
    originalSellSlippages,
    originalBuySlippages,
    clients,
  ]);

  // Get total number of customers with changes
  const getChangedCount = React.useMemo(() => {
    if (!Array.isArray(clients)) return 0;
    let count = 0;
    for (const client of clients) {
      const currentSell = sellSlippages[client.id] || '';
      const originalSell = originalSellSlippages[client.id] || '';
      const currentBuy = buySlippages[client.id] || '';
      const originalBuy = originalBuySlippages[client.id] || '';

      if (
        currentSell !== originalSell ||
        currentBuy !== originalBuy
      ) {
        count++;
      }
    }
    return count;
  }, [
    sellSlippages,
    buySlippages,
    originalSellSlippages,
    originalBuySlippages,
    clients,
  ]);

  // Customer Table Columns with two slippage input fields
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
        <span className="text-gray-700 text-sm">
          {row.user?.phoneNumber || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Buy Slippage (%)',
      accessor: 'buySlipagePercent',
      render: (row: any) => {
        const currentValue = buySlippages[row.id] || '';

        return (
          <div className="relative w-36">
            <input
              type="text"
              value={currentValue}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  handleBuySlippageChange(row.id, value);
                }
              }}
              className="w-full rounded-lg border border-stroke px-3 py-1.5 pr-8 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="Enter %"
              inputMode="decimal"
            />
          </div>
        );
      },
    },
    {
      header: 'Sell Slippage (%)',
      accessor: 'sellSlipagePercent',
      render: (row: any) => {
        const currentValue = sellSlippages[row.id] || '';

        return (
          <div className="relative w-36">
            <input
              type="text"
              value={currentValue}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  handleSellSlippageChange(row.id, value);
                }
              }}
              className="w-full rounded-lg border border-stroke px-3 py-1.5 pr-8 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="Enter %"
              inputMode="decimal"
            />
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
            <h2 className="text-lg font-semibold">Update Customer Slippage</h2>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="text-gray-400 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
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
                    value={applyToAllBuy}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setApplyToAllBuy(value);
                      }
                    }}
                    className="w-32 rounded-lg border border-stroke px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Buy %"
                    inputMode="decimal"
                  />
                  <input
                    type="text"
                    value={applyToAllSell}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setApplyToAllSell(value);
                      }
                    }}
                    className="w-32 rounded-lg border border-stroke px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Sell %"
                    inputMode="decimal"
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
                  onClick={handleSaveAllSlippages}
                  disabled={isSaving || isPending}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${isSaving || isPending
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                >
                  <Database className="h-4 w-4" />
                  <span>
                    {isSaving || isPending ? 'Saving...' : 'Save Changes'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="text-center">
                <div className="mb-2 h-6 w-6 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                <p className="text-gray-500 text-sm">Loading customers...</p>
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
              You are about to update {getChangedCount} customer(s) slippage
              limits. Enter your security PIN to confirm.
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

export default Slippage;