import React, { useEffect, useState } from 'react';
import { Database, Clock3, ChevronUp, ChevronDown, Users, Search, CheckCircle, XCircle } from 'lucide-react';
import { useGetTradeTime, useSetTradingTime } from '@/lib/api/masterpanelapi/profile';
import { useGetMasterClients } from '@/lib/api/masterpanelapi/masterapi';
import { useCustomerHolding } from '@/lib/api/masterpanelapi/customerholding';
import GenericTable from '@/components/Forms/Table/GenericTable';
import toast from 'react-hot-toast';

const CustomerHolding = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [stockLimits, setStockLimits] = useState<Record<string, string>>({});
    const [originalStockLimits, setOriginalStockLimits] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [applyToAllLimit, setApplyToAllLimit] = useState<string>('');
    const { data: clients = [], refetch, isLoading } = useGetMasterClients();
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

    // Save all stock limits at once - Send as array
    const handleSaveAllStockLimits = () => {
        setIsSaving(true);

        // Prepare array of customer IDs and their stock limits
        const customers: { customerId: string; stockHoldingLimit: string }[] = [];
        clients.forEach((client: any) => {
            const currentLimit = stockLimits[client.id] || '';
            const originalLimit = originalStockLimits[client.id] || '';
            // Only include customers that have changes
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
        }, {
            onSuccess: () => {
                toast.success(`${customers.length} customer(s) stock holding limits updated successfully!`);
                setOriginalStockLimits({ ...stockLimits });
                refetch();
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
                                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${isSaving || isPending
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

                        </>
                    )}
                </section>
            </main>
        </div>
    );
};

export default CustomerHolding;