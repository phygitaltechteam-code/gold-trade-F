import React, {useEffect, useState} from 'react';
import {
  Database,
  Clock3,
  ChevronUp,
  ChevronDown,
  Users,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  useGetTradeTime,
  useSetTradingTime,
} from '@/lib/api/masterpanelapi/profile';
import GenericTable from '@/components/Forms/Table/GenericTable';
import toast from 'react-hot-toast';
import {useGetClients} from '@/lib/react-query/client';
import {useUpdateMargin} from '@/lib/api/customerholding';
import { useUpdateMarginMaster } from '@/lib/api/masterpanelapi/customerholding';

const UpdateMargin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deliveryMargins, setDeliveryMargins] = useState<
    Record<string, string>
  >({});
  const [intradayMargins, setIntradayMargins] = useState<
    Record<string, string>
  >({});
  const [originalDeliveryMargins, setOriginalDeliveryMargins] = useState<
    Record<string, string>
  >({});
  const [originalIntradayMargins, setOriginalIntradayMargins] = useState<
    Record<string, string>
  >({});
  const [isSaving, setIsSaving] = useState(false);

  // Apply to All states - Two fields but one button
  const [applyToAllDelivery, setApplyToAllDelivery] = useState<string>('');
  const [applyToAllIntraday, setApplyToAllIntraday] = useState<string>('');

  // PIN Modal State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const {data: clients = [], refetch, isLoading} = useGetClients();
  const {mutate: updateMargin, isPending} = useUpdateMarginMaster();
  useEffect(() => {
    if (clients && clients.length > 0) {
      const delivery: Record<string, string> = {};
      const intraday: Record<string, string> = {};

      clients.forEach((client: any) => {
        // Map deliveryLeverage to delivery margin input
        delivery[client.id] = client.deliveryLeverage?.toString() || '';
        // Map intradayLeverage to intraday margin input
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
      // Only update if value is provided
      if (applyToAllDelivery) {
        updatedDelivery[client.id] = applyToAllDelivery;
      }
      if (applyToAllIntraday) {
        updatedIntraday[client.id] = applyToAllIntraday;
      }
    });

    // Update delivery margins if provided
    if (applyToAllDelivery) {
      setDeliveryMargins((prev) => ({...prev, ...updatedDelivery}));
    }

    // Update intraday margins if provided
    if (applyToAllIntraday) {
      setIntradayMargins((prev) => ({...prev, ...updatedIntraday}));
    }

    // Show success message
    let message = 'Applied ';
    if (applyToAllDelivery && applyToAllIntraday) {
      message += `delivery margin ${applyToAllDelivery} and intraday margin ${applyToAllIntraday} to all customers`;
    } else if (applyToAllDelivery) {
      message += `delivery margin ${applyToAllDelivery} to all customers`;
    } else if (applyToAllIntraday) {
      message += `intraday margin ${applyToAllIntraday} to all customers`;
    }
    toast.success(message);

    // Clear the input fields
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
    // Check if there are any changes
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

      // Only include customers that have changes in either margin
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

    // Show PIN modal instead of saving directly
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

    // Prepare array of customer IDs and their margins
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

      // Only include customers that have changes
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

    // Call the update margin API
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
          // Update original values
          setOriginalDeliveryMargins({...deliveryMargins});
          setOriginalIntradayMargins({...intradayMargins});
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
  const filteredClients = clients.filter((client: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.user?.fullname?.toLowerCase().includes(searchLower) ||
      client.user?.phoneNumber?.includes(searchTerm) ||
      client.CRN?.toLowerCase().includes(searchLower)
    );
  });

  // Check if any changes were made
  const hasChanges = React.useMemo(() => {
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

  // Customer Table Columns with two margin input fields
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
          <div className="relative w-36">
            <input
              type="text"
              value={currentValue}
              name="deliveryMargin"
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
          <div className="relative w-36">
            <input
              type="text"
              value={currentValue}
              name="intradayMargin"
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
      <main className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Customer Margin Table */}
        <section className="overflow-hidden rounded-xl border border-stroke bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col justify-between gap-4 border-b border-stroke pb-4 sm:flex-row sm:items-center">
            <h2 className="text-lg font-semibold">Update Margins</h2>

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
                // Show Apply to All when no changes - Single button for both fields
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={applyToAllDelivery}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setApplyToAllDelivery(value);
                      }
                    }}
                    className="w-32 rounded-lg border border-stroke px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Delivery margin"
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
                    className="w-32 rounded-lg border border-stroke px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Intraday margin"
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
                // Show Save button when changes exist
                <button
                  onClick={handleSaveAllMargins}
                  disabled={isSaving || isPending}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                    isSaving || isPending
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

              {/* Show change count at the bottom when there are changes */}
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

      {/* PIN Modal - Only on Save button click */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Confirm Save Changes
            </h2>

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

export default UpdateMargin;
