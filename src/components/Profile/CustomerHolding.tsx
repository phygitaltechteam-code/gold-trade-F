// import React, { useEffect, useState } from 'react';
// import { Database, Clock3, ChevronUp, ChevronDown, Users, Search, CheckCircle, XCircle } from 'lucide-react';
// import { useGetMasterClients } from '@/lib/api/masterpanelapi/masterapi';
// import GenericTable from '@/components/Forms/Table/GenericTable';
// import toast from 'react-hot-toast';
import { useGetClients } from '@/lib/react-query/client';
import { useCustomerHolding } from '@/lib/api/customerholding';
// import { useGetTradeTime } from '@/lib/react-query/commission';

// const CustomerHolding = () => {
//     const [isEnabled, setIsEnabled] = useState(false);
//     const [isGttEnabled, setIsGttEnabled] = useState(false);
//     const [isStopLossEnabled, setIsStopLossEnabled] = useState(false);
//     const [isLimitEnabled, setIsLimitEnabled] = useState(false);
//     const [isTargetEnabled, setIsTargetEnabled] = useState(false);
//     const [isStopLossTargetEnabled, setIsStopLossTargetEnabled] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [stockLimits, setStockLimits] = useState<Record<string, string>>({});
//     const [originalStockLimits, setOriginalStockLimits] = useState<Record<string, string>>({});
//     const [isSaving, setIsSaving] = useState(false);
//     const [applyToAllLimit, setApplyToAllLimit] = useState<string>('');

//     const { data: tradeData } = useGetTradeTime();
//     console.log('tradeee', tradeData);
//     const { data: clients = [], refetch, isLoading } = useGetClients();
//     const { mutate: saveCustomerHolding, isPending } = useCustomerHolding();

//     useEffect(() => {
//         if (tradeData) {
//             setIsEnabled(tradeData?.holdingStatus);
//             setIsGttEnabled(tradeData?.gttStatus);
//             setIsStopLossEnabled(tradeData?.stoplossStatus);
//             setIsLimitEnabled(tradeData?.limitStatus);
//             setIsTargetEnabled(tradeData?.targetStatus);
//             setIsStopLossTargetEnabled(tradeData?.stoplossAndTargetStatus);
//         }
//     }, [tradeData]);

//     // Initialize stock limits from client data
//     useEffect(() => {
//         if (clients.length > 0) {
//             const limits: Record<string, string> = {};
//             clients.forEach((client: any) => {
//                 limits[client.id] = client.stockHoldingLimit?.toString() || '';
//             });
//             setStockLimits(limits);
//             setOriginalStockLimits(limits);
//         }
//     }, [clients]);

//     const submit = () => {
//         const payload = {
//             holdingStatus: isEnabled,
//             gttStatus: isGttEnabled,
//             stoplossStatus: isStopLossEnabled,
//             limitStatus: isLimitEnabled,
//             targetStatus: isTargetEnabled,
//             stoplossAndTargetStatus: isStopLossTargetEnabled,
//         };

//         console.log('Saving trading time settings:', payload);
//         toast.success('Trading time settings saved successfully!');
//     };

//     const handleStopLossToggle = () => {
//         const newStopLoss = !isStopLossEnabled;
//         setIsStopLossEnabled(newStopLoss);
//         if (!newStopLoss) {
//             setIsStopLossTargetEnabled(false);
//         }
//     };

//     const handleTargetToggle = () => {
//         const newTarget = !isTargetEnabled;
//         setIsTargetEnabled(newTarget);
//         if (!newTarget) {
//             setIsStopLossTargetEnabled(false);
//         }
//     };

//     const handleStopLossTargetToggle = () => {
//         const newValue = !isStopLossTargetEnabled;
//         setIsStopLossTargetEnabled(newValue);
//         if (newValue) {
//             setIsStopLossEnabled(true);
//             setIsTargetEnabled(true);
//         }
//     };

//     // Handle stock limit change for a customer
//     const handleStockLimitChange = (customerId: string, value: string) => {
//         setStockLimits((prev) => ({
//             ...prev,
//             [customerId]: value,
//         }));
//     };

//     // Apply limit to all customers
//     const handleApplyToAll = () => {
//         if (!applyToAllLimit) {
//             toast.error('Please enter a limit value');
//             return;
//         }

//         const limitValue = applyToAllLimit;
//         const updatedLimits: Record<string, string> = {};
//         clients.forEach((client: any) => {
//             updatedLimits[client.id] = limitValue;
//         });
//         setStockLimits(updatedLimits);
//         toast.success(`Applied limit ${limitValue} to all customers`);
//         setApplyToAllLimit('');
//     };

