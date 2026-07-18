import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Filter,
    X,
    RefreshCcw,
    Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GenericTable from '@/components/Forms/Table/GenericTable';

import { MdTrendingUp, MdWarning, MdAdd } from 'react-icons/md';
import StatsCard from '../wallettopupreport/StatsCard';
import { useGetDepositeCompany } from '@/lib/react-query/withdrawal';

// Types
interface DepositRequest {
    id: string;
    requestId: string;
    date: string;
    time: string;
    customerName: string;
    amount: number;
    type: string;
    balanceAfter: number;
    notes: string;
    createdAt: string;
}

export default function DepositeCompany() {
    const queryClient = useQueryClient();
    const { data: deposits, refetch } = useGetDepositeCompany();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const itemsPerPage = 5;

    // Date filter states
    const [fromDate, setFromDate] = useState(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString().split('T')[0];
    });
    const [toDate, setToDate] = useState(() => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return today.toISOString().split('T')[0];
    });

    // Format currency in Indian format
    const formatIndianCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Format date and time
    const formatDateTime = (dateTime: string) => {
        if (!dateTime) return 'N/A';

        const date = new Date(dateTime);
        if (isNaN(date.getTime())) return 'N/A';

        const formattedDate = date.toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        const formattedTime = date.toLocaleString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });

        return { date: formattedDate, time: formattedTime };
    };

    // Date filtering logic
    const filterByDate = (dateString: string) => {
        if (!dateString) return false;

        const date = new Date(dateString);
        date.setHours(0, 0, 0, 0);

        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);

        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);

        return date >= from && date <= to;
    };

    // Transform API data
    const MOCK_DATA = useMemo(() => {
        return deposits?.map((item: any, index: number) => ({
            id: item.id,
            requestId: `DEP${String(index + 1).padStart(3, '0')}`,
            date: item.createdAt || new Date().toISOString().split('T')[0],
            time: item.createdAt || new Date().toISOString(),
            customerName: item.customer?.user?.fullname || 'N/A',
            amount: typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount || 0,
            type: item.type || 'CREDIT',
            balanceAfter: typeof item.balanceAfter === 'string' ? parseFloat(item.balanceAfter) : item.balanceAfter || 0,
            notes: item.Notes || '-',
            createdAt: item.createdAt,
            customer: item.customer,
        })) || [];
    }, [deposits]);

    // Filter data based on search and date
    const filteredData = useMemo(() => {
        return MOCK_DATA?.filter((req) => {
            const matchesSearch =
                searchTerm === '' ||
                req.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.amount.toString().includes(searchTerm);

            const matchesDate = filterByDate(req.date);

            return matchesSearch && matchesDate;
        });
    }, [MOCK_DATA, searchTerm, fromDate, toDate]);

    // Calculate period stats (Today, Week, Month)
    const getPeriodStats = (period: 'today' | 'week' | 'month') => {
        const now = new Date();
        const periodData = MOCK_DATA?.filter((req) => {
            const reqDate = new Date(req.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);

            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            switch (period) {
                case 'today':
                    return reqDate >= today;
                case 'week':
                    return reqDate >= weekStart;
                case 'month':
                    return reqDate >= monthStart;
                default:
                    return true;
            }
        });

        const totalAmount = periodData?.reduce((sum, r) => sum + r.amount, 0) || 0;
        const count = periodData?.length || 0;

        return { totalAmount, count };
    };

    // Calculate stats
    const stats = useMemo(() => {
        const totalDepositAmount = MOCK_DATA?.reduce((sum, r) => sum + r.amount, 0) || 0;
        const totalCount = MOCK_DATA?.length || 0;

        const todayStats = getPeriodStats('today');
        const weekStats = getPeriodStats('week');
        const monthStats = getPeriodStats('month');

        const filteredTotalAmount = filteredData?.reduce((sum, r) => sum + r.amount, 0) || 0;
        const filteredTotalCount = filteredData?.length || 0;

        return {
            totalDepositAmount,
            totalCount,
            todayStats,
            weekStats,
            monthStats,
            filteredTotalAmount,
            filteredTotalCount,
        };
    }, [MOCK_DATA, filteredData]);

    // Table columns
    const columns = [
        {
            header: 'Date',
            accessor: (row: DepositRequest) => {
                const formatted = formatDateTime(row.date);
                return (
                    <div>
                        <div className="text-gray-600 text-sm">{formatted?.date || 'N/A'}</div>
                        <div className="text-gray-400 text-xs">{formatted?.time || ''}</div>
                    </div>
                );
            },
        },
        {
            header: 'Customer Name',
            accessor: (row: DepositRequest) => (
                <div className="text-gray-900 text-sm font-semibold">
                    {row?.customerName}
                </div>
            ),
        },
        {
            header: 'Amount',
            accessor: (row: DepositRequest) => (
                <div className="text-left text-sm font-bold text-green-600">
                    {formatIndianCurrency(row.amount)}
                </div>
            ),
        },
        // {
        //     header: 'Type',
        //     accessor: (row: DepositRequest) => (
        //         <span className="inline-block whitespace-nowrap rounded-md bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 text-[10px] font-bold uppercase">
        //             {row.type || 'CREDIT'}
        //         </span>
        //     ),
        // },
        {
            header: 'Balance After',
            accessor: (row: DepositRequest) => (
                <div className="text-gray-900 text-sm font-bold">
                    {formatIndianCurrency(row.balanceAfter)}
                </div>
            ),
        },
        // {
        //     header: 'Notes',
        //     accessor: (row: DepositRequest) => (
        //         <div className="text-gray-600 text-sm">
        //             {row.notes || '-'}
        //         </div>
        //     ),
        // },
    ];

    // Stats Card data
    const periodCardData = [
        {
            title: "Total Deposit Amount",
            value: formatIndianCurrency(stats.totalDepositAmount),
            change: `${stats.totalCount} total deposits`,
            changeType: "neutral",
            note: "all time",
            icon: MdTrendingUp
        },
        {
            title: "Today",
            value: formatIndianCurrency(stats.todayStats.totalAmount),
            change: `${stats.todayStats.count} deposits today`,
            changeType: "neutral",
            note: "today",
            icon: MdAdd
        },
        {
            title: "This Week",
            value: formatIndianCurrency(stats.weekStats.totalAmount),
            change: `${stats.weekStats.count} deposits this week`,
            changeType: "warning",
            note: "this week",
            icon: MdWarning
        },
        {
            title: "This Month",
            value: formatIndianCurrency(stats.monthStats.totalAmount),
            change: `${stats.monthStats.count} deposits this month`,
            changeType: "neutral",
            note: "this month",
            icon: MdTrendingUp
        }
    ];

    return (
        <div className="font-sans min-h-screen bg-[#F8F9FB] text-[#1A1D21]">
            <main className="mx-auto max-w-[2000px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                {/* Header */}
                <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                            Deposit Reports
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="relative flex-1 sm:flex-none">
                            <Search className="text-gray-400 absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Search Customer, Amount..."
                                className="w-full rounded-lg border border-stroke bg-white py-2 pl-10 pr-4 text-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 sm:w-64"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                >
                                    <X className="text-gray-400 hover:text-gray-600 h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 flex items-center gap-1"
                        >
                            <RefreshCcw size={16} /> Refresh
                        </button>
                    </div>
                </div>

                {/* Period Summary Cards */}
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {periodCardData.map((card, index) => (
                        <StatsCard
                            key={index}
                            title={card.title}
                            value={card.value}
                            change={card.change}
                            changeType={card.changeType}
                            note={card.note}
                            icon={card.icon}
                        />
                    ))}
                </div>

                {/* Date Filter Row */}
                <div className="mb-4 flex flex-wrap items-center gap-4 bg-white rounded-lg border border-stroke p-3">
                    <div className="flex items-center gap-2">
                        <Calendar className="text-gray-500 h-5 w-5" />
                        <span className="text-sm font-medium text-gray-700">Date Range:</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="rounded-lg border border-stroke px-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        />
                        <span className="text-gray-400 text-sm font-medium">to</span>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="rounded-lg border border-stroke px-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        />
                    </div>

                    <button
                        onClick={() => {
                            const today = new Date();
                            const todayStr = today.toISOString().split('T')[0];
                            setFromDate(todayStr);
                            setToDate(todayStr);
                        }}
                        className="text-xs font-medium text-orange-500 hover:text-orange-600 hover:underline"
                    >
                        Today
                    </button>

                    <button
                        onClick={() => {
                            const today = new Date();
                            const weekAgo = new Date(today);
                            weekAgo.setDate(today.getDate() - 7);
                            setFromDate(weekAgo.toISOString().split('T')[0]);
                            setToDate(today.toISOString().split('T')[0]);
                        }}
                        className="text-xs font-medium text-orange-500 hover:text-orange-600 hover:underline"
                    >
                        Last 7 Days
                    </button>

                    <button
                        onClick={() => {
                            const today = new Date();
                            const monthAgo = new Date(today);
                            monthAgo.setMonth(today.getMonth() - 1);
                            setFromDate(monthAgo.toISOString().split('T')[0]);
                            setToDate(today.toISOString().split('T')[0]);
                        }}
                        className="text-xs font-medium text-orange-500 hover:text-orange-600 hover:underline"
                    >
                        Last 30 Days
                    </button>

                    {/* Mobile Filter Button */}
                    <button
                        onClick={() => setShowMobileFilter(!showMobileFilter)}
                        className="hover:bg-gray-50 rounded-lg border border-stroke bg-white p-2 transition-colors sm:hidden ml-auto"
                    >
                        <Filter className="text-gray-600 h-4 w-4" />
                    </button>
                </div>

                {/* Mobile Filter Panel */}
                <AnimatePresence>
                    {showMobileFilter && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gray-50/50 border-b border-stroke p-4 mb-4 rounded-lg sm:hidden"
                        >
                            <h3 className="text-gray-400 mb-2 text-xs font-bold">
                                Quick Filters
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {['High Value', 'Today', 'Yesterday'].map((filter) => (
                                    <button
                                        key={filter}
                                        className="hover:bg-gray-50 rounded-full border border-stroke bg-white px-3 py-1 text-xs font-medium"
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                <div className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm">
                    <div className="px-4 py-3 border-b border-stroke">
                        <h2 className="text-sm font-semibold text-gray-700">
                            Deposit History
                            {/* <span className="ml-2 text-gray-400 text-xs font-normal">
                                ({filteredData?.length || 0} records)
                            </span> */}
                        </h2>
                    </div>

                    {/* Generic Table */}
                    <GenericTable
                        data={filteredData}
                        columns={columns}
                        rowsPerPage={itemsPerPage}
                        paginationOff={false}
                    />
                </div>
            </main>
        </div>
    );
}