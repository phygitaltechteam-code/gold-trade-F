import React, { useEffect, useState } from 'react';
import {
  Database,
  Search,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import GenericTable from '@/components/Forms/Table/GenericTable';
import toast from 'react-hot-toast';
import { useGetSlipPageClientsMaster, useUpdateSlippageMaster } from '@/lib/api/masterpanelapi/customerholding';

const SlippageMaster = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sellSlipagePercents, setSellSlipagePercents] = useState<Record<string, string>>({});
  const [buySlipagePercents, setBuySlipagePercents] = useState<Record<string, string>>({});
  const [originalSellSlipagePercents, setOriginalSellSlipagePercents] = useState<Record<string, string>>({});
  const [originalBuySlipagePercents, setOriginalBuySlipagePercents] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Apply to All states
  const [applyToAllSell, setApplyToAllSell] = useState<string>('');
  const [applyToAllBuy, setApplyToAllBuy] = useState<string>('');

  // PIN Modal State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const { data: responseData, refetch, isLoading } = useGetSlipPageClientsMaster();
  const { mutate: updateSlippage, isPending } = useUpdateSlippageMaster();

  // Extract the customers array from the response
  const clients = responseData?.customers || [];

  useEffect(() => {
    if (clients && clients.length > 0) {
      const sell: Record<string, string> = {};
      const buy: Record<string, string> = {};

      clients.forEach((client: any) => {
        sell[client.id] = client.sellSlipagePercent?.toString() || '';
        buy[client.id] = client.buySlipagePercent?.toString() || '';
      });

      setSellSlipagePercents(sell);
      setBuySlipagePercents(buy);
      setOriginalSellSlipagePercents(sell);
      setOriginalBuySlipagePercents(buy);
    }
  }, [clients]);

  // Handle sell slippage change
  const handleSellSlipagePercentChange = (customerId: string, value: string) => {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
      toast.error('Please enter a valid number');
      return;
    }
    setSellSlipagePercents((prev) => ({
      ...prev,
      [customerId]: value,
    }));
  };

  // Handle buy slippage change
  const handleBuySlipagePercentChange = (customerId: string, value: string) => {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
      toast.error('Please enter a valid number');
      return;
    }
    setBuySlipagePercents((prev) => ({
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
      setSellSlipagePercents((prev) => ({ ...prev, ...updatedSell }));
    }

    if (applyToAllBuy) {
      setBuySlipagePercents((prev) => ({ ...prev, ...updatedBuy }));
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
    const customers: {
      customerId: string;
      sellSlipagePercent: number;
      buySlipagePercent: number;
    }[] = [];

    clients.forEach((client: any) => {
      const currentSell = sellSlipagePercents[client.id] || '';
      const originalSell = originalSellSlipagePercents[client.id] || '';
      const currentBuy = buySlipagePercents[client.id] || '';
      const originalBuy = originalBuySlipagePercents[client.id] || '';

      if (
        currentSell !== originalSell ||
        currentBuy !== originalBuy
      ) {
        customers.push({
          customerId: client.id,
          sellSlipagePercent: parseFloat(currentSell) || 0,
          buySlipagePercent: parseFloat(currentBuy) || 0,
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
      sellSlipagePercent: number;
      buySlipagePercent: number;
    }[] = [];

    clients.forEach((client: any) => {
      const currentSell = sellSlipagePercents[client.id] || '0';
      const originalSell = originalSellSlipagePercents[client.id] || '0';
      const currentBuy = buySlipagePercents[client.id] || '0';
      const originalBuy = originalBuySlipagePercents[client.id] || '0';

      if (
        currentSell !== originalSell ||
        currentBuy !== originalBuy
      ) {
        customers.push({
          customerId: client.id,
          sellSlipagePercent: parseFloat(currentSell) || 0,
          buySlipagePercent: parseFloat(currentBuy) || 0,
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
          setOriginalSellSlipagePercents({ ...sellSlipagePercents });
          setOriginalBuySlipagePercents({ ...buySlipagePercents });
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
        client.user?.email?.toLowerCase().includes(searchLower) ||
        client.id?.toLowerCase().includes(searchLower)
      );
    });
  }, [clients, searchTerm]);

  // Check if any changes were made
  const hasChanges = React.useMemo(() => {
    if (!Array.isArray(clients)) return false;
    for (const client of clients) {
      const currentSell = sellSlipagePercents[client.id] || '';
      const originalSell = originalSellSlipagePercents[client.id] || '';
      const currentBuy = buySlipagePercents[client.id] || '';
      const originalBuy = originalBuySlipagePercents[client.id] || '';

      if (
        currentSell !== originalSell ||
        currentBuy !== originalBuy
      ) {
        return true;
      }
    }
    return false;
  }, [
    sellSlipagePercents,
    buySlipagePercents,
    originalSellSlipagePercents,
    originalBuySlipagePercents,
    clients,
  ]);

  // Get total number of customers with changes
  const getChangedCount = React.useMemo(() => {
    if (!Array.isArray(clients)) return 0;
    let count = 0;
    for (const client of clients) {
      const currentSell = sellSlipagePercents[client.id] || '';
      const originalSell = originalSellSlipagePercents[client.id] || '';
      const currentBuy = buySlipagePercents[client.id] || '';
      const originalBuy = originalBuySlipagePercents[client.id] || '';

      if (
        currentSell !== originalSell ||
        currentBuy !== originalBuy
      ) {
        count++;
      }
    }
    return count;
  }, [
    sellSlipagePercents,
    buySlipagePercents,
    originalSellSlipagePercents,
    originalBuySlipagePercents,
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
        const currentValue = buySlipagePercents[row.id] || '';

        return (
          <div className="relative w-full min-w-[100px] max-w-[140px]">
            <input
              type="text"
              value={currentValue}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  handleBuySlipagePercentChange(row.id, value);
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
        const currentValue = sellSlipagePercents[row.id] || '';

        return (
          <div className="relative w-full min-w-[100px] max-w-[140px]">
            <input
              type="text"
              value={currentValue}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  handleSellSlipagePercentChange(row.id, value);
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
      <main className="mx-auto max-w-7xl space-y-4 px-3 py-3 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <section className="overflow-hidden rounded-xl border border-stroke bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-4 border-b border-stroke pb-4">
            {/* Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold sm:text-lg">Customer Slippage</h2>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3">
              {/* Search and Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <div className="relative w-full sm:w-56 md:w-64">
                  <Search className="text-gray-400 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by name, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {!hasChanges ? (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={applyToAllBuy}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                              setApplyToAllBuy(value);
                            }
                          }}
                          className="w-24 rounded-lg border border-stroke px-2 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 sm:w-28 md:w-32"
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
                          className="w-24 rounded-lg border border-stroke px-2 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 sm:w-28 md:w-32"
                          placeholder="Sell %"
                          inputMode="decimal"
                        />
                        <button
                          onClick={handleApplyToAll}
                          className="whitespace-nowrap rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 sm:px-4"
                        >
                          Apply to All
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={handleSaveAllSlippages}
                      disabled={isSaving || isPending}
                      className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors sm:w-auto sm:px-4 ${isSaving || isPending
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
              <div className="overflow-x-auto">
                <GenericTable
                  columns={customerColumns}
                  data={filteredClients}
                  rowsPerPage={10}
                  clickable={false}
                />
              </div>

              {hasChanges && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg sm:p-6">
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
                Confirm Save Changes
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

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
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <button
                onClick={closeModal}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmSave}
                disabled={isSaving || isPending}
                className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50 sm:w-auto"
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

export default SlippageMaster;