//     // Save all stock limits at once - Send as array
//     const handleSaveAllStockLimits = () => {
//         setIsSaving(true);

//         // Prepare array of customer IDs and their stock limits
//         const customers: { customerId: string; stockHoldingLimit: string }[] = [];
//         clients.forEach((client: any) => {
//             const currentLimit = stockLimits[client.id] || '';
//             const originalLimit = originalStockLimits[client.id] || '';
//             // Only include customers that have changes
//             if (currentLimit !== originalLimit) {
//                 customers.push({
//                     customerId: client.id,
//                     stockHoldingLimit: currentLimit,
//                 });
//             }
//         });

//         if (customers.length === 0) {
//             toast.info('No changes to save');
//             setIsSaving(false);
//             return;
//         }

//         // Save all customers at once - Send array of {customerId, stockHoldingLimit}
//         saveCustomerHolding({
//             customers: customers,
//         }, {
//             onSuccess: () => {
//                 toast.success(`${customers.length} customer(s) stock holding limits updated successfully!`);
//                 setOriginalStockLimits({ ...stockLimits });
//                 refetch();
//             },
//             onError: (error: any) => {
//                 toast.error(error?.response?.data?.message || 'Failed to update stock holding limits');
//             },
//             onSettled: () => {
//                 setIsSaving(false);
//             }
//         });
//     };

//     // Filter clients based on search
//     const filteredClients = clients.filter((client: any) => {
//         const searchLower = searchTerm.toLowerCase();
//         return (
//             client.user?.fullname?.toLowerCase().includes(searchLower) ||
//             client.user?.phoneNumber?.includes(searchTerm) ||
//             client.CRN?.toLowerCase().includes(searchLower)
//         );
//     });

//     // Check if any changes were made
//     const hasChanges = () => {
//         for (const client of clients) {
//             const currentLimit = stockLimits[client.id] || '';
//             const originalLimit = originalStockLimits[client.id] || '';
//             if (currentLimit !== originalLimit) {
//                 return true;
//             }
//         }
//         return false;
//     };

//     // Customer Table Columns
//     const customerColumns = [
//         {
//             header: 'Customer Name',
//             accessor: 'user.fullname',
//             render: (row: any) => (
//                 <div className="flex items-center gap-3">
//                     <div>
//                         <div className="text-sm font-medium text-slate-900">
//                             {row.user?.fullname || 'N/A'}
//                         </div>
                       
//                     </div>
//                 </div>
//             ),
//         },
//         {
//             header: 'Phone Number',
//             accessor: 'user.phoneNumber',
//             render: (row: any) => (
//                 <span className="text-sm text-gray-700">{row.user?.phoneNumber || 'N/A'}</span>
//             ),
//         },
//         {
//             header: 'Stock Holding Limit',
//             accessor: 'stockHoldingLimit',
//             render: (row: any) => {
//                 const currentLimit = stockLimits[row.id] || '';

//                 return (
//                     <input
//                         type="number"
//                         min="0"
//                         value={currentLimit}
//                         onChange={(e) => handleStockLimitChange(row.id, e.target.value)}
//                         className="w-40 rounded-lg border border-stroke px-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
//                         placeholder="Enter limit"
//                     />
//                 );
//             },
//         },
//     ];

//     // Get total number of customers with changes
//     const getChangedCount = () => {
//         let count = 0;
//         for (const client of clients) {
//             const currentLimit = stockLimits[client.id] || '';
//             const originalLimit = originalStockLimits[client.id] || '';
//             if (currentLimit !== originalLimit) {
//                 count++;
//             }
//         }
//         return count;
//     };

//     return (
//         <div className="font-sans min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
//             <main className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

//                 {/* Customer Stock Holding Limit Table */}
//                 <section className="overflow-hidden rounded-xl border border-stroke bg-white p-6 shadow-sm">
//                     <div className="mb-4 flex flex-col justify-between gap-4 border-b border-stroke pb-4 sm:flex-row sm:items-center">
//                         <h2 className="text-lg font-semibold">Customer Stock Holding Limits </h2>

//                         <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
//                             {/* Apply to All Input */}
//                             <div className="flex items-center gap-2">
//                                 <input
//                                     type="number"
//                                     min="0"
//                                     value={applyToAllLimit}
//                                     onChange={(e) => setApplyToAllLimit(e.target.value)}
//                                     className="w-40 rounded-lg border border-stroke px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
//                                     placeholder="Enter limit"
//                                 />
//                                 <button
//                                     onClick={handleApplyToAll}
//                                     className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
//                                 >
//                                     Apply to All
//                                 </button>
//                             </div>

