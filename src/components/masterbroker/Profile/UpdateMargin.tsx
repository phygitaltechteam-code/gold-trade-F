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
import { useGetClients } from '@/lib/react-query/client';
import { useUpdateMarginMaster } from '@/lib/api/masterpanelapi/customerholding';

const UpdateMargin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deliveryMargins, setDeliveryMargins] = useState<Record<string, string>>({});
  const [intradayMargins, setIntradayMargins] = useState<Record<string, string>>({});
  const [originalDeliveryMargins, setOriginalDeliveryMargins] = useState<Record<string, string>>({});
  const [originalIntradayMargins, setOriginalIntradayMargins] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Apply to All states
  const [applyToAllDelivery, setApplyToAllDelivery] = useState<string>('');
  const [applyToAllIntraday, setApplyToAllIntraday] = useState<string>('');

  // PIN Modal State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const { data: responseData, refetch, isLoading } = useGetClients();
  const { mutate: updateMargin, isPending } = useUpdateMarginMaster();

  // Extract clients array from response - handle different response structures
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
      const delivery: Record<string, string> = {};
      const intraday: Record<string, string> = {};

      clients.forEach((client: any) => {
        delivery[client.id] = client.deliveryLeverage?.toString() || '';
        intraday[client.id] = client.intradayLeverage?.toString() || '';
      });

      setDeliveryMargins(delivery);
      setIntradayMargins(intraday);
      setOriginalDeliveryMargins(delivery);
      setOriginalIntradayMargins(intraday);
    }
  }, [clients]);

  // Handle delivery margin change
  const handleDeliveryMarginChange = (customerId: string, value: string) => {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
      toast.error('Please enter a valid number');
      return;
    }
    setDeliveryMargins((prev) => ({
      ...prev,
      [customerId]: value,
    }));
  };

  // Handle intraday margin change
  const handleIntradayMarginChange = (customerId: string, value: string) => {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
      toast.error('Please enter a valid number');
      return;
    }
    setIntradayMargins((prev) => ({
      ...prev,
      [customerId]: value,
    }));
  };

  // Apply both Delivery and Intraday limits to all customers at once
  const handleApplyToAll = () => {
    if (!applyToAllDelivery && !applyToAllIntraday) {
      toast.error('Please enter at least one margin value');
      return;
    }

    if (applyToAllDelivery && !/^\d*\.?\d*$/.test(applyToAllDelivery)) {
      toast.error('Please enter a valid delivery margin number');
      return;
    }

    if (applyToAllIntraday && !/^\d*\.?\d*$/.test(applyToAllIntraday)) {
      toast.error('Please enter a valid intraday margin number');
      return;
    }

    const updatedDelivery: Record<string, string> = {};
    const updatedIntraday: Record<string, string> = {};

    clients.forEach((client: any) => {
      if (applyToAllDelivery) {
        updatedDelivery[client.id] = applyToAllDelivery;
      }
      if (applyToAllIntraday) {
        updatedIntraday[client.id] = applyToAllIntraday;
      }
    });

    if (applyToAllDelivery) {
      setDeliveryMargins((prev) => ({ ...prev, ...updatedDelivery }));
    }

    if (applyToAllIntraday) {
      setIntradayMargins((prev) => ({ ...prev, ...updatedIntraday }));
    }

    let message = 'Applied ';
    if (applyToAllDelivery && applyToAllIntraday) {
      message += `delivery margin ${applyToAllDelivery} and intraday margin ${applyToAllIntraday} to all customers`;
    } else if (applyToAllDelivery) {
      message += `delivery margin ${applyToAllDelivery} to all customers`;
    } else if (applyToAllIntraday) {
      message += `intraday margin ${applyToAllIntraday} to all customers`;
    }
    toast.success(message);

    setApplyToAllDelivery('');
    setApplyToAllIntraday('');
  };

  const closeModal = () => {
    setShowPinModal(false);
    setPin('');
    setShowPin(false);
  };

  // Save all margins at once - Show PIN popup first
  const handleSaveAllMargins = () => {
    const customers: {
      customerId: string;
      deliveryMargin: string;
      intradayMargin: string;
    }[] = [];

    clients.forEach((client: any) => {
      const currentDelivery = deliveryMargins[client.id] || '';
      const originalDelivery = originalDeliveryMargins[client.id] || '';
      const currentIntraday = intradayMargins[client.id] || '';
      const originalIntraday = originalIntradayMargins[client.id] || '';

      if (
        currentDelivery !== originalDelivery ||
        currentIntraday !== originalIntraday
      ) {
        customers.push({
          customerId: client.id,
          deliveryMargin: currentDelivery || '0',
          intradayMargin: currentIntraday || '0',
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
      deliveryMargin: string;
      intradayMargin: string;
    }[] = [];

    clients.forEach((client: any) => {
      const currentDelivery = deliveryMargins[client.id] || '0';
      const originalDelivery = originalDeliveryMargins[client.id] || '0';
      const currentIntraday = intradayMargins[client.id] || '0';
      const originalIntraday = originalIntradayMargins[client.id] || '0';

      if (
        currentDelivery !== originalDelivery ||
        currentIntraday !== originalIntraday
      ) {
        customers.push({
          customerId: client.id,
          deliveryMargin: currentDelivery,
          intradayMargin: currentIntraday,
        });
      }
    });

    if (customers.length === 0) {
      toast.info('No changes to save');
      closeModal();
      return;
    }

    updateMargin(
      {
        customers: customers,
        securityPin: pin,
      },
      {
        onSuccess: () => {
          toast.success(
            `Successfully updated margins for ${customers.length} customer(s)`,
          );
          setOriginalDeliveryMargins({ ...deliveryMargins });
          setOriginalIntradayMargins({ ...intradayMargins });
          closeModal();
          refetch();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || 'Failed to update margins',
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
      const currentDelivery = deliveryMargins[client.id] || '';
      const originalDelivery = originalDeliveryMargins[client.id] || '';
      const currentIntraday = intradayMargins[client.id] || '';
      const originalIntraday = originalIntradayMargins[client.id] || '';

      if (
        currentDelivery !== originalDelivery ||
        currentIntraday !== originalIntraday
      ) {
        return true;
      }
    }
    return false;
  }, [
    deliveryMargins,
    intradayMargins,
    originalDeliveryMargins,
    originalIntradayMargins,
    clients,
  ]);

  // Get total number of customers with changes
  const getChangedCount = React.useMemo(() => {
    if (!Array.isArray(clients)) return 0;
    let count = 0;
    for (const client of clients) {
      const currentDelivery = deliveryMargins[client.id] || '';
      const originalDelivery = originalDeliveryMargins[client.id] || '';
      const currentIntraday = intradayMargins[client.id] || '';
      const originalIntraday = originalIntradayMargins[client.id] || '';

      if (
        currentDelivery !== originalDelivery ||
        currentIntraday !== originalIntraday
      ) {
        count++;
      }
    }
    return count;
  }, [
    deliveryMargins,
    intradayMargins,
    originalDeliveryMargins,
    originalIntradayMargins,
    clients,
  ]);

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
        <span className="text-gray-700 text-sm">
          {row.user?.phoneNumber || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Delivery Margin',
      accessor: 'deliveryMargin',
      render: (row: any) => {
        const currentValue = deliveryMargins[row.id] || '';

        return (
          <div className="relative w-full min-w-[100px] max-w-[140px]">
            <input
              type="text"
              value={currentValue}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  handleDeliveryMarginChange(row.id, value);
                }
              }}
              className="w-full rounded-lg border border-stroke px-3 py-1.5 pr-8 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="Enter margin"
              inputMode="decimal"
            />
          </div>
        );
      },
    },
    {
      header: 'Intraday Margin',
      accessor: 'intradayMargin',
      render: (row: any) => {
        const currentValue = intradayMargins[row.id] || '';

        return (
          <div className="relative w-full min-w-[100px] max-w-[140px]">
            <input
              type="text"
              value={currentValue}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  handleIntradayMarginChange(row.id, value);
                }
              }}
              className="w-full rounded-lg border border-stroke px-3 py-1.5 pr-8 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="Enter margin"
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
              <h2 className="text-base font-semibold sm:text-lg">Update Margins</h2>
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
                    placeholder="Search by name, phone..."
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
                          value={applyToAllDelivery}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                              setApplyToAllDelivery(value);
                            }
                          }}
                          className="w-24 rounded-lg border border-stroke px-2 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 sm:w-28 md:w-32"
                          placeholder="Delivery"
                          inputMode="decimal"
                        />
                        <input
                          type="text"
                          value={applyToAllIntraday}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                              setApplyToAllIntraday(value);
                            }
                          }}
                          className="w-24 rounded-lg border border-stroke px-2 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 sm:w-28 md:w-32"
                          placeholder="Intraday"
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
                      onClick={handleSaveAllMargins}
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
              You are about to update {getChangedCount} customer(s) margin
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

export default UpdateMargin;