//                             {/* Search Input */}
//                             <div className="relative w-full sm:w-64">
//                                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//                                 <input
//                                     type="text"
//                                     placeholder="Search by name, phone..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     className="w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     {isLoading ? (
//                         <div className="flex h-32 items-center justify-center">
//                             <div className="text-center">
//                                 <div className="mb-2 h-6 w-6 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
//                                 <p className="text-sm text-gray-500">Loading customers...</p>
//                             </div>
//                         </div>
//                     ) : (
//                         <>
//                             <GenericTable
//                                 columns={customerColumns}
//                                 data={filteredClients}
//                                 rowsPerPage={10}
//                                 clickable={false}
//                             />

//                             {/* Save Button on the Right Side with change count */}
//                             <div className="mt-4 flex items-center justify-between">
//                                 <div>
//                                     {hasChanges() && (
//                                         <span className="text-sm text-orange-500">
//                                             {getChangedCount()} customer(s) have unsaved changes
//                                         </span>
//                                     )}
//                                 </div>
//                                 <button
//                                     onClick={handleSaveAllStockLimits}
//                                     disabled={isSaving || isPending }
//                                     className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors ${isSaving || isPending || !hasChanges()
//                                         ? 'bg-gray-400 cursor-not-allowed'
//                                         : 'bg-orange-500 hover:bg-orange-600'
//                                         }`}
//                                 >
//                                     <Database className="h-4 w-4" />
//                                     <span>{isSaving || isPending ? 'Saving...' : 'Save All'}</span>
//                                 </button>
//                             </div>
//                         </>
//                     )}
//                 </section>
//             </main>
//         </div>
//     );
// };

// export default CustomerHolding;



import React, { useEffect, useState } from 'react';
import { Database, Clock3, ChevronUp, ChevronDown, Users, Search, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { useGetTradeTime, useSetTradingTime } from '@/lib/api/masterpanelapi/profile';

import GenericTable from '@/components/Forms/Table/GenericTable';
import toast from 'react-hot-toast';

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
    
      const { data: clients = [], refetch, isLoading } = useGetClients();
    const { mutate: saveCustomerHolding, isPending } = useCustomerHolding();

    // Initialize stock limits from client data
    useEffect(() => {
        if (clients.length > 0) {
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
        // Validate that value is a number (only digits allowed)
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

        // Validate that applyToAllLimit is a number
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
        // Check if there are any changes
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

        // Show PIN modal instead of saving directly
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

        // Prepare array of customer IDs and their stock limits
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

        // Validate all limits before saving
        for (const customer of customers) {
            if (!/^\d+$/.test(customer.stockHoldingLimit)) {
                toast.error('Please ensure all limits are valid numbers');
                setIsSaving(false);
                return;
            }
        }

        // Save all customers at once - Send array of {customerId, stockHoldingLimit}
        saveCustomerHolding({
            customers: customers,
            securityPin: pin,
        }, {
            onSuccess: () => {
                toast.success(`${customers.length} customer(s) stock holding limits updated successfully!`);
                setOriginalStockLimits({ ...stockLimits });
                refetch();
                closeModal();
            },
            onError: (error: any) => {
                toast.error(error?.response?.data?.message || 'Failed to update stock holding limits');
            },
            onSettled: () => {
                setIsSaving(false);
            }
        });
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

    // Check if any changes were made - use useMemo for better performance
    const hasChanges = React.useMemo(() => {
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
            header: 'Stock Holding Limit',
            accessor: 'stockHoldingLimit',
            render: (row: any) => {
                const currentLimit = stockLimits[row.id] || '';

                return (
                    <input
                        type="text"
                        value={currentLimit}
                        onChange={(e) => handleStockLimitChange(row.id, e.target.value)}
                        className="w-40 rounded-lg border border-stroke px-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        placeholder="Enter limit"
                        pattern="[0-9]*"
                        inputMode="numeric"
                    />
                );
            },
        },
    ];

    return (
        <div className="font-sans min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
            <main className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                {/* Customer Stock Holding Limit Table */}
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
                                // Show Apply to All when no changes
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
                                        placeholder="Enter limit"
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
                                // Show Save button when changes exist
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
                            You are about to update {getChangedCount} customer(s) stock holding limits.
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